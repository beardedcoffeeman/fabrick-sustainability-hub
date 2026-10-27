#!/usr/bin/env python3
"""
EPC retrofit-market ingest: EVERY domestic certificate in England and Wales.

Replaces the old postcode-sampling ingest (scripts/ingest-epc.ts, removed
27 Oct 2026). That script built city figures from 8-12 hand-picked postcodes
per city; some cities rested on fewer than 60 homes and were out by 30 points
against the full register. This script uses the whole register instead.

What it does
  1. Downloads the MHCLG domestic full-load zip (every certificate lodged in
     England and Wales since 2008, ~8 GB, refreshed monthly) from
     /api/files/domestic/csv using EPC_API_TOKEN. The endpoint 303-redirects to
     a short-lived presigned S3 URL, so curl must follow immediately.
  2. Streams each certificates-YYYY.csv out of the zip with `unzip -p` and keeps
     four integer-encoded columns per certificate (about 15 bytes each), so
     30m+ certificates fit comfortably in a few GB of RAM.
  3. Keeps the LATEST certificate per property (UPRN; address + postcode when
     UPRN is missing), the same basis the ONS uses for its local authority
     EPC statistics.
  4. Counts bands A-G per local authority (ONS council list + names from
     src/data/la-regions.json; superseded GSS codes folded into their current
     council) and writes src/data/epc-snapshot.json.

Usage
  python3 scripts/ingest-epc-bulk.py                 # download to a temp dir, run, delete
  python3 scripts/ingest-epc-bulk.py --zip path.zip  # reuse an existing download
  python3 scripts/ingest-epc-bulk.py --keep-zip      # keep the download afterwards

Needs: python3 with numpy + pandas, `unzip` on PATH, `curl` on PATH,
EPC_API_TOKEN in the environment or .env.local.
"""
import argparse
import datetime as dt
import json
import os
import subprocess
import sys
import tempfile
import time
import zipfile

import numpy as np
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_FILE = os.path.join(ROOT, "src", "data", "epc-snapshot.json")
REGIONS_FILE = os.path.join(ROOT, "src", "data", "la-regions.json")
ENV_FILE = os.path.join(ROOT, ".env.local")
API_URL = "https://api.get-energy-performance-data.communities.gov.uk/api/files/domestic/csv"

USE_COLS = ["uprn", "address", "postcode", "lodgement_date", "current_energy_rating", "local_authority"]
BANDS = ["A", "B", "C", "D", "E", "F", "G"]
BAND_INDEX = {b: i for i, b in enumerate(BANDS)}
INVALID_BAND = len(BANDS)  # anything that is not A-G


