import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLeadById, updateLead, Lead } from "../services/leadService";
import StatusBadge from "../components/common/StatusBadge";
import { FaEnvelope, FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { openEmail, openWhatsApp, openCall } from "../services/outreachService";

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
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

      <div className="mb-6 flex items-center gap-4">
        <StatusBadge status={lead.status} />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {getTimeAgo(lead.updatedAt)}
        </span>
        {lead.nextFollowUp && (
          <span className="text-sm text-orange-600 dark:text-orange-400">
            Next follow-up: {formatDate(lead.nextFollowUp)}
          </span>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
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
