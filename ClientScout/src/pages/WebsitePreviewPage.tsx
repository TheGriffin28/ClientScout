
import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import WebsitePreview from "../components/leads/WebsitePreview";
import { updateLead } from "../services/leadService";

export default function WebsitePreviewPage() {
  const navigate = useNavigate();
  const [localLayout, setLocalLayout] = useState<any>(null);
  const [localData, setLocalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataStr = localStorage.getItem("clientScout_preview_data");
    if (dataStr) {
      const data = JSON.parse(dataStr);
      setLocalData(data);
      setLocalLayout(data.layout);
    }
    setLoading(false);
  }, []);

  const handleChangeTemplate = async () => {
    if (!localLayout || !localData?.leadId) return;
    const templates: Array<"modern-business" | "premium-dark" | "local-bright" | "minimal-fast"> = [
      "modern-business",
      "premium-dark",
      "local-bright",
      "minimal-fast",
    ];
    const currentIndex = templates.indexOf(localLayout.templateKey);
    const nextTemplate = templates[(currentIndex + 1) % templates.length];
    try {
      const updatedLead = await updateLead(localData.leadId, {
        generatedLayout: {
          ...localLayout,
          templateKey: nextTemplate,
        },
      });
      const newData = {
        ...localData,
        layout: updatedLead.generatedLayout,
      };
      setLocalLayout(updatedLead.generatedLayout);
      setLocalData(newData);
      localStorage.setItem("clientScout_preview_data", JSON.stringify(newData));
      toast.success("Template updated!");
    } catch (error) {
      console.error("Error changing template:", error);
      toast.error("Failed to change template.");
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

  try {
    const { businessName, industry, businessType } = localData;
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white p-4 shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {businessName} - Website Preview
              </h1>
              <p className="text-sm text-gray-500">
                AI-Generated Website Concept • Template: {localLayout?.templateKey}
              </p>
            </div>
            <div className="flex gap-3">
              {localData?.leadId && (
                <button
                  onClick={handleChangeTemplate}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Change Template
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ← Close Preview
              </button>
            </div>
          </div>
        </header>
        <main className="p-0">
          <WebsitePreview
            layout={localLayout}
            businessName={businessName}
            industry={industry}
            businessType={businessType}
          />
        </main>
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
