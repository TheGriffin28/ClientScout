import { LayoutVersion } from "../../services/leadService";
import WebsitePreview from "./WebsitePreview";
import DesignPreviewFrame from "./DesignPreviewFrame";
import { getPreviewUrl, templateNames, themeNames } from "./designPreviewUtils";
import { FaCheckCircle, FaStar } from "react-icons/fa";

interface DesignSummaryCardProps {
  version: LayoutVersion;
  businessName: string;
  industry?: string;
  businessType?: string;
  isSelected?: boolean;
  isApproved?: boolean;
  onClick?: () => void;
}

export default function DesignSummaryCard({
  version,
  businessName,
  industry,
  businessType,
  isSelected = false,
  isApproved = false,
  onClick,
}: DesignSummaryCardProps) {
  const previewUrl = getPreviewUrl(businessName);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full flex-col overflow-hidden rounded-xl border bg-white text-left transition-all duration-200 dark:bg-gray-900 ${
        isApproved
          ? "border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500"
          : isSelected
          ? "border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:hover:border-gray-600"
      }`}
    >
      <div className="border-b border-gray-100 px-3 py-2.5 dark:border-gray-800">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {version.name}
              </p>
              {version.isRecommended && !isApproved && (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                  <FaStar className="h-2 w-2 text-amber-300" />
                  Recommended
                </span>
              )}
              {isApproved && (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                  <FaCheckCircle className="h-2 w-2" />
                  Approved
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {templateNames[version.templateKey] || version.templateKey}
              </span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {themeNames[version.themeKey || "light"]}
              </span>
            </div>
          </div>
          {!isApproved && isSelected && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              <FaCheckCircle className="h-2.5 w-2.5" />
              Selected
            </span>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-2 dark:bg-gray-950">
        <DesignPreviewFrame url={previewUrl} height={200} scale={0.32} compact>
          <WebsitePreview
            layout={version}
            businessName={businessName}
            industry={industry}
            businessType={businessType}
          />
        </DesignPreviewFrame>
      </div>

      <div className="border-t border-gray-100 px-3 py-2 dark:border-gray-800">
        <p className="text-[11px] text-gray-400 transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400">
          Click to open full presentation →
        </p>
      </div>
    </button>
  );
}
