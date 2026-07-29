import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  Scale,
  AlertTriangle,
  Database,
  FlaskConical,
} from "lucide-react";
import { MODELS, STUDY } from "@/components/research/aiStudyData";

// Questions removed from scoring: 10 a human reviewer judged unfair to grade,
// plus 40 that both independent auditors condemned in the answer-key audit.
const EXCLUDED = 50;
const EXCLUDED_BY_REVIEWER = 10;
const EXCLUDED_BY_AUDIT = 40;
const AUDIT_FLAGGED_FOR_REVIEW = 258;

export const metadata: Metadata = {
  title: "Methodology | How Accurate is AI for UK Construction? | Fabrick Research",
  description:
    "Full methodology for Fabrick's UK construction AI accuracy benchmark: exact model versions tested, how questions were built, how answers were scored, and the study's limitations.",
  openGraph: {
    title: "Methodology | Fabrick UK Construction AI Benchmark",
    description:
      "Exact model versions, scoring method, inter-judge agreement and known limitations for Fabrick's UK construction AI accuracy benchmark.",
    url: "https://pulse.fabrick.agency/research/ai-construction-search/methodology",
  },
};

const limitations = [
  {
    title: "The questions were written by AI, not by a chartered professional.",
    text: "Each question and its answer were generated against a named clause, table or section of a published UK standard or Approved Document. The citations are real and checkable, but no chartered professional has signed off the question set. Both judges were asked to flag any question whose stated answer looked wrong, and those flags are published below.",
  },
  {
    title: "The scorer is itself an AI.",
    text: "Two AI models grade every answer. We use one from Anthropic and one from OpenAI so that neither vendor's models are marked by their own family alone, and we only count a score where both agree. That reduces vendor bias but does not eliminate the possibility that both judges are wrong in the same way.",
  },
  {
    title: "This measures recall of published standards, not judgement.",
    text: "A high score means a model reliably reproduces what a document says. It does not mean the model can apply that requirement to a real building, weigh competing standards, or spot when a question is the wrong question. Design and safety decisions need a competent person.",
  },
  {
    title: "Every model was asked the same way, which favours none of them.",
    text: "All models received an identical short prompt with no retrieval, no documents attached and no follow-up. Models that would normally be used with a document uploaded, or as part of a tuned workflow, will score differently in that setting.",
  },
  {
    title: "Results are a snapshot of a single day.",
    text: "Every answer was collected on 28 July 2026, with scoring and review completed the following day. Models are updated continuously, several tested here are explicitly preview or beta releases, and a provider can change a model behind the same name. These figures describe the versions listed above as they behaved on that date, and nothing more.",
  },
  {
    title: "Some models were reached through a gateway, not the vendor directly.",
    text: "Where a vendor's own account was rate-limited or out of quota, the model was called through OpenRouter instead. The underlying model version is the same and is listed above, but the routing differed and is recorded in the raw data.",
  },
];

