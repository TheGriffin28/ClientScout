import toast from "react-hot-toast";
import { FaExternalLinkAlt, FaCopy, FaLink } from "react-icons/fa";
import { DESIGN_PLACEHOLDER_NOTE } from "./designPreviewUtils";

interface DesignShareLinksProps {
  shareUrl: string;
  compact?: boolean;
}

export default function DesignShareLinks({ shareUrl, compact = false }: DesignShareLinksProps) {
  const openPreview = () => {
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Client preview link copied!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  if (compact) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openPreview}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <FaExternalLinkAlt className="h-3 w-3" />
          View Designs
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        >
          <FaCopy className="h-3 w-3" />
          Copy Link
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-blue-800/50 dark:from-blue-950/40 dark:to-indigo-950/30">
      <div className="mb-3 flex items-start gap-2">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
          <FaLink className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Client design preview
          </p>
          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
            Share this with your client — no long URL in the message, just use the buttons below.
          </p>
          <p className="mt-1 text-xs italic text-gray-500 dark:text-gray-500">
            {DESIGN_PLACEHOLDER_NOTE}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openPreview}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <FaExternalLinkAlt className="h-3.5 w-3.5" />
          View Website Designs
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-900 dark:text-blue-300 dark:hover:bg-gray-800"
        >
          <FaCopy className="h-3.5 w-3.5" />
          Copy Client Link
        </button>
      </div>
    </div>
  );
}
