
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getLeadById, updateLead, Lead, LayoutVersion } from "../services/leadService";
import WebsitePreview from "../components/leads/WebsitePreview";
import DesignPreviewFrame from "../components/leads/DesignPreviewFrame";
import { getPreviewUrl, templateNames, themeNames, isVersionClientApproved, ensureLayoutContent, EDITOR_DATA_KEY, EDITOR_RESULT_KEY, DesignEditorResult, enrichLeadWithDesigns, hasPreparedDesigns, buildLeadDesignShareUrl } from "../components/leads/designPreviewUtils";
import AnalysisDesignFixes from "../components/leads/AnalysisDesignFixes";
import {
  FaCheckCircle,
  FaStar,
  FaEdit,
  FaShareAlt,
  FaArrowLeft,
  FaExternalLinkAlt,
  FaPalette,
  FaLayerGroup,
} from "react-icons/fa";
import { Modal } from "../components/ui/modal";

function DesignCard({
  version,
  lead,
  isSelected,
  isApproved,
  onSelect,
  onEdit,
  onPreviewLive,
  onCopyLink,
  onExpand,
}: {
  version: LayoutVersion;
  lead: Lead;
  isSelected: boolean;
  isApproved: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onPreviewLive: () => void;
  onCopyLink: () => void;
  onExpand: () => void;
}) {
  const previewUrl = getPreviewUrl(lead.businessName);

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 dark:bg-gray-900 ${
        isApproved
          ? "border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500"
          : isSelected
          ? "border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
          : "border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md dark:border-gray-700"
      }`}
    >
      {/* Card header */}
      <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {version.name}
              </h3>
              {version.isRecommended && !isApproved && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                  <FaStar className="h-2.5 w-2.5 text-amber-300" />
                  Recommended
                </span>
              )}
              {isApproved && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                  <FaCheckCircle className="h-3 w-3" />
                  Approved
                </span>
              )}
              {isSelected && !isApproved && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <FaCheckCircle className="h-3 w-3" />
                  Selected
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{version.description}</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <FaLayerGroup className="h-3 w-3 text-gray-400" />
                {templateNames[version.templateKey] || version.templateKey}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <FaPalette className="h-3 w-3 text-gray-400" />
                {themeNames[version.themeKey || "light"]} theme
              </span>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-400 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            title="Edit design in new window"
          >
            <FaEdit className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Browser preview */}
      <div className="flex-1 bg-gray-50 p-4 dark:bg-gray-950">
        <DesignPreviewFrame url={previewUrl} onExpand={onExpand}>
          <WebsitePreview
            layout={version}
            businessName={lead.businessName}
            industry={lead.industry}
            businessType={lead.businessType}
          />
        </DesignPreviewFrame>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 p-4 dark:border-gray-800">
        {isApproved ? (
          <div className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white">
            <FaCheckCircle />
            Approved by client
          </div>
        ) : isSelected ? (
          <div className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white">
            <FaCheckCircle />
            This design is selected
          </div>
        ) : (
          <button
            onClick={onSelect}
            className="mb-3 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Choose This Design
          </button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onPreviewLive}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <FaExternalLinkAlt className="h-3 w-3" />
            Preview Live
          </button>
          <button
            onClick={onCopyLink}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <FaShareAlt className="h-3 w-3" />
            Copy Link
          </button>
        </div>
      </div>
    </article>
  );
}

export default function LayoutPresentationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isRequestChangesModalOpen, setIsRequestChangesModalOpen] = useState(false);
  const [changeRequest, setChangeRequest] = useState("");
  const [expandedVersion, setExpandedVersion] = useState<LayoutVersion | null>(null);

  useEffect(() => {
    const applyEditorResult = (result: DesignEditorResult) => {
      if (!id || result.leadId !== id) return;

      setLead((prev) => {
        if (!prev) return prev;
        const updatedVersions =
          prev.layoutVersions?.map((v) =>
            v.id === result.versionId ? result.version : v
          ) || [result.version];
        return {
          ...prev,
          layoutVersions: updatedVersions,
          selectedLayoutId: result.versionId,
        };
      });
      setSelectedVersionId(result.versionId);
      toast.success("Design updated and selected!");
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "DESIGN_EDITOR_CONFIRMED") {
        applyEditorResult(event.data.payload as DesignEditorResult);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== EDITOR_RESULT_KEY || !event.newValue) return;
      try {
        applyEditorResult(JSON.parse(event.newValue) as DesignEditorResult);
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorage);
    };
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLead = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getLeadById(id);

      let leadToUse = enrichLeadWithDesigns(data);

      setLead(leadToUse);

      if (leadToUse.layoutVersions && leadToUse.layoutVersions.length > 0) {
        const recommended = leadToUse.layoutVersions.find((v) => v.isRecommended);
        setSelectedVersionId(recommended?.id || leadToUse.layoutVersions[0].id);
      } else if (leadToUse.selectedLayoutId) {
        setSelectedVersionId(leadToUse.selectedLayoutId);
      }
    } catch (error) {
      console.error("Error fetching lead:", error);
      toast.error("Error loading lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLayout = async (version: LayoutVersion) => {
    if (!id || !lead) return;
    try {
      setSelectedVersionId(version.id);

      const updatedLead = await updateLead(id, {
        generatedLayout: {
          templateKey: version.templateKey,
          themeKey: version.themeKey,
          content: ensureLayoutContent(version.content, lead.businessName),
          pitchMessage: version.pitchMessage,
          previewUrl: version.previewUrl,
          generatedAt: version.generatedAt,
        } as any,
      });

      localStorage.setItem(`lead_${id}_selectedLayout`, version.id);

      setLead({
        ...updatedLead,
        layoutVersions: lead.layoutVersions,
        selectedLayoutId: version.id,
      });
      toast.success("Design selected!");
    } catch (error) {
      console.error("Error selecting layout:", error);
      toast.error("Failed to select design.");
    }
  };

  const handlePreviewLive = (version: LayoutVersion) => {
    const previewData = {
      layout: version,
      businessName: lead?.businessName,
      industry: lead?.industry,
      businessType: lead?.businessType,
      leadId: id,
    };
    localStorage.setItem("clientScout_preview_data", JSON.stringify(previewData));
    window.open("/preview", "_blank", "noopener,noreferrer");
  };

  const handleOpenEditModal = (version: LayoutVersion) => {
    if (!id || !lead) return;

    const editorData = {
      leadId: id,
      version,
      businessName: lead.businessName,
      industry: lead.industry,
      businessType: lead.businessType,
    };
    localStorage.setItem(EDITOR_DATA_KEY, JSON.stringify(editorData));
    window.open("/design-editor", "_blank", "noopener,noreferrer");
  };

  const handleCopyShareLink = async (_version: LayoutVersion) => {
    if (!id) return;

    const shareUrl = buildLeadDesignShareUrl(id);

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link. Please copy manually.");
    }
  };

  const handleShareBoth = async () => {
    if (!id || !lead || !versions.length) return;

    const shareUrl = buildLeadDesignShareUrl(id);

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link for both designs copied!");
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link. Please copy manually.");
    }
  };

  const handleRequestChanges = async () => {
    if (!id || !changeRequest.trim()) return;
    try {
      const updatedNotes = lead?.notes
        ? `${lead.notes}\n\n--- Change Request ---\n${changeRequest}`
        : `--- Change Request ---\n${changeRequest}`;

      await updateLead(id, { notes: updatedNotes });
      toast.success("Change request submitted!");
      setIsRequestChangesModalOpen(false);
      setChangeRequest("");
    } catch (error) {
      console.error("Error submitting change request:", error);
      toast.error("Failed to submit change request.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 animate-pulse space-y-3">
          <div className="h-8 w-64 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-96 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="h-24 bg-gray-100 dark:bg-gray-800" />
              <div className="h-[420px] bg-gray-50 dark:bg-gray-900" />
              <div className="h-28 bg-gray-100 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Lead Not Found</h1>
        <p className="mb-6 text-gray-500">The lead you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate("/leads")}
          className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white hover:bg-blue-700"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  const versions = lead.layoutVersions || [];
  const hasVersions = versions.length > 0;
  const selectedVersion = versions.find((v) => v.id === selectedVersionId);

  return (
    <div className="pb-12">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <FaArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div>
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Design Presentation
            </p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              {lead.businessName}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {hasVersions
                ? `${versions.length} website concepts ready to share with your client`
                : "Generating design concepts..."}
            </p>
          </div>
        </div>

        {hasVersions && (
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              onClick={handleShareBoth}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <FaShareAlt className="h-3.5 w-3.5" />
              Share Both Designs
            </button>
            <button
              onClick={() => setIsRequestChangesModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <FaEdit className="h-3.5 w-3.5" />
              Request Changes
            </button>
          </div>
        )}
      </div>

      {/* Pitch banner */}
      {hasVersions && (
        <div className="mb-6 space-y-4">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 px-6 py-5 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold sm:text-lg">
                  {lead.websiteObservations && lead.aiGeneratedAt
                    ? "Redesigns based on your website audit"
                    : "Two tailored designs, one clear recommendation"}
                </h2>
                <p className="mt-1 max-w-xl text-sm text-blue-100/80">
                  {lead.websiteObservations && lead.aiGeneratedAt
                    ? `These concepts address issues found on ${lead.businessName}'s current site. Compare both, select a favorite, then share with your client.`
                    : `Compare both concepts side-by-side, select your preferred design, then share a link directly with ${lead.businessName}.`}
                </p>
              </div>
              {selectedVersion && (
                <div className="shrink-0 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-blue-200">
                    Current selection
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">{selectedVersion.name}</p>
                </div>
              )}
            </div>
          </div>
          {lead.websiteObservations && lead.aiGeneratedAt && (
            <AnalysisDesignFixes observations={lead.websiteObservations} />
          )}
        </div>
      )}

      {/* Design grid */}
      {!hasVersions ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <FaLayerGroup className="mb-4 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="mb-1 font-medium text-gray-700 dark:text-gray-300">
            {hasPreparedDesigns(lead) ? "Preparing design presentation..." : "No design versions available yet"}
          </p>
          <p className="mb-6 text-sm text-gray-500">
            Generate designs from the lead detail page first.
          </p>
          <button
            onClick={() => navigate(`/leads/${id}`)}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go Back to Lead
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {versions.map((version) => (
            <DesignCard
              key={version.id}
              version={version}
              lead={lead}
              isSelected={selectedVersionId === version.id}
              isApproved={isVersionClientApproved(version, lead)}
              onSelect={() => handleSelectLayout(version)}
              onEdit={() => handleOpenEditModal(version)}
              onPreviewLive={() => handlePreviewLive(version)}
              onCopyLink={() => handleCopyShareLink(version)}
              onExpand={() => setExpandedVersion(version)}
            />
          ))}
        </div>
      )}

      {/* Expand preview modal */}
      <Modal
        isOpen={!!expandedVersion}
        onClose={() => setExpandedVersion(null)}
        isFullscreen
        className="!rounded-none !p-0 !shadow-none !max-w-none !mx-0 !my-0 flex flex-col bg-gray-100 dark:bg-gray-950"
      >
        {expandedVersion && lead && (
          <>
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {expandedVersion.name}
                </p>
                <p className="text-xs text-gray-500">{lead.businessName}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePreviewLive(expandedVersion)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <FaExternalLinkAlt className="h-3 w-3" />
                  Open Full Preview
                </button>
                <button
                  onClick={() => setExpandedVersion(null)}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <WebsitePreview
                layout={expandedVersion}
                businessName={lead.businessName}
                industry={lead.industry}
                businessType={lead.businessType}
              />
            </div>
          </>
        )}
      </Modal>

      {/* Request Changes Modal */}
      <Modal
        isOpen={isRequestChangesModalOpen}
        onClose={() => setIsRequestChangesModalOpen(false)}
        className="max-w-xl"
        title="Request Changes"
      >
        <textarea
          value={changeRequest}
          onChange={(e) => setChangeRequest(e.target.value)}
          placeholder="Tell us what changes you'd like to see..."
          rows={6}
          className="w-full rounded-xl border border-gray-300 p-4 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setIsRequestChangesModalOpen(false)}
            className="px-5 py-2.5 text-gray-600 hover:text-gray-800 dark:text-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleRequestChanges}
            disabled={!changeRequest.trim()}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </Modal>
    </div>
  );
}
