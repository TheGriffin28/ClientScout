import React, { useState } from "react";
import { Modal } from "../ui/modal";
import { generateWhatsAppDraft, sendWhatsApp } from "../../services/outreachService";
import { Lead } from "../../services/leadService";
import { FaWhatsapp, FaMagic } from "react-icons/fa";
import toast from "react-hot-toast";

interface WhatsAppDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

const WhatsAppDraftModal: React.FC<WhatsAppDraftModalProps> = ({ isOpen, onClose, lead }) => {
  const [messageBody, setMessageBody] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleGenerateDraft = async () => {
    if (!lead) return;
    setIsGenerating(true);
    try {
      const draft = await generateWhatsAppDraft(lead);
      setMessageBody(draft.body);
      toast.success("Draft generated!");
    } catch (error) {
      toast.error("Failed to generate draft");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!lead) return;
    setIsSending(true);
    try {
      await sendWhatsApp(lead._id, { body: messageBody });
      toast.success("WhatsApp opened!");
      onClose();
    } catch (error) {
      toast.error("Failed to open WhatsApp");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`WhatsApp to ${lead?.businessName}`}>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate a personalized WhatsApp message using AI.
          </p>
          <button
            onClick={handleGenerateDraft}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-medium"
          >
            <FaMagic className={isGenerating ? "animate-spin" : ""} />
            {isGenerating ? "Generating..." : "Generate with AI"}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
          <textarea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors h-48 resize-none text-sm leading-relaxed bg-white dark:bg-gray-700 dark:text-white"
            placeholder="Your WhatsApp message..."
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSendMessage}
            disabled={isSending || !messageBody.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Opening WhatsApp...
              </>
            ) : (
              <>
                <FaWhatsapp /> Send Message
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WhatsAppDraftModal;
