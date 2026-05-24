
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getLeadById, updateLead, Lead, LayoutVersion } from "../services/leadService";
import { suggestLayoutFor, suggestAlternativeLayoutFor, LEGACY_TEMPLATE_MAP, LegacyTemplateKey, ThemeKey, THEMES, TEMPLATES } from "../services/templateEngine";
import WebsitePreview from "../components/leads/WebsitePreview";
import { FaCheckCircle, FaStar, FaEdit, FaShareAlt, FaArrowLeft } from "react-icons/fa";
import { Modal } from "../components/ui/modal";

const templateNames: Record<LegacyTemplateKey, string> = {
  "modern-business": "Corporate / Professional",
  "premium-dark": "Creative / Modern",
  "local-bright": "Minimal / Local Business",
  "minimal-fast": "Minimal / Local Business",
  "ecommerce-store": "E-commerce / Store",
};

const themeNames: Record<ThemeKey, string> = {
  light: "Light",
  dark: "Dark",
  luxury: "Luxury",
  startup: "Startup",
  warm: "Warm",
};

const availableTemplates: LegacyTemplateKey[] = ["modern-business", "premium-dark", "local-bright", "minimal-fast"];
const availableThemes: ThemeKey[] = ["light", "dark", "luxury", "startup", "warm"];