export default function MethodologyPage() {
  const paid = MODELS.filter((m) => m.paid);
  const free = MODELS.filter((m) => !m.paid);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-10 pb-12 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Research", href: "/research" },
              { label: "AI Accuracy in UK Construction", href: "/research/ai-construction-search" },
              { label: "Methodology" },
            ]}
          />
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/20">
              <FlaskConical className="h-5 w-5 text-teal" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
              Methodology
            </span>
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-5xl leading-tight">
            How this benchmark was built
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-400">
            Everything needed to check our figures, disagree with them, or run the test again
            yourself. Exact model versions, the scoring method, what we excluded, and where the
            study is weak.
          </p>
        </div>
      </section>

      {/* What was tested */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-teal" />
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy md:text-3xl">
            What was tested
          </h2>
        </div>
        <div className="mt-5 space-y-4 text-warm-gray leading-relaxed">
          <p>
            {STUDY.questions.toLocaleString()} technical questions about UK construction were put to{" "}
            {STUDY.models} AI models, producing {STUDY.responses.toLocaleString()} answers. The
            questions span {STUDY.categories} categories, from Building Regulations and British
            Standards through to waterproofing, demolition and contracts.
          </p>
          <p>
            Each question has one verified answer tied to a specific place in a published document:
            a clause, a table, a diagram or a numbered section. Examples of the sources used include
            Approved Documents A to S, the relevant British and European Standards with their UK
            National Annexes, NHBC Standards, BREEAM UK New Construction, the GPDO, CDM 2015 and
            JCT contract forms.
          </p>
          <p className="rounded-xl border border-cream-dark bg-white p-4 text-sm">
            <strong className="text-navy">How the questions were made.</strong> The question set was
            generated by an AI model working from those published documents, and each answer carries
            the clause-level citation it was drawn from. The citations are real and can be checked
            against the source. No chartered professional has independently verified the whole
            question set, and we do not claim otherwise.
          </p>
          <p className="rounded-xl border-l-4 border-pink bg-white p-4 text-sm">
            <strong className="text-navy">We found errors in our own answer key, and say so.</strong>{" "}
            Both scoring models were asked to flag any question whose stated answer looked wrong.
            That produced a shortlist, which a reviewer then checked by hand against the published
            documents. Of the questions on that shortlist, most turned out to have a real problem:
            answers that were factually wrong, answers describing requirements that had since been
            amended or repealed, and citations pointing at table numbers from superseded editions.{" "}
            <strong className="text-navy">
              {STUDY.stabilityCorrections} answers were corrected and re-scored, and{" "}
              {EXCLUDED_BY_REVIEWER} questions were removed from scoring as unfair to grade.
            </strong>{" "}
            The original question set is retained unaltered alongside the corrected one.
          </p>
          <p className="rounded-xl border-l-4 border-teal bg-white p-4 text-sm">
            <strong className="text-navy">Then we audited the rest of the key.</strong> That first
            pass only covered questions a judge happened to challenge while marking, which is a
            sample selected for trouble and says nothing about the remainder. So every other
            question was put to the same two models again, this time shown only the question, our
            answer and our citation, with no AI response involved. Where{" "}
            <strong className="text-navy">both</strong> independently judged the answer wrong or the
            question ungradeable, it was excluded: {EXCLUDED_BY_AUDIT} more questions came out that
            way, leaving {STUDY.questions.toLocaleString()} scored. A further{" "}
            {AUDIT_FLAGGED_FOR_REVIEW} were flagged by only one auditor; those were left in and sent
            for human review rather than acted on.
          </p>
          <p>
            The bar is set at both auditors agreeing for a reason. They reach the same verdict on
            fewer than half the questions, and on some they contradict each other about what a table
            in the same document says. A single adverse opinion from either is not evidence, so
            nothing was rewritten on their say-so, only removed when both agreed.
          </p>
          <p>
            The direction of that error matters. In several cases the answer key was out of date and
            the models were not: on the Class MA floorspace limit, for example, every model that
            correctly said the cap had been removed in March 2024 was being marked wrong against a
            key that still cited the old rule. Correcting the key raised scores rather than lowering
            them.
          </p>
        </div>
      </section>

      {/* Exact models */}
      <section className="bg-cream-dark py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-pink" />
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy md:text-3xl">
              Exact models tested
            </h2>
          </div>
          <p className="mt-3 max-w-3xl text-warm-gray leading-relaxed">
            Marketing names are ambiguous and change over time, so every model is listed with the
            exact identifier sent to the provider&apos;s API. If a figure on the results page refers
            to a model, this is the version it refers to.
          </p>

          <div className="mt-6 overflow-x-auto rounded-2xl bg-white p-4 shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-cream-dark">
                  <th className="px-3 py-3 text-left font-semibold text-navy">Name used in charts</th>
                  <th className="px-3 py-3 text-left font-semibold text-navy">API model identifier</th>
                  <th className="px-3 py-3 text-left font-semibold text-navy">Vendor</th>
                  <th className="px-3 py-3 text-left font-semibold text-navy">Tier</th>
                </tr>
              </thead>
              <tbody>
                {MODELS.map((m) => (
                  <tr key={m.id} className="border-b border-cream-dark/60">
                    <td className="px-3 py-2.5 font-medium text-navy">{m.name}</td>
                    <td className="px-3 py-2.5">
                      <code className="rounded bg-cream px-1.5 py-0.5 text-[12px] text-navy">
                        {m.modelId}
                      </code>
                    </td>
                    <td className="px-3 py-2.5 text-warm-gray">{m.vendor}</td>
                    <td className="px-3 py-2.5 text-warm-gray">{m.paid ? "Paid" : "Free"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-cream-dark bg-white p-4 text-sm text-warm-gray">
              <strong className="text-navy">Paid versus free.</strong> A model is counted as{" "}
              <em>paid</em> ({paid.length} of {MODELS.length}) when a construction professional would
              need a paid subscription or paid API access to reach it, and <em>free</em> ({free.length}
              ) when a capable equivalent is reachable on a free consumer tier. This is a judgement
              about access, not about price paid during the test, which was billed at API rates
              throughout.
            </div>
            <div className="rounded-xl border border-cream-dark bg-white p-4 text-sm text-warm-gray">
              <strong className="text-navy">How each model was asked.</strong> Identical instruction
              for every model: answer a UK construction technical question directly and specifically
              in two to three sentences, without hedging or refusing. No documents were supplied, no
              web search was requested, and no follow-up questions were asked. Reasoning models were
              left at their default settings and given enough output budget to think and still answer.
            </div>
          </div>
        </div>
      </section>

      {/* Scoring */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-teal" />
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy md:text-3xl">
            How answers were scored
          </h2>
        </div>
        <div className="mt-5 space-y-4 text-warm-gray leading-relaxed">
          <p>
            Every answer was graded twice, by two AI models from different vendors, against the
            verified answer and its citation. Each judge sees only the question, the verified answer
            and the response. Neither is told which model produced the response, so a judge cannot
            favour its own family.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { score: "2", label: "Correct", text: "Same substance as the verified answer, with every key figure, standard reference and requirement right. Different wording or extra accurate detail still scores 2." },
              { score: "1", label: "Partial", text: "On the right topic and partly right, but misses or misstates part of the answer, or gives a value that is close but wrong." },
              { score: "0", label: "Wrong", text: "Contradicts the verified answer, gives a materially incorrect figure or standard, goes off topic, or refuses to answer." },
            ].map((r) => (
              <div key={r.score} className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-3xl font-bold text-teal">{r.score}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-navy">
                  {r.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-warm-gray">{r.text}</p>
              </div>
            ))}
          </div>
          <p>
            A score counts only when both judges give the same grade. Where they disagreed, the
            answer was excluded from that model&apos;s score rather than resolved by picking a
            preferred judge. The two judges agreed on{" "}
            <strong className="text-navy">{STUDY.judgeAgreement}%</strong> of answers, and{" "}
            {STUDY.excludedOnDisagreement.toLocaleString()} were excluded on disagreement. That
            agreement rate is the best available measure of how reliable these scores are, and it is
            published so it can be argued with.
          </p>
          <p>
            Judges were told to grade against substance, not style: an answer that hedges but lands
            on the correct figure scores 2, and a fluent, confident answer with the wrong figure
            scores 0. Length was not rewarded.
          </p>
        </div>
      </section>

      {/* Rank stability */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-pink" />
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy md:text-3xl">
            How much does the ranking depend on our answer key being right?
          </h2>
        </div>
        <div className="mt-5 space-y-4 text-warm-gray leading-relaxed">
          <p>
            This is the question worth asking of any benchmark, and the corrections above let us
            answer it with evidence rather than assurance. Correcting{" "}
            {STUDY.stabilityCorrections} answers was a real change to the key, made on the merits of
            each question and without regard to which model it would help. If the ranking were
            fragile, that change would have scrambled it.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { v: String(STUDY.stabilityRho), l: "Rank correlation", t: "Spearman, before versus after correction" },
              { v: `${STUDY.stabilityUnmoved}/${STUDY.models}`, l: "Models unmoved", t: "Did not change position at all" },
              { v: "+0.01pp", l: "Mean score change", t: "Individual models moved between −1.1 and +1.6" },
            ].map((x) => (
              <div key={x.l} className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-3xl font-bold text-teal">{x.v}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-navy">{x.l}</p>
                <p className="mt-2 text-sm leading-relaxed text-warm-gray">{x.t}</p>
              </div>
            ))}
          </div>
          <p>
            The top three and the bottom five did not move. What movement there was happened in the
            middle of the table, where six models sit within a single percentage point of each
            other. That is why the results are presented as {STUDY.bands} bands rather than{" "}
            {STUDY.models} ranked places: a gap smaller than {STUDY.tieBandPp} percentage points is
            inside the margin our own corrections moved things, so it is not a finding.
          </p>
          <p className="rounded-xl border border-cream-dark bg-white p-4 text-sm">
            <strong className="text-navy">What this does and does not show.</strong> It shows the
            ordering is robust to the kind of error we found and fixed, because such errors hit every
            model at once rather than favouring one. It does not show the absolute percentages are
            precise. Treat the scores as approximate and the bands as the result.
          </p>
        </div>
      </section>

      {/* Exclusions */}
      <section className="bg-cream-dark py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-pink" />
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy md:text-3xl">
              What was excluded, and what counted against a model
            </h2>
          </div>
          <ul className="mt-5 space-y-3 text-warm-gray leading-relaxed">
            <li className="rounded-xl bg-white p-4 shadow-sm">
              <strong className="text-navy">Judge disagreements were excluded.</strong> Neither judge
              was treated as the tie-breaker. Excluded answers do not count for or against a model,
              and the count is published per model in the raw data.
            </li>
            <li className="rounded-xl bg-white p-4 shadow-sm">
              <strong className="text-navy">Failures to answer counted as wrong.</strong> Where a
              model returned nothing usable, that scored 0 rather than being quietly dropped. A
              handful of reasoning models occasionally spent their whole output budget thinking and
              returned an empty answer; those are recorded and counted.
            </li>
            <li className="rounded-xl bg-white p-4 shadow-sm">
              <strong className="text-navy">Every model tested is published.</strong> No model was
              run and then left out of the results.
            </li>
          </ul>
        </div>
      </section>

      {/* Limitations */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-pink" />
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy md:text-3xl">
            Limitations
          </h2>
        </div>
        <p className="mt-3 max-w-3xl text-warm-gray leading-relaxed">
          Where this study is weak. We would rather state these ourselves than have them found.
        </p>
        <ol className="mt-6 space-y-4">
          {limitations.map((l, i) => (
            <li key={l.title} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-bold text-white">
                {i + 1}
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">{l.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-warm-gray">{l.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Data */}
      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-cream-dark bg-white p-6">
          <h2 className="text-lg font-bold text-navy">Checking our work</h2>
          <p className="mt-2 text-sm leading-relaxed text-warm-gray">
            If you want to interrogate a specific figure, a category result or a particular
            model&apos;s answers, get in touch and we will share the underlying response and scoring
            data for that slice, including both judges&apos; verdicts and the citation each question
            was built from.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/research/ai-construction-search"
              className="inline-flex items-center gap-1.5 rounded-lg bg-charcoal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
            >
              <BarChart3 className="h-4 w-4" />
              Back to the results
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/research"
              className="inline-flex items-center gap-1.5 rounded-lg border border-cream-dark bg-white px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-cream"
            >
              All research
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <FabrickPlatformCTA />
    </div>
  );
}
