
import { Link, useNavigate, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import WebsitePreview from "../components/leads/WebsitePreview";
import { LayoutVersion, updateLeadPublic, getLeadByIdPublic, Lead } from "../services/leadService";
import { enrichLeadWithDesigns } from "../components/leads/designPreviewUtils";
import { FaArrowLeft, FaStar, FaThumbsUp, FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";

export default function WebsitePreviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [localLayout, setLocalLayout] = useState<any>(null);
  const [localData, setLocalData] = useState<any>(null);
  const [versions, setVersions] = useState<LayoutVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [changeRequest, setChangeRequest] = useState("");
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [changeRequestSubmitted, setChangeRequestSubmitted] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    const loadPreviewData = async () => {
      const leadIdParam = searchParams.get("leadId");
      if (leadIdParam) {
        try {
          const lead = await getLeadByIdPublic(leadIdParam);
          const enriched = enrichLeadWithDesigns(lead as Lead);
          const versions = enriched.layoutVersions || [];

          if (versions.length > 0) {
            setPreviewId(leadIdParam);
            setVersions(versions);
            const recommended = versions.find((v) => v.isRecommended);
            const initial = recommended || versions[0];
            setSelectedVersionId(initial.id);
            setLocalData({
              businessName: lead.businessName,
              leadId: leadIdParam,
              industry: lead.industry,
              businessType: lead.businessType,
            });
            setLocalLayout(initial);

            if (lead.clientApproved) {
              setIsApproved(true);
              if (lead.clientApprovedLayoutId) {
                setSelectedVersionId(lead.clientApprovedLayoutId);
                const approvedVersion = versions.find((v) => v.id === lead.clientApprovedLayoutId);
                if (approvedVersion) setLocalLayout(approvedVersion);
              }
            }
            if (lead.clientChangeRequest) setChangeRequestSubmitted(true);

            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error loading lead preview:", error);
        }
      }

      const encodedData = searchParams.get("data");
      if (encodedData) {
        try {
          const decoded = decodeURIComponent(atob(encodedData));
          const data = JSON.parse(decoded);
          
          const id = data.leadId || "preview_" + Date.now();
          setPreviewId(id);
          
          if (data.versions && data.versions.length) {
            setVersions(data.versions);
            const recommended = data.versions.find((v: LayoutVersion) => v.isRecommended);
            setSelectedVersionId(recommended?.id || data.versions[0].id);
            setLocalData({ businessName: data.businessName, leadId: data.leadId });
            setLocalLayout(recommended || data.versions[0]);
          } else if (data.version) {
            setVersions([data.version]);
            setSelectedVersionId(data.version.id);
            setLocalData({ businessName: data.businessName, leadId: data.leadId });
            setLocalLayout(data.version);
          }
          
          // Load status from database!
          if (id && !id.startsWith("preview_")) {
            try {
              const lead = await getLeadByIdPublic(id);
              if (lead.clientApproved) {
                setIsApproved(true);
                if (lead.clientApprovedLayoutId) {
                  setSelectedVersionId(lead.clientApprovedLayoutId);
                  const approvedVersion = (data.versions || [data.version]).find((v: any) => v.id === lead.clientApprovedLayoutId);
                  if (approvedVersion) {
                    setLocalLayout(approvedVersion);
                  }
                }
              }
              if (lead.clientChangeRequest) {
                setChangeRequestSubmitted(true);
              }
            } catch (e) {
              console.error("Error loading lead from API:", e);
            }
          }
          
          setLoading(false);
          return;
        } catch (error) {
          console.error("Error parsing URL data:", error);
        }
      }
      
      const dataStr = localStorage.getItem("clientScout_preview_data");
      if (dataStr) {
        const data = JSON.parse(dataStr);
        const id = data.leadId || "preview_local";
        setPreviewId(id);
        setLocalData(data);
        setLocalLayout(data.layout);
        setVersions([data.layout as any]);
        setSelectedVersionId(data.layout?.id || "single");
        
        // Load status from database!
        if (id && !id.startsWith("preview_")) {
          try {
            const lead = await getLeadByIdPublic(id);
            if (lead.clientApproved) {
              setIsApproved(true);
            }
            if (lead.clientChangeRequest) {
              setChangeRequestSubmitted(true);
            }
          } catch (e) {
            console.error("Error loading lead from API:", e);
          }
        }
      }
      setLoading(false);
    };

    loadPreviewData();
  }, [searchParams]);

  const handleSelectVersion = (version: LayoutVersion) => {
    setSelectedVersionId(version.id);
    setLocalLayout(version);
  };

  const handleApproveDesign = async () => {
    if (isApproved || !previewId) return;

    const approvedVersion = versions.find((v) => v.id === selectedVersionId);

    try {
      await updateLeadPublic(previewId, {
        clientApproved: true,
        clientApprovedAt: new Date().toISOString(),
        clientApprovedLayoutId: selectedVersionId,
        clientApprovedLayoutName: approvedVersion?.name,
      });

      setIsApproved(true);
      toast.success("✅ Design approved!");
    } catch (error) {
      console.error("Error saving approval:", error);
      toast.error("Failed to save approval. Please try again.");
    }
  };

  const handleSubmitChangeRequest = async () => {
    if (!changeRequest.trim() || !previewId) return;

    try {
      await updateLeadPublic(previewId, {
        clientChangeRequest: changeRequest,
        clientChangeRequestedAt: new Date().toISOString(),
      });

      setShowChangeRequestModal(false);
      setChangeRequest("");
      setChangeRequestSubmitted(true);
      toast.success("✅ Change request submitted!");
    } catch (error) {
      console.error("Error saving change request:", error);
      toast.error("Failed to submit change request. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <p className="text-gray-600">Loading preview...</p>
      </div>
    );
  }

  if (!localData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">No Preview Available</h1>
        <p className="text-gray-600 mb-8">The preview you tried to access is no longer available.</p>
        <Link 
          to="/leads" 
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Leads
        </Link>
      </div>
    );
  }

  const getIndustryPitch = (industry?: string) => {
    switch ((industry || "").toLowerCase()) {
      case "real estate":
        return "We created two modern website concepts tailored for your real estate business to help improve credibility, showcase your listings beautifully, and increase client inquiries.";
      case "restaurant":
        return "We created two mouthwatering website concepts tailored for your restaurant to showcase your menu, atmosphere, and make online reservations a breeze.";
      case "healthcare":
        return "We created two professional website concepts tailored for your healthcare practice to build trust with patients, showcase your services, and streamline appointment bookings.";
      case "legal":
        return "We created two authoritative website concepts tailored for your law firm to establish credibility, showcase your expertise, and attract high-value clients.";
      case "construction":
        return "We created two impressive website concepts tailored for your construction business to showcase your portfolio, highlight your expertise, and win more projects.";
      case "fitness":
        return "We created two energetic website concepts tailored for your fitness business to motivate visitors, showcase your programs, and drive membership sign-ups.";
      default:
        return "We created two stunning website concepts tailored specifically for your business to help you stand out online, attract more customers, and grow your revenue.";
    }
  };

  try {
    const { businessName, industry } = localData;
    const hasMultipleVersions = versions.length > 1;
    const pitch = getIndustryPitch(industry);
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Proposal Header */}
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white p-4 shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Website Proposal for {businessName}
              </h1>
              <p className="text-sm text-gray-500">
                Custom website designs created specifically for your business
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FaArrowLeft />
              Close
            </button>
          </div>
        </header>

        {/* Proposal Pitch Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Your Website, Designed for Success
            </h2>
            <p className="text-lg md:text-xl opacity-90 leading-relaxed">
              {pitch}
            </p>
          </div>
        </div>

        {/* Version Selector */}
        {hasMultipleVersions && (
          <div className="border-b border-gray-200 bg-white px-4 py-4">
            <div className="mx-auto max-w-7xl">
              <p className="text-sm font-semibold text-gray-700 mb-3">Choose your design:</p>
              <div className="flex flex-wrap gap-3">
                {versions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => handleSelectVersion(version)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${
                      selectedVersionId === version.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {version.isRecommended && (
                      <FaStar className="text-yellow-400" />
                    )}
                    {version.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Placeholder disclaimer */}
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
          <p className="mx-auto max-w-7xl text-center text-sm text-amber-800">
            Images and content shown are sample placeholders — final version will use your actual photos, branding, and business details.
          </p>
        </div>

        {/* Main Preview */}
        <main className="p-0 pb-24">
          <WebsitePreview
            key={`${localLayout?.templateKey}-${localLayout?.themeKey || 'light'}`}
            layout={localLayout}
            businessName={businessName}
            industry={localData.industry}
            businessType={localData.businessType}
          />
        </main>

        {/* Floating action buttons */}
        {!isApproved && !changeRequestSubmitted && (
          <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={handleApproveDesign}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl ring-4 ring-green-600/20 transition-transform hover:scale-[1.02] hover:bg-green-700"
            >
              <FaThumbsUp className="h-4 w-4" />
              Approve This Design
            </button>
            <button
              onClick={() => setShowChangeRequestModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white/95 px-6 py-3.5 text-sm font-semibold text-gray-700 shadow-xl ring-4 ring-black/5 backdrop-blur-sm transition-transform hover:scale-[1.02] hover:bg-gray-50"
            >
              <FaEdit className="h-4 w-4" />
              Request Changes
            </button>
          </div>
        )}

        {/* Status banners */}
        {changeRequestSubmitted && !isApproved ? (
          <footer className="border-t border-gray-200 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-12">
            <div className="mx-auto max-w-4xl text-center">
              <FaEdit className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Changes Requested! 📝
              </h2>
              <p className="text-xl opacity-95 mb-2">
                Our team has received your change request.
              </p>
              <p className="text-lg opacity-85">
                We'll be in touch shortly to discuss revisions.
              </p>
            </div>
          </footer>
        ) : isApproved ? (
          <footer className="border-t border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-12">
            <div className="mx-auto max-w-4xl text-center">
              <FaThumbsUp className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Design Approved! 🎉
              </h2>
              <p className="text-xl opacity-95 mb-2">
                This website can be launched within 24 hours.
              </p>
              <p className="text-lg opacity-85">
                Our team will be in touch shortly to finalize the details.
              </p>
            </div>
          </footer>
        ) : null}

        {/* Change Request Modal */}
        {showChangeRequestModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Request Changes</h3>
                <textarea
                  value={changeRequest}
                  onChange={(e) => setChangeRequest(e.target.value)}
                  placeholder="Tell us what changes you'd like to see..."
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg p-4 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <div className="flex gap-3 mt-6 justify-end">
                  <button
                    onClick={() => setShowChangeRequestModal(false)}
                    className="px-5 py-2.5 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitChangeRequest}
                    disabled={!changeRequest.trim()}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error parsing preview data:", error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Preview</h1>
        <p className="text-gray-600 mb-8">There was an error loading the preview data.</p>
        <Link 
          to="/leads" 
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Leads
        </Link>
      </div>
    );
  }
}

