import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getLeadById, updateLead, analyzeLead, generateEmailDraft, sendLeadEmail, generateWhatsAppDraft, generateLayout, logContact, Lead, LayoutVersion } from "../services/leadService";
import DesignSummaryCard from "../components/leads/DesignSummaryCard";
import DesignShareLinks from "../components/leads/DesignShareLinks";
import {
  isVersionClientApproved,
  buildLayoutVersionsFromLead,
  buildLeadDesignShareUrl,
  WHATSAPP_DESIGN_LINK_NOTE,
  DESIGN_PLACEHOLDER_NOTE,
  leadHasWebsite,
  hasPreparedDesigns,
  hasEmailDraft,
  hasWhatsAppDraft,
  enrichLeadWithDesigns,
} from "../components/leads/designPreviewUtils";
import AnalysisDesignFixes from "../components/leads/AnalysisDesignFixes";
import StatusBadge from "../components/common/StatusBadge";
import { FaEnvelope, FaWhatsapp, FaPhoneAlt, FaMagic, FaCopy, FaCheckCircle, FaCalendarPlus, FaRegPaperPlane, FaSync, FaThumbsUp, FaEdit, FaDesktop, FaArrowRight, FaLayerGroup } from "react-icons/fa";
import { openWhatsApp, openCall } from "../services/outreachService";
import { Modal } from "../components/ui/modal";
import { ProfileSkeleton } from "../components/ui/Skeleton";
import { useUser } from "../context/UserContext";
const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [generatingWhatsApp, setGeneratingWhatsApp] = useState(false);
  const [generatingLayout, setGeneratingLayout] = useState(false);
  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedEmailSubject, setEditedEmailSubject] = useState("");
  const [editedEmailBody, setEditedEmailBody] = useState("");

  const [isEditingWhatsApp, setIsEditingWhatsApp] = useState(false);
  const [editedWhatsAppBody, setEditedWhatsAppBody] = useState("");

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id]);

  const fetchLead = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = enrichLeadWithDesigns(await getLeadById(id));
      setLead(data);
      setNotes(data.notes || "");
    } catch (error) {
      console.error("Error fetching lead:", error);
      toast.error("Error loading lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    try {
      await updateLead(id, { notes });
      setIsEditingNotes(false);
      toast.success("Notes saved!");
      await fetchLead();
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Error saving notes. Please try again.");
    }
  };

  const handleAnalyze = async () => {
    if (!id) return;
    try {
      setAnalyzing(true);
      setLead(enrichLeadWithDesigns(await analyzeLead(id)));
      toast.success("AI Analysis complete!");
      refreshUser();
    } catch (error: any) {
      console.error("Error analyzing lead:", error);
      toast.error(error.response?.data?.message || "Error analyzing lead. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateEmail = async () => {
    if (!id) return;
    try {
      setGeneratingEmail(true);
      setLead(enrichLeadWithDesigns(await generateEmailDraft(id)));
      toast.success("Email draft generated!");
      refreshUser();
    } catch (error: any) {
      console.error("Error generating email:", error);
      toast.error(error.response?.data?.message || "Error generating email draft.");
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleSendEmail = async () => {
    if (!id || !hasEmailDraft(lead)) return;
    
    try {
      setSendingEmail(true);
      const subjectToSend = isEditingEmail ? editedEmailSubject : lead.emailDraft.subject;
      const bodyToSend = isEditingEmail ? editedEmailBody : lead.emailDraft.body;
      const shareUrl = hasPreparedDesigns(lead) ? buildLeadDesignShareUrl(id) : undefined;

      await sendLeadEmail(id, subjectToSend, bodyToSend, shareUrl);
      toast.success("Email sent successfully!");
      setIsEmailModalOpen(false);
      // Refresh lead to update contact history
      await fetchLead();
      refreshUser();
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast.error(error.response?.data?.message || "Failed to send email.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleGenerateWhatsApp = async () => {
    if (!id) return;
    try {
      setGeneratingWhatsApp(true);
      setLead(enrichLeadWithDesigns(await generateWhatsAppDraft(id)));
      toast.success("WhatsApp draft generated!");
      refreshUser();
    } catch (error: any) {
      console.error("Error generating WhatsApp:", error);
      toast.error(error.response?.data?.message || "Error generating WhatsApp draft.");
    } finally {
      setGeneratingWhatsApp(false);
    }
  };

  const handleGenerateLayout = async () => {
    if (!id) return;
    try {
      setGeneratingLayout(true);
      const leadToUse = await generateLayout(id);
      setLead(enrichLeadWithDesigns(leadToUse));
      toast.success("Design presentation ready!");
      navigate(`/leads/${id}/presentation`);
      refreshUser();
    } catch (error: any) {
      console.error("Error generating layout:", error);
      const msg = error.response?.data?.message || "Error generating website layout.";
      if (error.response?.data?.code === "ANALYSIS_REQUIRED") {
        toast.error(msg, { duration: 5000 });
      } else {
        toast.error(msg);
      }
    } finally {
      setGeneratingLayout(false);
    }
  };

  const handleLogContact = async () => {
    if (!id) return;
    try {
      const updatedLead = await logContact(id);
      setLead(enrichLeadWithDesigns(updatedLead));
      toast.success("Contact logged! Next follow-up set for 3 days.");
    } catch (error) {
      console.error("Error logging contact:", error);
      toast.error("Error logging contact.");
    }
  };

  const handleEditEmail = () => {
    if (lead?.emailDraft) {
      setEditedEmailSubject(lead.emailDraft.subject);
      setEditedEmailBody(lead.emailDraft.body);
      setIsEditingEmail(true);
    }
  };

  const handleOpenEmailModal = () => {
    if (lead?.emailDraft) {
      setEditedEmailSubject(lead.emailDraft.subject);
      setEditedEmailBody(lead.emailDraft.body);
    }
    setIsEmailModalOpen(true);
    setIsEditingEmail(false);
  };

  const handleSaveEmailDraft = async () => {
    if (!id || !lead) return;
    try {
      const updatedLead = await updateLead(id, {
        emailDraft: {
          subject: editedEmailSubject,
          body: editedEmailBody,
          generatedAt: lead.emailDraft?.generatedAt || new Date().toISOString(),
        },
      });
      setLead(enrichLeadWithDesigns(updatedLead));
      setIsEditingEmail(false);
      toast.success("Email draft updated!");
    } catch (error) {
      console.error("Error updating email draft:", error);
      toast.error("Failed to update email draft.");
    }
  };

  const handleEditWhatsApp = () => {
    if (lead?.whatsappDraft) {
      setEditedWhatsAppBody(lead.whatsappDraft.body);
      setIsEditingWhatsApp(true);
    }
  };

  const handleOpenWhatsAppModal = () => {
    if (lead?.whatsappDraft) {
      setEditedWhatsAppBody(lead.whatsappDraft.body);
    }
    setIsWhatsAppModalOpen(true);
    setIsEditingWhatsApp(false);
  };

  const handleSaveWhatsAppDraft = async () => {
    if (!id || !lead) return;
    try {
      const updatedLead = await updateLead(id, {
        whatsappDraft: {
          body: editedWhatsAppBody,
          generatedAt: lead.whatsappDraft?.generatedAt || new Date().toISOString(),
        },
      });
      setLead(enrichLeadWithDesigns(updatedLead));
      setIsEditingWhatsApp(false);
      toast.success("WhatsApp draft updated!");
    } catch (error) {
      console.error("Error updating WhatsApp draft:", error);
      toast.error("Failed to update WhatsApp draft.");
    }
  };

  const handleSendWhatsApp = (includeDesignLink = true) => {
    if (!lead || !id) return;
    let message = editedWhatsAppBody || lead.whatsappDraft?.body || "";
    const shareUrl = hasPreparedDesigns(lead) ? buildLeadDesignShareUrl(id) : null;
    if (includeDesignLink && shareUrl && !message.includes("/preview?")) {
      message = `${message}\n\n${WHATSAPP_DESIGN_LINK_NOTE}\n${shareUrl}\n\n${DESIGN_PLACEHOLDER_NOTE}`;
    }
    openWhatsApp({ lead, customMessage: message });
    setIsWhatsAppModalOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
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
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-8">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-8">
        <div className="rounded-xl bg-white p-6 shadow-md dark:bg-white/[0.03]">
          <p className="text-center text-red-600">Lead not found</p>
          <button
            onClick={() => navigate("/leads")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900"
          >
            <span>←</span>
            <span>Back to Leads</span>
          </button>
        </div>
      </div>
    );
  }

  const layoutVersions = hasPreparedDesigns(lead) ? buildLayoutVersionsFromLead(lead) : [];
  const designShareUrl = id && hasPreparedDesigns(lead) ? buildLeadDesignShareUrl(id) : null;
  const hasDesigns = Boolean(hasPreparedDesigns(lead) && designShareUrl);
  const emailDraftReady = hasEmailDraft(lead);
  const whatsappDraftReady = hasWhatsAppDraft(lead);
  const needsAnalysisBeforeDesign =
    leadHasWebsite(lead.website) && !lead.aiGeneratedAt;
  const hasWebsiteAnalysis = Boolean(lead.websiteObservations && lead.aiGeneratedAt);

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white sm:text-3xl">
            {lead.businessName}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Detailed view with AI insights and contact history.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate("/leads")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.04]"
          >
            <span>←</span>
            <span>Back to Leads</span>
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={lead.status} />
        {lead.scoreCategory && (
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              lead.scoreCategory === "Hot"
                ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                : lead.scoreCategory === "Warm"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
            }`}
          >
            {lead.scoreCategory}
          </span>
        )}
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {getTimeAgo(lead.updatedAt)}
        </span>
        {lead.lastContactedAt && (
          <span className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
            <FaCheckCircle className="text-xs" /> Last Contact:{" "}
            {formatDate(lead.lastContactedAt)}
          </span>
        )}
        {lead.nextFollowUp && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
              new Date(lead.nextFollowUp) < new Date()
                ? "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-200"
                : "bg-orange-50 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200"
            }`}
          >
            <FaCalendarPlus className="text-xs" />
            <span>
              {new Date(lead.nextFollowUp) < new Date()
                ? "Overdue Follow-up: "
                : "Next Follow-up: "}
              {formatDate(lead.nextFollowUp)}
            </span>
          </span>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={handleLogContact}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-black/80 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <FaCheckCircle className="h-5 w-5" />
          <span className="font-medium">Log Contact</span>
        </button>

        {lead.email && (
          <button
            onClick={handleOpenEmailModal}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <FaEnvelope className="h-5 w-5" />
            <span className="font-medium">Send Email</span>
          </button>
        )}

        {lead.phone && (
          <>
            <button
              onClick={handleOpenWhatsAppModal}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700"
            >
              <FaWhatsapp className="h-5 w-5" />
              <span>Send WhatsApp</span>
            </button>
            <button
              onClick={() => openCall(lead.phone!)}
              className="flex items-center gap-2 rounded-lg bg-gray-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700"
            >
              <FaPhoneAlt className="h-5 w-5" />
              <span>Call Now</span>
            </button>
          </>
        )}

        {!lead.email && !lead.phone && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No contact information available for outreach
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Email Draft Modal */}
        <Modal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          className="max-w-2xl p-6"
        >
          <div className="mb-4 flex items-center justify-between border-b pb-4 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              AI Email Outreach
            </h3>
          </div>

          <div className="space-y-4">
            {!emailDraftReady ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:bg-gray-800">
                <p className="mb-4 text-gray-500">No email draft generated yet.</p>
                <button
                  onClick={handleGenerateEmail}
                  disabled={generatingEmail}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {generatingEmail ? (
                    "Generating..."
                  ) : (
                    <>
                      <FaMagic /> Generate AI Draft
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Subject
                  </label>
                  {isEditingEmail ? (
                    <input
                      type="text"
                      value={editedEmailSubject}
                      onChange={(e) => setEditedEmailSubject(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm font-medium text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  ) : (
                    <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm font-medium text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                      {lead.emailDraft.subject}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Body
                  </label>
                  {isEditingEmail ? (
                    <textarea
                      value={editedEmailBody}
                      onChange={(e) => setEditedEmailBody(e.target.value)}
                      rows={10}
                      className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    />
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      <p className="whitespace-pre-wrap">{lead.emailDraft.body}</p>
                    </div>
                  )}
                </div>

                {hasDesigns && designShareUrl && (
                  <DesignShareLinks shareUrl={designShareUrl} />
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t dark:border-gray-700">
                  <div className="flex gap-2">
                    {!isEditingEmail && (
                      <button
                        onClick={handleEditEmail}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={handleGenerateEmail}
                      disabled={generatingEmail}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                    >
                      <FaSync className={generatingEmail ? "animate-spin" : ""} />
                      {generatingEmail ? "Generating..." : "Regenerate"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEmailModalOpen(false)}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    {isEditingEmail ? (
                      <button
                        onClick={handleSaveEmailDraft}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Save & Preview
                      </button>
                    ) : (
                      <button
                        onClick={handleSendEmail}
                        disabled={sendingEmail}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {sendingEmail ? (
                          "Sending..."
                        ) : (
                          <>
                            <FaRegPaperPlane /> Send Mail
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* WhatsApp Draft Modal */}
        <Modal
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
          className="max-w-2xl p-6"
        >
          <div className="mb-4 flex items-center justify-between border-b pb-4 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              WhatsApp Outreach
            </h3>
          </div>

          <div className="space-y-4">
            {!whatsappDraftReady ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:bg-gray-800">
                <p className="mb-4 text-gray-500">No WhatsApp draft generated yet.</p>
                <button
                  onClick={handleGenerateWhatsApp}
                  disabled={generatingWhatsApp}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {generatingWhatsApp ? (
                    "Generating..."
                  ) : (
                    <>
                      <FaMagic /> Generate AI Draft
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Message Body
                  </label>
                  {isEditingWhatsApp ? (
                    <textarea
                      value={editedWhatsAppBody}
                      onChange={(e) => setEditedWhatsAppBody(e.target.value)}
                      rows={10}
                      className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    />
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      <p className="whitespace-pre-wrap">{lead.whatsappDraft.body}</p>
                    </div>
                  )}
                </div>

                {hasDesigns && designShareUrl && (
                  <DesignShareLinks shareUrl={designShareUrl} />
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t dark:border-gray-700">
                  <div className="flex gap-2">
                    {!isEditingWhatsApp && (
                     <button
                       onClick={handleEditWhatsApp}
                       className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                     >
                       Edit
                     </button>
                   )}
                    <button
                      onClick={handleGenerateWhatsApp}
                      disabled={generatingWhatsApp}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                    >
                      <FaSync className={generatingWhatsApp ? "animate-spin" : ""} />
                      {generatingWhatsApp ? "Generating..." : "Regenerate"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsWhatsAppModalOpen(false)}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    {isEditingWhatsApp ? (
                      <button
                        onClick={handleSaveWhatsAppDraft}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Save & Preview
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendWhatsApp(true)}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        <FaWhatsapp /> Send via WhatsApp
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>

        <div className="order-2 space-y-6 lg:order-1 lg:col-span-2">
          {/* Client Status Banner - FROM DATABASE! */}
          {lead?.clientApproved ? (
            <div className="rounded-xl border-4 border-green-500 bg-green-50 p-6 shadow-2xl dark:bg-green-900/30 dark:border-green-400">
              <div className="flex items-center gap-4 mb-3">
                <FaCheckCircle className="text-4xl text-green-600 dark:text-green-400" />
                <h3 className="text-2xl font-black text-green-800 dark:text-green-200">
                  🎉 DESIGN APPROVED BY CLIENT!
                </h3>
              </div>
              <p className="text-xl text-green-700 dark:text-green-300 mb-2">
                Approved Design: <span className="font-black">{lead.clientApprovedLayoutName || "Selected Design"}</span>
              </p>
              {lead.clientApprovedAt && (
                <p className="text-base text-green-600 dark:text-green-400">
                  Approved on: {new Date(lead.clientApprovedAt).toLocaleString()}
                </p>
              )}
            </div>
          ) : null}
          
          {lead?.clientChangeRequest ? (
            <div className="rounded-xl border-4 border-amber-500 bg-amber-50 p-6 shadow-2xl dark:bg-amber-900/30 dark:border-amber-400">
              <div className="flex items-center gap-4 mb-3">
                <FaEdit className="text-4xl text-amber-600 dark:text-amber-400" />
                <h3 className="text-2xl font-black text-amber-800 dark:text-amber-200">
                  📝 CHANGE REQUEST RECEIVED!
                </h3>
              </div>
              <p className="text-xl text-amber-700 dark:text-amber-300 mb-2 font-bold">
                Client Request:
              </p>
              <p className="text-lg text-amber-800 dark:text-amber-200 bg-white/70 dark:bg-black/20 p-4 rounded-xl whitespace-pre-wrap">
                {lead.clientChangeRequest}
              </p>
              {lead.clientChangeRequestedAt && (
                <p className="text-base text-amber-600 dark:text-amber-400 mt-3">
                  Received on: {new Date(lead.clientChangeRequestedAt).toLocaleString()}
                </p>
              )}
            </div>
          ) : null}
          
          <div className="rounded-xl bg-white p-5 shadow dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
                <FaMagic className="text-purple-600" />
                AI Insights & Outreach
              </h3>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className={`rounded px-4 py-2 text-sm text-white transition-colors ${
                  analyzing
                    ? "cursor-not-allowed bg-purple-400"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {analyzing ? "Analyzing..." : "Analyze with AI"}
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Industry
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {lead.industry || "Not identified"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Business Type
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {lead.businessType || "Not identified"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Lead Score
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-lg font-bold ${
                        lead.leadScore
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-gray-400"
                      }`}
                    >
                      {lead.leadScore || "-"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      / 5
                    </span>
                  </div>
                  {lead.leadScoreReason && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                      {lead.leadScoreReason}
                    </p>
                  )}
                </div>
              </div>

              {lead.websiteObservations && (
                <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50 md:grid-cols-3">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-500">
                      Performance Issues
                    </p>
                    {lead.websiteObservations.performanceIssues?.length > 0 ? (
                      <ul className="list-inside list-disc space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {lead.websiteObservations.performanceIssues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs italic text-gray-500">None identified</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-orange-500">
                      Trust Issues
                    </p>
                    {lead.websiteObservations.trustIssues?.length > 0 ? (
                      <ul className="list-inside list-disc space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {lead.websiteObservations.trustIssues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs italic text-gray-500">None identified</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-500">
                      Conversion Issues
                    </p>
                    {lead.websiteObservations.conversionIssues?.length > 0 ? (
                      <ul className="list-inside list-disc space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {lead.websiteObservations.conversionIssues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs italic text-gray-500">None identified</p>
                    )}
                  </div>
                </div>
              )}

              {needsAnalysisBeforeDesign && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    Analyze their website first
                  </p>
                  <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                    This lead has a website URL. Run <strong>Analyze with AI</strong> above so new designs
                    can fix trust, conversion, and performance issues found on their current site.
                  </p>
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                  >
                    <FaMagic className={analyzing ? "animate-spin" : ""} />
                    {analyzing ? "Analyzing..." : "Analyze with AI"}
                  </button>
                </div>
              )}

              {hasWebsiteAnalysis && (
                <AnalysisDesignFixes observations={lead.websiteObservations} />
              )}

              <div className="space-y-2">
                <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  AI Summary & Pitch
                </p>
                <p className="rounded-lg bg-gray-50 p-3 text-sm leading-relaxed text-gray-800 dark:bg-gray-700 dark:text-white">
                  {lead.aiSummary || "No AI summary available yet."}
                </p>
                
                <div className="flex flex-wrap gap-3 pt-2">
                  {!lead.layoutVersions || lead.layoutVersions.length === 0 ? (
                    <button
                      onClick={handleGenerateLayout}
                      disabled={generatingLayout || needsAnalysisBeforeDesign}
                      title={
                        needsAnalysisBeforeDesign
                          ? "Run Analyze with AI first"
                          : undefined
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaMagic className={generatingLayout ? "animate-spin" : ""} />
                      {generatingLayout ? "Generating Designs..." : "Prepare 2 Website Designs"}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate(`/leads/${id}/presentation`)}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:opacity-90"
                      >
                        <FaThumbsUp />
                        View Design Presentation
                      </button>
                      <button
                        onClick={handleGenerateLayout}
                        disabled={generatingLayout || needsAnalysisBeforeDesign}
                        title={
                          needsAnalysisBeforeDesign
                            ? "Run Analyze with AI first"
                            : undefined
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                      >
                        <FaSync className={generatingLayout ? "animate-spin" : ""} />
                        {generatingLayout ? "Regenerating..." : "Regenerate Designs"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pain Points
                </p>
                {lead.painPoints && lead.painPoints.length > 0 ? (
                  <ul className="list-inside list-disc text-gray-800 dark:text-white">
                    {lead.painPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm italic text-gray-500 dark:text-gray-400">
                    No pain points identified yet.
                  </p>
                )}
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-white">
                    <FaEnvelope className="text-blue-600" /> AI Email Draft
                  </h4>
                  <div className="flex gap-3">
                    {!isEditingEmail && emailDraftReady && (
                      <button
                        onClick={handleEditEmail}
                        className="text-sm text-gray-600 hover:underline dark:text-gray-400"
                      >
                        Edit Draft
                      </button>
                    )}
                    <button
                      onClick={handleGenerateEmail}
                      disabled={generatingEmail || isEditingEmail}
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400 disabled:opacity-50"
                    >
                      {generatingEmail
                        ? "Generating..."
                        : lead.emailDraft
                        ? "Regenerate"
                        : "Generate Draft"}
                    </button>
                  </div>
                </div>

                {emailDraftReady ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                    {isEditingEmail ? (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                            Subject
                          </label>
                          <input
                            type="text"
                            value={editedEmailSubject}
                            onChange={(e) =>
                              setEditedEmailSubject(e.target.value)
                            }
                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                            Body
                          </label>
                          <textarea
                            value={editedEmailBody}
                            onChange={(e) =>
                              setEditedEmailBody(e.target.value)
                            }
                            rows={10}
                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setIsEditingEmail(false)}
                            className="rounded px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEmailDraft}
                            className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                          >
                            Save Draft
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                              Subject
                            </span>
                            <p className="mb-2 font-medium text-gray-800 dark:text-white">
                              {lead.emailDraft.subject}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(lead.emailDraft!.subject)
                            }
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FaCopy />
                          </button>
                        </div>
                        <div className="relative">
                          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                            Body
                          </span>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap dark:text-gray-300">
                            {lead.emailDraft.body}
                          </p>
                          <button
                            onClick={() =>
                              copyToClipboard(lead.emailDraft!.body)
                            }
                            className="absolute right-0 top-0 text-gray-400 hover:text-gray-600"
                          >
                            <FaCopy />
                          </button>
                        </div>
                        {hasDesigns && designShareUrl && (
                          <DesignShareLinks shareUrl={designShareUrl} compact />
                        )}
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={handleSendEmail}
                            disabled={sendingEmail}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                              sendingEmail
                                ? "cursor-not-allowed bg-blue-400"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            <FaEnvelope className="h-4 w-4" />
                            {sendingEmail ? "Sending..." : "Send Mail"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center dark:bg-gray-800">
                    <p className="text-sm text-gray-500">
                      No email draft generated yet.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-white">
                    <FaWhatsapp className="text-green-600" /> AI WhatsApp Draft
                  </h4>
                  <div className="flex gap-3">
                    {!isEditingWhatsApp && whatsappDraftReady && (
                      <button
                        onClick={handleEditWhatsApp}
                        className="text-sm text-gray-600 hover:underline dark:text-gray-400"
                      >
                        Edit Draft
                      </button>
                    )}
                    <button
                      onClick={handleGenerateWhatsApp}
                      disabled={generatingWhatsApp || isEditingWhatsApp}
                      className="text-sm text-green-600 hover:underline dark:text-green-400 disabled:opacity-50"
                    >
                      {generatingWhatsApp
                        ? "Generating..."
                        : lead.whatsappDraft
                        ? "Regenerate"
                        : "Generate Draft"}
                    </button>
                  </div>
                </div>

                {whatsappDraftReady ? (
                  <div className="relative rounded-lg border border-green-200 bg-green-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                    {isEditingWhatsApp ? (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                            Message Body
                          </label>
                          <textarea
                            value={editedWhatsAppBody}
                            onChange={(e) =>
                              setEditedWhatsAppBody(e.target.value)
                            }
                            rows={5}
                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setIsEditingWhatsApp(false)}
                            className="rounded px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveWhatsAppDraft}
                            className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
                          >
                            Save Draft
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap dark:text-white">
                          {lead.whatsappDraft.body}
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(lead.whatsappDraft!.body)
                          }
                          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                          <FaCopy />
                        </button>
                      </>
                    )}
                    {hasDesigns && designShareUrl && !isEditingWhatsApp && (
                      <DesignShareLinks shareUrl={designShareUrl} compact />
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center dark:bg-gray-800">
                    <p className="text-sm text-gray-500">
                      No WhatsApp draft generated yet.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-white">
                    <FaDesktop className="text-blue-600" /> Website Designs
                  </h4>
                  <div className="flex items-center gap-2">
                    {lead.clientApproved && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                        <FaCheckCircle className="h-3 w-3" /> Approved
                      </span>
                    )}
                    {!lead.clientApproved && lead.clientChangeRequest && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                        <FaEdit className="h-3 w-3" /> Changes Requested
                      </span>
                    )}
                    {hasPreparedDesigns(lead) && (
                      <button
                        onClick={() => navigate(`/leads/${id}/presentation`)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                      >
                        View Presentation
                        <FaArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {lead.clientChangeRequest && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700/50 dark:bg-amber-900/20">
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                      Change Request from Client
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-amber-900 dark:text-amber-100">
                      {lead.clientChangeRequest}
                    </p>
                    {lead.clientChangeRequestedAt && (
                      <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                        Received: {new Date(lead.clientChangeRequestedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {lead.clientApproved && (
                  <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-700/50 dark:bg-emerald-900/20">
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                      Design Approved by Client
                    </p>
                    <p className="mb-1 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                      {lead.clientApprovedLayoutName || "Selected Design"}
                    </p>
                    <p className="text-sm text-emerald-800 dark:text-emerald-200">
                      The client has approved this design.
                    </p>
                    {lead.clientApprovedAt && (
                      <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                        Approved: {new Date(lead.clientApprovedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {hasPreparedDesigns(lead) ? (
                  <div className="space-y-3">
                    {designShareUrl && (
                      <DesignShareLinks shareUrl={designShareUrl} />
                    )}
                    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900/50">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {(() => {
                        const selectedVersionId =
                          lead.selectedLayoutId ||
                          localStorage.getItem(`lead_${id}_selectedLayout`) ||
                          layoutVersions.find((v) => v.isRecommended)?.id ||
                          layoutVersions[0]?.id;

                        return layoutVersions.map((version) => {
                          const isApproved = isVersionClientApproved(version, lead);
                          const isSelected = !isApproved && version.id === selectedVersionId;

                          return (
                            <DesignSummaryCard
                              key={version.id}
                              version={version}
                              businessName={lead.businessName}
                              industry={lead.industry}
                              businessType={lead.businessType}
                              isSelected={isSelected}
                              isApproved={isApproved}
                              onClick={() => navigate(`/leads/${id}/presentation`)}
                            />
                          );
                        });
                      })()}
                    </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 py-10 text-center dark:border-gray-600 dark:bg-gray-800/50">
                    <FaLayerGroup className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      No website designs generated yet
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Use the button above to prepare 2 website designs
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 space-y-6 lg:order-2">
          <div className="rounded-xl bg-white p-5 shadow dark:bg-white/[0.03]">
            <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">
              Contact Information
            </h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {lead.contactName && (
                <p>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Contact Name:{" "}
                  </span>
                  <span>{lead.contactName}</span>
                </p>
              )}
              {lead.email && (
                <p>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Email:{" "}
                  </span>
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
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Phone:{" "}
                  </span>
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
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Website:{" "}
                  </span>
                  <a
                    href={
                      lead.website.startsWith("http")
                        ? lead.website
                        : `https://${lead.website}`
                    }
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
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Source:{" "}
                  </span>
                  <span>{lead.source}</span>
                </p>
              )}
              {!lead.contactName &&
                !lead.email &&
                !lead.phone &&
                !lead.website && (
                  <p className="text-gray-500 dark:text-gray-400">
                    No contact information available
                  </p>
                )}
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow dark:bg-white/[0.03]">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Notes
              </h3>
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
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNotes(e.target.value)
                  }
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
                    className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {lead.notes || "No notes added yet."}
              </p>
            )}
          </div>

          <div className="rounded-xl bg-white p-5 shadow dark:bg-white/[0.03]">
            <h3 className="mb-4 font-semibold text-gray-800 dark:text-white">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 dark:text-gray-400 sm:grid-cols-2">
              <p>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Created:{" "}
                </span>
                <span>{formatDate(lead.createdAt)}</span>
              </p>
              <p>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Last Updated:{" "}
                </span>
                <span>{formatDate(lead.updatedAt)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