export default function LayoutPresentationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isRequestChangesModalOpen, setIsRequestChangesModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<LayoutVersion | null>(null);
  const [editTemplate, setEditTemplate] = useState<LegacyTemplateKey>("modern-business");
  const [editTheme, setEditTheme] = useState<ThemeKey>("light");
  const [changeRequest, setChangeRequest] = useState("");
  const [sharingVersion, setSharingVersion] = useState<LayoutVersion | null>(null);

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
      
      console.log("Fetched lead data:", data);
      
      // Generate both versions locally since backend doesn't store layoutVersions
      let leadToUse = data;
      
      if (data.generatedLayout) {
        // Get recommendations
        const recommendedSuggestion = suggestLayoutFor(data.industry, data.businessType);
        const alternativeSuggestion = suggestAlternativeLayoutFor(data.industry, data.businessType);
        
        // Ensure content has all required sections with defaults
        const ensureContent = (content: any) => ({
          hero: content.hero || {
            headline: `${data.businessName} — We Help You Grow`,
            tagline: "AI-generated website concept",
            primaryCta: "Get Started",
            secondaryCta: "Learn More",
          },
          about: content.about || {
            title: `About ${data.businessName}`,
            description: "We provide exceptional services to help your business succeed.",
          },
          services: content.services && content.services.length ? content.services : [
            { name: "Service One", description: "Description of service one." },
            { name: "Service Two", description: "Description of service two." },
            { name: "Service Three", description: "Description of service three." },
          ],
          testimonials: content.testimonials && content.testimonials.length ? content.testimonials : [
            { name: "A Happy Customer", quote: "They helped our business grow tremendously." },
          ],
          contact: content.contact || {
            phone: "",
            address: "",
            ctaText: "Contact Us",
          },
          gallery: content.gallery || [],
        });
        
        const safeContent = ensureContent(data.generatedLayout.content);
        
        // Create recommended version
        const recommendedVersion: LayoutVersion = {
          id: `recommended-${Date.now()}`,
          name: "Recommended Design",
          description: "Professional, trust-building design perfect for conversions",
          templateKey: recommendedSuggestion.templateKey,
          themeKey: recommendedSuggestion.themeKey,
          content: safeContent,
          pitchMessage: data.generatedLayout.pitchMessage,
          previewUrl: data.generatedLayout.previewUrl,
          generatedAt: new Date().toISOString(),
          isRecommended: true,
        };

        // Create alternative version
        const alternativeVersion: LayoutVersion = {
          id: `alternative-${Date.now()}`,
          name: "Alternative Style",
          description: "Modern, bold design with a more creative feel",
          templateKey: alternativeSuggestion.templateKey,
          themeKey: alternativeSuggestion.themeKey,
          content: safeContent,
          pitchMessage: data.generatedLayout.pitchMessage,
          previewUrl: data.generatedLayout.previewUrl,
          generatedAt: new Date().toISOString(),
          isRecommended: false,
        };

        leadToUse = {
          ...data,
          layoutVersions: [recommendedVersion, alternativeVersion],
        };
      }
      
      setLead(leadToUse);
      
      // Auto-select recommended version or first one
      if (leadToUse.layoutVersions && leadToUse.layoutVersions.length > 0) {
        const recommended = leadToUse.layoutVersions.find(v => v.isRecommended);
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
      
      // Ensure content has all required sections with defaults
      const ensureContent = (content: any) => ({
        hero: content.hero || {
          headline: `${lead.businessName} — We Help You Grow`,
          tagline: "AI-generated website concept",
          primaryCta: "Get Started",
          secondaryCta: "Learn More",
        },
        about: content.about || {
          title: `About ${lead.businessName}`,
          description: "We provide exceptional services to help your business succeed.",
        },
        services: content.services && content.services.length ? content.services : [
          { name: "Service One", description: "Description of service one." },
          { name: "Service Two", description: "Description of service two." },
          { name: "Service Three", description: "Description of service three." },
        ],
        testimonials: content.testimonials && content.testimonials.length ? content.testimonials : [
          { name: "A Happy Customer", quote: "They helped our business grow tremendously." },
        ],
        contact: content.contact || {
          phone: "",
          address: "",
          ctaText: "Contact Us",
        },
        gallery: content.gallery || [],
      });
      
      // Save the selected layout
      const updatedLead = await updateLead(id, {
        generatedLayout: {
          templateKey: version.templateKey,
          themeKey: version.themeKey,
          content: ensureContent(version.content),
          pitchMessage: version.pitchMessage,
          previewUrl: version.previewUrl,
          generatedAt: version.generatedAt,
        } as any,
      });
      
      // Store selectedLayoutId in localStorage since backend doesn't support it yet
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
    setEditingVersion(version);
    setEditTemplate(version.templateKey);
    setEditTheme(version.themeKey || "light");
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingVersion || !lead) return;
    
    const updatedVersion: LayoutVersion = {
      ...editingVersion,
      templateKey: editTemplate,
      themeKey: editTheme,
    };
    
    const updatedVersions = lead.layoutVersions?.map(v => 
      v.id === editingVersion.id ? updatedVersion : v
    ) || [updatedVersion];
    
    setLead({
      ...lead,
      layoutVersions: updatedVersions,
    });
    
    toast.success("Design updated!");
    setIsEditModalOpen(false);
    setEditingVersion(null);
  };

  const handleOpenShareModal = (version?: LayoutVersion) => {
    setSharingVersion(version || null);
    setIsShareModalOpen(true);
  };

  const handleCopyShareLink = async (version: LayoutVersion) => {
    if (!id || !lead) return;
    
    const shareData = {
      leadId: id,
      businessName: lead.businessName,
      versionId: version.id,
      version: version,
    };
    
    const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
    const shareUrl = `${window.location.origin}/preview?data=${encoded}`;
    
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
    
    const shareData = {
      leadId: id,
      businessName: lead.businessName,
      versions: versions,
    };
    
    const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
    const shareUrl = `${window.location.origin}/preview?data=${encoded}`;
    
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading designs...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Lead Not Found</h1>
        <button
          onClick={() => navigate("/leads")}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  const versions = lead.layoutVersions || [];
  const hasVersions = versions.length > 0;

  console.log("Rendering LayoutPresentationPage with:", {
    lead,
    versions,
    hasVersions,
    selectedVersionId
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {lead.businessName} - Website Designs
                </h1>
                <p className="text-gray-500">
                  {hasVersions 
                    ? "We prepared 2 versions for your business"
                    : "Preparing designs..."}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {hasVersions && (
                <>
                  <button
                    onClick={handleShareBoth}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaShareAlt />
                    Share Both Designs
                  </button>
                  <button
                    onClick={() => setIsRequestChangesModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <FaEdit />
                    Request Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {!hasVersions ? (
          <div className="text-center py-20">
            <p className="text-gray-600 mb-6">
              {lead.generatedLayout 
                ? "Preparing design presentation..."
                : "No design versions available yet."}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate(`/leads/${id}`)}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Go Back to Lead
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {versions.map((version) => (
              <div
                key={version.id}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  selectedVersionId === version.id
                    ? "ring-4 ring-blue-500 shadow-2xl"
                    : "shadow-lg hover:shadow-xl"
                }`}
              >
                {/* Recommended Badge */}
                {version.isRecommended && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                      <FaStar className="text-yellow-300" />
                      Recommended
                    </div>
                  </div>
                )}

                {/* Version Header */}
                <div className="bg-white border-b border-gray-100 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {version.name}
                      </h3>
                      <p className="text-gray-600 text-sm">{version.description}</p>
                    </div>
                    <button
                      onClick={() => handleOpenEditModal(version)}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors"
                      title="Edit design"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-100 aspect-[4/3] overflow-hidden">
                  <div className="h-full overflow-y-auto">
                    <WebsitePreview
                      layout={version}
                      businessName={lead.businessName}
                      industry={lead.industry}
                      businessType={lead.businessType}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white p-6 flex flex-col gap-3">
                  {selectedVersionId === version.id ? (
                    <button
                      className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <FaCheckCircle />
                      Selected
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectLayout(version)}
                      className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Choose This Design
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreviewLive(version)}
                      className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaShareAlt />
                      Preview Live
                    </button>
                    <button
                      onClick={() => handleCopyShareLink(version)}
                      className="border border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      title="Copy share link"
                    >
                      <FaShareAlt />
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Request Changes Modal */}
      <Modal
        isOpen={isRequestChangesModalOpen}
        onClose={() => setIsRequestChangesModalOpen(false)}
        className="max-w-xl"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Request Changes</h3>
          <textarea
            value={changeRequest}
            onChange={(e) => setChangeRequest(e.target.value)}
            placeholder="Tell us what changes you'd like to see..."
            rows={6}
            className="w-full border border-gray-300 rounded-xl p-4 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
          <div className="flex gap-3 mt-6 justify-end">
            <button
              onClick={() => setIsRequestChangesModalOpen(false)}
              className="px-5 py-2.5 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleRequestChanges}
              disabled={!changeRequest.trim()}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Design Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="max-w-xl"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Edit {editingVersion?.name}</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Template</label>
              <select
                value={editTemplate}
                onChange={(e) => setEditTemplate(e.target.value as LegacyTemplateKey)}
                className="w-full border border-gray-300 rounded-xl p-4 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                {availableTemplates.map((template) => (
                  <option key={template} value={template}>
                    {templateNames[template]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Theme</label>
              <select
                value={editTheme}
                onChange={(e) => setEditTheme(e.target.value as ThemeKey)}
                className="w-full border border-gray-300 rounded-xl p-4 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                {availableThemes.map((theme) => (
                  <option key={theme} value={theme}>
                    {themeNames[theme]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-8 justify-end">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-5 py-2.5 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

