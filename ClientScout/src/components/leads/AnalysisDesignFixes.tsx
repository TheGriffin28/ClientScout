import { FaCheckCircle, FaWrench } from "react-icons/fa";
import { getDesignFixesFromAnalysis } from "../../services/templateEngine";

interface WebsiteObservations {
  performanceIssues?: string[];
  trustIssues?: string[];
  conversionIssues?: string[];
}

interface AnalysisDesignFixesProps {
  observations?: WebsiteObservations;
  compact?: boolean;
}

export default function AnalysisDesignFixes({ observations, compact = false }: AnalysisDesignFixesProps) {
  const fixes = getDesignFixesFromAnalysis(observations);

  if (!fixes.length) return null;

  if (compact) {
    return (
      <ul className="space-y-1.5">
        {fixes.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
            <FaCheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
            <span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{item.issue}</span>
              {" → "}
              {item.fix}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 dark:border-violet-800/40 dark:from-violet-950/30 dark:to-indigo-950/20">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
          <FaWrench className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">What we&apos;re fixing</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            New designs address issues found in your AI website audit
          </p>
        </div>
      </div>
      <ul className="space-y-2">
        {fixes.map((item, i) => (
          <li
            key={i}
            className="rounded-lg border border-white/60 bg-white/70 px-3 py-2 dark:border-gray-700/50 dark:bg-gray-900/40"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
              {item.category}
            </p>
            <p className="mt-0.5 text-sm text-gray-800 dark:text-gray-200">{item.issue}</p>
            <p className="mt-1 flex items-start gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
              <FaCheckCircle className="mt-0.5 h-3 w-3 shrink-0" />
              {item.fix}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
