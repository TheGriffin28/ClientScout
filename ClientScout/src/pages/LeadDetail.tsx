import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLeadById, updateLead, analyzeLead, generateEmailDraft, generateWhatsAppDraft, logContact, Lead } from "../services/leadService";
import StatusBadge from "../components/common/StatusBadge";
import { FaEnvelope, FaWhatsapp, FaPhoneAlt, FaMagic, FaCopy, FaCheckCircle, FaCalendarPlus } from "react-icons/fa";
import { openEmail, openWhatsApp, openCall } from "../services/outreachService";

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [generatingWhatsApp, setGeneratingWhatsApp] = useState(false);
  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id]);

  const fetchLead = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getLeadById(id);
      setLead(data);
      setNotes(data.notes || "");
    } catch (error) {
      console.error("Error fetching lead:", error);
      alert("Error loading lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    try {
      await updateLead(id, { notes });
      setIsEditingNotes(false);
      await fetchLead();
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Error saving notes. Please try again.");
    }
  };

  const handleAnalyze = async () => {
    if (!id) return;
    try {
      setAnalyzing(true);
      const updatedLead = await analyzeLead(id);
      setLead(updatedLead);
    } catch (error) {
      console.error("Error analyzing lead:", error);
      alert("Error analyzing lead. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateEmail = async () => {
    if (!id) return;
    try {
      setGeneratingEmail(true);
      const updatedLead = await generateEmailDraft(id);
      setLead(updatedLead);
    } catch (error) {
      console.error("Error generating email:", error);
      alert("Error generating email draft.");
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleGenerateWhatsApp = async () => {
    if (!id) return;
    try {
      setGeneratingWhatsApp(true);
      const updatedLead = await generateWhatsAppDraft(id);
      setLead(updatedLead);
    } catch (error) {
      console.error("Error generating WhatsApp:", error);
      alert("Error generating WhatsApp draft.");
    } finally {
      setGeneratingWhatsApp(false);
    }
  };

  const handleLogContact = async () => {
    if (!id) return;
    try {
      const updatedLead = await logContact(id);
      setLead(updatedLead);
      alert("Contact logged! Next follow-up set for 3 days.");
    } catch (error) {
      console.error("Error logging contact:", error);
      alert("Error logging contact.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string | undefined): string => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl">
        <p className="text-center text-gray-600 dark:text-gray-300">
          Loading lead details...
        </p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-6 max-w-4xl">
        <p className="text-center text-red-600">Lead not found</p>
        <button
          onClick={() => navigate("/leads")}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {lead.businessName}
        </h1>
        <button
          onClick={() => navigate("/leads")}
          className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        >
          ← Back
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <StatusBadge status={lead.status} />
        {lead.scoreCategory && (
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
            lead.scoreCategory === "Hot" ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100" :
            lead.scoreCategory === "Warm" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100" :
            "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
          }`}>
            {lead.scoreCategory}
          </span>
        )}
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {getTimeAgo(lead.updatedAt)}
        </span>
        {lead.lastContactedAt && (
           <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
             <FaCheckCircle className="text-xs" /> Last Contact: {formatDate(lead.lastContactedAt)}
           </span>
        )}
        {lead.nextFollowUp && (
          <span className={`text-sm flex items-center gap-1 ${
            new Date(lead.nextFollowUp) < new Date() 
            ? 'text-red-600 font-bold animate-pulse' 
            : 'text-orange-600 dark:text-orange-400'
          }`}>
            <FaCalendarPlus className="text-xs" />
            {new Date(lead.nextFollowUp) < new Date() ? "Overdue Follow-up: " : "Next Follow-up: "} 
            {formatDate(lead.nextFollowUp)}
          </span>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={handleLogContact}
          className="flex items-center gap-2 rounded-lg bg-gray-800 px-6 py-3 text-white hover:bg-gray-900 transition-colors shadow-md hover:shadow-lg dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <FaCheckCircle className="w-5 h-5" />
          <span className="font-medium">Log Contact</span>
        </button>

        {lead.email && (
          <button
            onClick={() => openEmail({ lead })}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <FaEnvelope className="w-5 h-5" />
            <span className="font-medium">Send Email</span>
          </button>
        )}
        {lead.phone && (
          <>
            <button
              onClick={() => openWhatsApp({ lead })}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
            >
              <FaWhatsapp className="w-5 h-5" />
              <span className="font-medium">Send WhatsApp</span>
            </button>
            <button
              onClick={() => openCall(lead.phone!)}
              className="flex items-center gap-2 rounded-lg bg-gray-700 px-6 py-3 text-white hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg dark:bg-gray-600 dark:hover:bg-gray-700"
            >
              <FaPhoneAlt className="w-5 h-5" />
              <span className="font-medium">Call Now</span>
            </button>
          </>
        )}
        {!lead.email && !lead.phone && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No contact information available for outreach
          </p>
        )}
      </div>

      {/* AI Insights Card */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow dark:bg-boxdark">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <FaMagic className="text-purple-600" />
            AI Insights & Outreach
          </h3>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className={`rounded px-4 py-2 text-sm text-white transition-colors ${
              analyzing ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {analyzing ? "Analyzing..." : "Analyze with AI"}
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Industry</p>
              <p className="text-gray-800 dark:text-white font-medium">{lead.industry || "Not identified"}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Lead Score</p>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${lead.leadScore ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>
                  {lead.leadScore || "-"}
                </span>
                <span className="text-sm text-gray-500">/ 5</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">AI Summary & Pitch</p>
            <p className="text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm leading-relaxed">
              {lead.aiSummary || "No AI summary available yet."}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pain Points</p>
            {lead.painPoints && lead.painPoints.length > 0 ? (
              <ul className="list-disc list-inside text-gray-800 dark:text-white">
                {lead.painPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic text-sm">No pain points identified yet.</p>
            )}
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Email Draft Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <FaEnvelope className="text-blue-600" /> AI Email Draft
              </h4>
              <button
                onClick={handleGenerateEmail}
                disabled={generatingEmail}
                className="text-sm text-blue-600 hover:underline dark:text-blue-400 disabled:opacity-50"
              >
                {generatingEmail ? "Generating..." : (lead.emailDraft ? "Regenerate" : "Generate Draft")}
              </button>
            </div>
            
            {lead.emailDraft ? (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="mb-2 flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Subject</span>
                    <p className="text-gray-800 dark:text-white font-medium mb-2">{lead.emailDraft.subject}</p>
                  </div>
                  <button onClick={() => copyToClipboard(lead.emailDraft!.subject)} className="text-gray-400 hover:text-gray-600">
                    <FaCopy />
                  </button>
                </div>
                <div className="relative">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Body</span>
                  <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{lead.emailDraft.body}</p>
                  <button onClick={() => copyToClipboard(lead.emailDraft!.body)} className="absolute top-0 right-0 text-gray-400 hover:text-gray-600">
                    <FaCopy />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 text-sm">No email draft generated yet.</p>
              </div>
            )}
          </div>

          {/* WhatsApp Draft Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <FaWhatsapp className="text-green-600" /> AI WhatsApp Draft
              </h4>
              <button
                onClick={handleGenerateWhatsApp}
                disabled={generatingWhatsApp}
                className="text-sm text-green-600 hover:underline dark:text-green-400 disabled:opacity-50"
              >
                {generatingWhatsApp ? "Generating..." : (lead.whatsappDraft ? "Regenerate" : "Generate Draft")}
              </button>
            </div>
            
            {lead.whatsappDraft ? (
              <div className="bg-green-50 dark:bg-gray-700 p-4 rounded-lg border border-green-200 dark:border-gray-600 relative">
                <p className="text-gray-800 dark:text-white text-sm whitespace-pre-wrap">{lead.whatsappDraft.body}</p>
                <button onClick={() => copyToClipboard(lead.whatsappDraft!.body)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                  <FaCopy />
                </button>
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 text-sm">No WhatsApp draft generated yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow dark:bg-boxdark">
        <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">
          Contact Information
        </h3>
        <div className="space-y-2 text-gray-700 dark:text-gray-300">
          {lead.contactName && (
            <p>
              <strong>Contact Name:</strong> {lead.contactName}
            </p>
          )}
          {lead.email && (
            <p>
              <strong>Email:</strong>{" "}
              <a
                href={`mailto:${lead.email}`}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {lead.email}
              </a>
            </p>
          )}
          {lead.phone && (
            <p>
              <strong>Phone:</strong>{" "}
              <a
                href={`tel:${lead.phone}`}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {lead.phone}
              </a>
            </p>
          )}
          {lead.website && (
            <p>
              <strong>Website:</strong>{" "}
              <a
                href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {lead.website}
              </a>
            </p>
          )}
          {lead.source && (
            <p>
              <strong>Source:</strong> {lead.source}
            </p>
          )}
          {!lead.contactName && !lead.email && !lead.phone && !lead.website && (
            <p className="text-gray-500">No contact information available</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow dark:bg-boxdark">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-white">Notes</h3>
          {!isEditingNotes && (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Edit
            </button>
          )}
        </div>
        {isEditingNotes ? (
          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              className="w-full rounded border p-3 dark:bg-gray-800 dark:text-white"
              rows={4}
              placeholder="Add notes about this lead..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditingNotes(false);
                  setNotes(lead.notes || "");
                }}
                className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">
            {lead.notes || "No notes added yet."}
          </p>
        )}
      </div>

      {/* Additional Info */}
      <div className="rounded-xl bg-white p-5 shadow dark:bg-boxdark">
        <h3 className="mb-4 font-semibold text-gray-800 dark:text-white">
          Additional Information
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>Created:</strong> {formatDate(lead.createdAt)}
          </p>
          <p>
            <strong>Last Updated:</strong> {formatDate(lead.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
