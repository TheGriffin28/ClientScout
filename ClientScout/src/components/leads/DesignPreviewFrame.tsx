import { FaExpand } from "react-icons/fa";

interface DesignPreviewFrameProps {
  children: React.ReactNode;
  url: string;
  onExpand?: () => void;
  height?: number;
  scale?: number;
  compact?: boolean;
}

export default function DesignPreviewFrame({
  children,
  url,
  onExpand,
  height = 420,
  scale = 0.48,
  compact = false,
}: DesignPreviewFrameProps) {
  const widthPercent = `${(100 / scale).toFixed(2)}%`;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-900 shadow-inner dark:border-gray-700">
      <div
        className={`flex items-center gap-2 border-b border-gray-700 bg-gray-800 ${
          compact ? "px-2 py-1.5" : "px-3 py-2.5"
        }`}
      >
        <div className={`flex ${compact ? "gap-1" : "gap-1.5"}`}>
          <span className={`rounded-full bg-red-400/90 ${compact ? "h-2 w-2" : "h-2.5 w-2.5"}`} />
          <span className={`rounded-full bg-amber-400/90 ${compact ? "h-2 w-2" : "h-2.5 w-2.5"}`} />
          <span className={`rounded-full bg-emerald-400/90 ${compact ? "h-2 w-2" : "h-2.5 w-2.5"}`} />
        </div>
        <div className="mx-auto flex min-w-0 flex-1 items-center justify-center px-1">
          <div
            className={`flex w-full items-center rounded-md bg-gray-900/80 ${
              compact ? "max-w-[140px] px-2 py-0.5" : "max-w-xs px-3 py-1"
            }`}
          >
            <span className={`truncate text-gray-400 ${compact ? "text-[9px]" : "text-[11px]"}`}>
              {url}
            </span>
          </div>
        </div>
        {onExpand && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className={`rounded-md text-gray-400 transition-colors hover:bg-gray-700 hover:text-white ${
              compact ? "p-1" : "p-1.5"
            }`}
            title="Expand preview"
          >
            <FaExpand className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
          </button>
        )}
        {!onExpand && compact && <div className="w-6" />}
      </div>
      <div
        className="relative overflow-y-auto overflow-x-hidden bg-white [scrollbar-width:thin]"
        style={{ height }}
      >
        <div className="origin-top-left" style={{ transform: `scale(${scale})`, width: widthPercent }}>
          {children}
        </div>
      </div>
    </div>
  );
}
