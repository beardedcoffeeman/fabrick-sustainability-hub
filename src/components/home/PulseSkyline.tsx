// Heartbeat trace where each beat is a building outline. Decorative only.
// A resting line stays visible while a brighter sweep redraws it, like a
// hospital monitor. The sweep is switched off for prefers-reduced-motion
// (see .pulse-skyline rules in globals.css).

const TRACE =
  "M0 322 L32.5 322 L36.5 320.5 L40.5 316.5 L44.5 311.5 L48.5 307.5 L52.5 306 L56.5 307.5 L60.5 311.5 L64.5 316.5 L68.5 320.5 L72.5 322 L97.5 322 L105.5 338 L111.5 322 L111.5 239.2 L186.5 179.4 L211.5 199.4 L211.5 170.2 L227.5 170.2 L227.5 212.1 L261.5 239.2 L261.5 322 L268.5 346 L277.5 322 L307.5 322 L313.5 319.5 L319.5 313 L325.5 305 L331.5 298.5 L337.5 296 L343.5 298.5 L349.5 305 L355.5 313 L361.5 319.5 L367.5 322 L400 322 L442.5 322 L446.5 320.5 L450.5 316.5 L454.5 311.5 L458.5 307.5 L462.5 306 L466.5 307.5 L470.5 311.5 L474.5 316.5 L478.5 320.5 L482.5 322 L507.5 322 L515.5 338 L521.5 322 L521.5 179.4 L547.5 179.4 L547.5 124.2 L569.5 124.2 L569.5 92 L581.5 92 L586.5 18.4 L591.5 92 L603.5 92 L603.5 124.2 L625.5 124.2 L625.5 179.4 L651.5 179.4 L651.5 322 L658.5 346 L667.5 322 L697.5 322 L703.5 319.5 L709.5 313 L715.5 305 L721.5 298.5 L727.5 296 L733.5 298.5 L739.5 305 L745.5 313 L751.5 319.5 L757.5 322 L800 322 L822.5 322 L826.5 320.5 L830.5 316.5 L834.5 311.5 L838.5 307.5 L842.5 306 L846.5 307.5 L850.5 311.5 L854.5 316.5 L858.5 320.5 L862.5 322 L887.5 322 L895.5 338 L901.5 322 L901.5 207 L971.5 207 L971.5 253 L996.5 253 L996.5 142.6 L1071.5 142.6 L1071.5 322 L1078.5 346 L1087.5 322 L1117.5 322 L1123.5 319.5 L1129.5 313 L1135.5 305 L1141.5 298.5 L1147.5 296 L1153.5 298.5 L1159.5 305 L1165.5 313 L1171.5 319.5 L1177.5 322 L1200 322 L1262.5 322 L1266.5 320.5 L1270.5 316.5 L1274.5 311.5 L1278.5 307.5 L1282.5 306 L1286.5 307.5 L1290.5 311.5 L1294.5 316.5 L1298.5 320.5 L1302.5 322 L1327.5 322 L1335.5 338 L1341.5 322 L1383.5 23 L1389.5 50.6 L1431.5 322 L1438.5 346 L1447.5 322 L1477.5 322 L1483.5 319.5 L1489.5 313 L1495.5 305 L1501.5 298.5 L1507.5 296 L1513.5 298.5 L1519.5 305 L1525.5 313 L1531.5 319.5 L1537.5 322 L1600 322 L1652.5 322 L1656.5 320.5 L1660.5 316.5 L1664.5 311.5 L1668.5 307.5 L1672.5 306 L1676.5 307.5 L1680.5 311.5 L1684.5 316.5 L1688.5 320.5 L1692.5 322 L1717.5 322 L1725.5 338 L1731.5 322 L1731.5 115 L1791.5 69 L1791.5 161 L1841.5 161 L1841.5 322 L1848.5 346 L1857.5 322 L1887.5 322 L1893.5 319.5 L1899.5 313 L1905.5 305 L1911.5 298.5 L1917.5 296 L1923.5 298.5 L1929.5 305 L1935.5 313 L1941.5 319.5 L1947.5 322 L2000 322";

// Three overlapping dashes that share a leading edge, so the sweep is
// brightest at the head and fades along its tail. Lengths are in
// pathLength units (the whole trace = 1000).
const SWEEP = [
  { len: 260, opacity: 0.22 },
  { len: 120, opacity: 0.45 },
  { len: 36, opacity: 1 },
];

export function PulseSkyline({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pulse-skyline flex justify-center overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 2000 360"
        className="block w-full min-w-[1400px] shrink-0"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d={TRACE} stroke="var(--color-pink)" strokeOpacity={0.4} strokeWidth={3.5} />
        {SWEEP.map((s) => (
          <path
            key={s.len}
            className="pulse-skyline-sweep"
            d={TRACE}
            pathLength={1000}
            stroke="var(--color-pink-light)"
            strokeOpacity={s.opacity}
            strokeWidth={4}
            strokeDasharray={`${s.len} ${1000 - s.len}`}
            style={{ "--sweep-len": `${s.len}px` } as React.CSSProperties}
          />
        ))}
      </svg>
    </div>
  );
}
