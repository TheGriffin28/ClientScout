import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import WebsitePreview from "../components/leads/WebsitePreview";
import { updateLead, LayoutVersion } from "../services/leadService";
import { LegacyTemplateKey, ThemeKey } from "../services/templateEngine";
import {
  EDITOR_DATA_KEY,
  EDITOR_RESULT_KEY,
  DesignEditorData,
  DesignEditorResult,
  ensureLayoutContent,
  normalizeTemplateKey,
} from "../components/leads/designPreviewUtils";
import DesignStylePickers from "../components/leads/DesignStylePickers";
import { FaCheck, FaCog, FaTimes } from "react-icons/fa";

export default function DesignEditorPage() {
  const [editorData, setEditorData] = useState<DesignEditorData | null>(null);
  const [templateKey, setTemplateKey] = useState<LegacyTemplateKey>("modern-business");
  const [themeKey, setThemeKey] = useState<ThemeKey>("light");
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(EDITOR_DATA_KEY);
    if (!raw) return;

    try {
      const data = JSON.parse(raw) as DesignEditorData;
      setEditorData(data);
      setTemplateKey(normalizeTemplateKey(data.version.templateKey));
      setThemeKey(data.version.themeKey || "light");
    } catch {
      toast.error("Failed to load editor data.");
    }
  }, []);

  const previewLayout = useMemo<LayoutVersion | null>(() => {
    if (!editorData) return null;
    return {
      ...editorData.version,
      templateKey,
      themeKey,
    };
  }, [editorData, templateKey, themeKey]);

  const hasChanges =
    !!editorData &&
    (templateKey !== editorData.version.templateKey ||
      themeKey !== (editorData.version.themeKey || "light"));

  const handleConfirm = async () => {
    if (!editorData || !previewLayout) return;

    setSaving(true);
    try {
      const updatedVersion: LayoutVersion = {
        ...editorData.version,
        templateKey,
        themeKey,
      };

      await updateLead(editorData.leadId, {
        generatedLayout: {
          templateKey: updatedVersion.templateKey,
          themeKey: updatedVersion.themeKey,
          content: ensureLayoutContent(updatedVersion.content, editorData.businessName),
          pitchMessage: updatedVersion.pitchMessage,
          previewUrl: updatedVersion.previewUrl,
          generatedAt: updatedVersion.generatedAt,
        } as any,
      });

      localStorage.setItem(`lead_${editorData.leadId}_selectedLayout`, updatedVersion.id);

      const result: DesignEditorResult = {
        leadId: editorData.leadId,
        versionId: updatedVersion.id,
        version: updatedVersion,
      };
      localStorage.setItem(EDITOR_RESULT_KEY, JSON.stringify(result));

      window.opener?.postMessage(
        { type: "DESIGN_EDITOR_CONFIRMED", payload: result },
        window.location.origin
      );

      toast.success("Design saved as final selection!");
      setTimeout(() => window.close(), 600);
    } catch (error) {
      console.error("Error saving design:", error);
      toast.error("Failed to save design. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!editorData || !previewLayout) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
        <Toaster position="top-right" />
        <h1 className="mb-2 text-xl font-bold text-gray-900">No design to edit</h1>
        <p className="text-gray-500">Open the editor from the presentation page.</p>
        <button
          onClick={() => window.close()}
          className="mt-6 rounded-lg bg-gray-200 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
        >
          Close window
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <Toaster position="top-right" />

      {/* Live website preview */}
      <div key={`${templateKey}-${themeKey}`} className="preview-fade-switch">
        <WebsitePreview
          layout={previewLayout}
          businessName={editorData.businessName}
          industry={editorData.industry}
          businessType={editorData.businessType}
        />
      </div>

      {/* Floating settings button — shown first; click to open panel */}
      {!panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl ring-4 ring-blue-600/20 transition-transform hover:scale-105 hover:bg-blue-700"
          title="Design settings"
          aria-label="Open design settings"
        >
          <FaCog className="h-5 w-5" />
          {hasChanges && (
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white" />
          )}
        </button>
      )}

      {/* Settings panel — opens on icon click */}
      {panelOpen && (
        <>
          <button
            type="button"
            aria-label="Close settings"
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setPanelOpen(false)}
          />
          <div className="design-editor-panel-enter fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-3rem))]">
            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FaCog className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      Settings
                    </p>
                    <p className="text-sm font-semibold text-gray-900">{editorData.version.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="Close settings"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>

            <div className="p-4">
              <DesignStylePickers
                templateKey={templateKey}
                themeKey={themeKey}
                onTemplateChange={setTemplateKey}
                onThemeChange={setThemeKey}
              />

              {hasChanges && (
                <p className="mt-3 text-xs text-amber-600">
                  Preview updated — confirm to save as the final design.
                </p>
              )}
            </div>

            <div className="flex gap-2 border-t border-gray-100 bg-gray-50/80 p-4">
              <button
                onClick={() => window.close()}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <FaCheck className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Confirm Design"}
              </button>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
