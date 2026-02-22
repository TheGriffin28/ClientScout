import React, { useState } from "react";
import { Modal } from "../ui/modal";
import { generateEmailDraft, sendEmail } from "../../services/outreachService";
import { Lead } from "../../services/leadService";
import { FaMagic, FaPaperPlane } from "react-icons/fa";
import toast from "react-hot-toast";

interface EmailDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

const EmailDraftModal: React.FC<EmailDraftModalProps> = ({ isOpen, onClose, lead }) => {
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleGenerateEmail = async () => {
    if (!lead) return;
    setIsGenerating(true);
    try {
      const draft = await generateEmailDraft(lead);
      setEmailSubject(draft.subject);
      setEmailBody(draft.body);
      toast.success("Draft generated!");
    } catch (error) {
      toast.error("Failed to generate draft");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!lead) return;
    setIsSending(true);
    try {
      await sendEmail(lead._id, { subject: emailSubject, body: emailBody });
      toast.success("Email sent successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Email to ${lead?.businessName}`}>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate a personalized email draft using AI based on the lead's data.
          </p>
          <button
            onClick={handleGenerateEmail}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium"
          >
            <FaMagic className={isGenerating ? "animate-spin" : ""} />
            {isGenerating ? "Generating..." : "Generate with AI"}
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 dark:text-white"
              placeholder="Email subject line..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message Body</label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-64 resize-none font-mono text-sm leading-relaxed bg-white dark:bg-gray-700 dark:text-white"
              placeholder="Your email message..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSendEmail}
            disabled={isSending || !emailBody.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane /> Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EmailDraftModal;