def log(msg: str) -> None:
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def load_env() -> None:
    if not os.path.exists(ENV_FILE):
        return
    with open(ENV_FILE, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k, v = k.strip(), v.strip().strip('"').strip("'")
            os.environ.setdefault(k, v)


def download(dest: str, token: str) -> None:
    """curl follows the 303 to S3 and (by default) drops the Authorization
    header on the cross-host redirect, which is what the presigned URL needs."""
    for attempt in range(1, 4):
        log(f"downloading full-load zip (attempt {attempt})")
        cmd = [
            "curl", "-sS", "-L", "--fail", "--retry", "2",
            "-H", f"Authorization: Bearer {token}",
            "-H", "Accept: application/zip",
            "-o", dest, API_URL,
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0 and os.path.getsize(dest) > 1_000_000_000 and zipfile.is_zipfile(dest):
            log(f"downloaded {os.path.getsize(dest) / 1e9:.2f} GB")
            return
        log(f"download failed: rc={res.returncode} {res.stderr.strip()[:300]}")
        time.sleep(30)
    sys.exit("could not download the EPC full-load zip")


class Encoder:
    """String -> small int, shared across chunks."""

    def __init__(self) -> None:
        self.map: dict[str, int] = {}
        self.names: list[str] = []

    def encode(self, s: pd.Series) -> np.ndarray:
        s = s.fillna("Unknown").astype(str)
        for u in s.unique():
            if u not in self.map:
                self.map[u] = len(self.names)
                self.names.append(u)
        return s.map(self.map).astype(np.int16).values


def stream_zip(zip_path: str):
    names = sorted(n for n in zipfile.ZipFile(zip_path).namelist() if n.startswith("certificates-") and n.endswith(".csv"))
    if not names:
        sys.exit("zip has no certificates-YYYY.csv members; layout changed?")
    la_enc = Encoder()
    keys, lodged, las, bands = [], [], [], []
    total = 0
    epoch = pd.Timestamp("2000-01-01")
    for name in names:
        proc = subprocess.Popen(["unzip", "-p", zip_path, name], stdout=subprocess.PIPE)
        for chunk in pd.read_csv(proc.stdout, usecols=USE_COLS, dtype=str, chunksize=500_000,
                                 low_memory=False, encoding="utf-8", encoding_errors="replace"):
            u = pd.to_numeric(chunk["uprn"], errors="coerce")
            addr_hash = pd.util.hash_pandas_object(
                chunk["address"].fillna("").str.upper().str.strip() + "|" + chunk["postcode"].fillna("").str.upper().str.replace(" ", ""),
                index=False,
            ).astype(np.int64)
            key = np.where(u.notna(), u.fillna(0).astype(np.int64).values, -np.abs(addr_hash.values) - 1)
            days = (pd.to_datetime(chunk["lodgement_date"], errors="coerce", format="%Y-%m-%d") - epoch).dt.days
            keys.append(key)
            lodged.append(days.fillna(-1).astype(np.int32).values)
            las.append(la_enc.encode(chunk["local_authority"]))
            bands.append(chunk["current_energy_rating"].fillna("").str.strip().str.upper().map(BAND_INDEX).fillna(INVALID_BAND).astype(np.int8).values)
            total += len(chunk)
        proc.stdout.close()
        proc.wait()
        log(f"{name}: {total:,} certificates so far")
    return (np.concatenate(keys), np.concatenate(lodged), np.concatenate(las), np.concatenate(bands), la_enc.names)


def latest_per_property(keys, lodged):
    """Indices of the most recently lodged certificate for each property key."""
    order = np.lexsort((lodged, keys))  # sort by key, then lodgement date
    sorted_keys = keys[order]
    is_last = np.ones(len(order), dtype=bool)
    is_last[:-1] = sorted_keys[:-1] != sorted_keys[1:]
    return order[is_last]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--zip", help="existing full-load zip to reuse instead of downloading")
    ap.add_argument("--keep-zip", action="store_true", help="keep the downloaded zip")
    args = ap.parse_args()
    load_env()

    t0 = time.time()
    tmpdir = None
    zip_path = args.zip
    if not zip_path:
        token = os.environ.get("EPC_API_TOKEN")
        if not token:
            sys.exit("EPC_API_TOKEN not set (environment or .env.local)")
        tmpdir = tempfile.mkdtemp(prefix="epc-bulk-")
        zip_path = os.path.join(tmpdir, "domestic.zip")
        download(zip_path, token)

    with open(REGIONS_FILE, encoding="utf-8") as fh:
        councils_meta = json.load(fh)["councils"]
    canonical = {}
    for code, meta in councils_meta.items():
        canonical[code] = code
        for alias in meta.get("aliases", []):
            canonical[alias] = code

    keys, lodged, las, bands, la_names = stream_zip(zip_path)
    n_certs = len(keys)
    log(f"total certificates {n_certs:,} ({time.time() - t0:.0f}s)")

    keep = latest_per_property(keys, lodged)
    las, bands, lodged = las[keep], bands[keep], lodged[keep]
    n_props = len(keep)
    log(f"unique properties {n_props:,} ({time.time() - t0:.0f}s)")
    del keys, keep

    data_to = (pd.Timestamp("2000-01-01") + pd.Timedelta(days=int(lodged.max()))).date().isoformat()

    # band counts per (encoded LA, band) in one pass
    cell = las.astype(np.int64) * (INVALID_BAND + 1) + bands.astype(np.int64)
    counts = np.bincount(cell, minlength=len(la_names) * (INVALID_BAND + 1)).reshape(len(la_names), INVALID_BAND + 1)

    per_council: dict[str, np.ndarray] = {}
    excluded = {"invalidBand": int(counts[:, INVALID_BAND].sum()), "outsideEnglandWales": 0, "unknownCouncil": 0}
    for i, raw_code in enumerate(la_names):
        row = counts[i, :INVALID_BAND]
        code = canonical.get(raw_code)
        if code is None:
            if raw_code.startswith(("S", "N")):
                excluded["outsideEnglandWales"] += int(row.sum())
            else:
                excluded["unknownCouncil"] += int(row.sum())
            continue
        per_council[code] = per_council.get(code, np.zeros(INVALID_BAND, dtype=np.int64)) + row

    def pct(part: int, whole: int) -> float:
        return round(100.0 * part / whole, 2) if whole else 0.0

    def summarise(row: np.ndarray) -> dict:
        total = int(row.sum())
        bc = {b: int(row[i]) for i, b in enumerate(BANDS)}
        below = bc["D"] + bc["E"] + bc["F"] + bc["G"]
        urgent = bc["E"] + bc["F"] + bc["G"]
        return {
            "total": total,
            "bandCounts": bc,
            "belowCPct": pct(below, total),
            "urgentPct": pct(urgent, total),
            "compliantPct": pct(total - below, total),
        }

    councils = []
    for code, row in per_council.items():
        meta = councils_meta[code]
        councils.append({"council": meta["name"], "code": code, "region": meta["region"], **summarise(row)})
    councils.sort(key=lambda c: (-c["belowCPct"], c["council"]))
    missing = sorted(set(councils_meta) - set(per_council))
    if missing:
        log(f"WARNING: no certificates for {len(missing)} councils: {missing}")

    national = summarise(sum(per_council.values()))
    snapshot = {
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "method": "full-register",
        "source": "MHCLG Energy Performance of Buildings register, domestic full-load download (api.get-energy-performance-data.communities.gov.uk/api/files/domestic/csv)",
        "dataTo": data_to,
        "certificatesProcessed": n_certs,
        "propertiesCounted": national["total"],
        "excluded": excluded,
        "notes": [
            "Every domestic certificate lodged in England and Wales since 2008; the latest certificate per property is counted (UPRN, or address + postcode where UPRN is missing). Same basis as the ONS local authority EPC statistics.",
            "England and Wales only. Scotland and Northern Ireland use separate registers.",
            "Covers homes that have an EPC (sold, let or assessed since 2008), roughly four in five dwellings. Homes never assessed are not counted.",
            "Below-C share covers bands D, E, F, G. Band D is currently MEES-compliant; the 2027/2030 proposals bring D into scope.",
            "Council names and regions follow the ONS local authority list; superseded GSS codes are folded into the current council.",
        ],
        "national": national,
        "councils": councils,
    }
    with open(OUT_FILE, "w", encoding="utf-8") as fh:
        json.dump(snapshot, fh, indent=1)
    log(f"wrote {OUT_FILE}: {len(councils)} councils, {national['total']:,} homes, {national['belowCPct']}% below C, data to {data_to} ({time.time() - t0:.0f}s)")

    if tmpdir and not args.keep_zip:
        try:
            os.remove(zip_path)
            os.rmdir(tmpdir)
        except OSError:
            pass


if __name__ == "__main__":
    main()
