import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getLeads, createLead, updateLead, deleteLead, Lead, LeadFormData } from "../services/leadService";
import StatusBadge from "../components/common/StatusBadge";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import { CalenderIcon } from "../icons";
import { FaEnvelope, FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { openEmail, openWhatsApp, openCall } from "../services/outreachService";

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<LeadFormData>({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    source: "Manual",
    status: "New",
    notes: "",
    nextFollowUp: "",
  });
  const navigate = useNavigate();
  const datePickerRef = useRef<HTMLInputElement>(null);
  const flatpickrInstance = useRef<flatpickr.Instance | null>(null);
  const initialDateRef = useRef<string>("");

  useEffect(() => {
    fetchLeads();
  }, []);

  // Initialize date picker when modal opens (only once when open becomes true)
  useEffect(() => {
    if (open && datePickerRef.current) {
      // Small delay to ensure formData is set when editing
      const timer = setTimeout(() => {
        const inputElement = datePickerRef.current;
        if (!inputElement) return;

        // Destroy existing instance if any
        if (flatpickrInstance.current && !Array.isArray(flatpickrInstance.current)) {
          flatpickrInstance.current.destroy();
          flatpickrInstance.current = null;
        }

        // Use the ref value which was set in handleOpen
        const initialDate = initialDateRef.current || undefined;
        
        flatpickrInstance.current = flatpickr(inputElement, {
          dateFormat: "Y-m-d",
          defaultDate: initialDate,
          minDate: "today",
          allowInput: false,
          onChange: (_selectedDates, dateStr) => {
            // Use functional update to avoid stale closure
            setFormData((prev) => ({
              ...prev,
              nextFollowUp: dateStr || "",
            }));
          },
        });
      }, 50);

      return () => {
        clearTimeout(timer);
        if (flatpickrInstance.current && !Array.isArray(flatpickrInstance.current)) {
          flatpickrInstance.current.destroy();
          flatpickrInstance.current = null;
        }
      };
    }
  }, [open]); // Only depend on open, not formData to prevent re-initialization

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await getLeads();
      setLeads(data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (lead: Lead | null = null) => {
    if (lead) {
      const nextFollowUp = lead.nextFollowUp ? new Date(lead.nextFollowUp).toISOString().split('T')[0] : "";
      initialDateRef.current = nextFollowUp;
      setEditingLead(lead);
      setFormData({
        businessName: lead.businessName || "",
        contactName: lead.contactName || "",
        email: lead.email || "",
        phone: lead.phone || "",
        website: lead.website || "",
        source: lead.source || "Manual",
        status: lead.status || "New",
        notes: lead.notes || "",
        nextFollowUp: nextFollowUp,
      });
    } else {
      initialDateRef.current = "";
      setEditingLead(null);
      setFormData({
        businessName: "",
        contactName: "",
        email: "",
        phone: "",
        website: "",
        source: "Manual",
        status: "New",
        notes: "",
        nextFollowUp: "",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    // Clean up date picker
    if (flatpickrInstance.current && !Array.isArray(flatpickrInstance.current)) {
      flatpickrInstance.current.destroy();
      flatpickrInstance.current = null;
    }
    
    setOpen(false);
    setEditingLead(null);
    setErrors({});
    setSubmitting(false);
    
    // Reset form data after a small delay to prevent form reset during date selection
    setTimeout(() => {
      setFormData({
        businessName: "",
        contactName: "",
        email: "",
        phone: "",
        website: "",
        source: "Manual",
        status: "New",
        notes: "",
        nextFollowUp: "",
      });
    }, 100);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website) && formData.website.trim() !== "") {
      // Allow empty or auto-format URLs
      if (formData.website.trim() !== "") {
        newErrors.website = "Please enter a valid URL (starting with http:// or https://)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      let submitData: LeadFormData = {
        ...formData,
        businessName: formData.businessName.trim(),
        contactName: formData.contactName?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        website: formData.website?.trim() || undefined,
        source: formData.source || "Manual",
        notes: formData.notes?.trim() || undefined,
        nextFollowUp: formData.nextFollowUp?.trim() || "",
      };

      // Auto-format website URL if provided
      if (submitData.website && !submitData.website.startsWith('http')) {
        submitData.website = `https://${submitData.website}`;
      }

      if (editingLead) {
        await updateLead(editingLead._id, submitData);
      } else {
        await createLead(submitData);
      }
      await fetchLeads();
      handleClose();
    } catch (error: any) {
      console.error("Error saving lead:", error);
      const errorMessage = error?.response?.data?.message || "Error saving lead. Please try again.";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) {
      return;
    }
    try {
      await deleteLead(id);
      await fetchLeads();
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert("Error deleting lead. Please try again.");
    }
  };

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white">
        Leads
      </h1>

      <button
        onClick={() => handleOpen()}
        className="mb-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        + Add Lead
      </button>


      {/* Table */}
      {loading ? (
        <div className="rounded-xl bg-white p-6 shadow-md dark:bg-boxdark">
          <p className="text-center text-gray-600 dark:text-gray-300">Loading leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-md dark:bg-boxdark">
          <p className="text-center text-gray-600 dark:text-gray-300">No leads found. Create your first lead!</p>
        </div>
      ) : (
        <div className="rounded-xl bg-white shadow-md dark:bg-boxdark">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 dark:border-strokedark">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">
                  Business
                </th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">
                  Contact
                </th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">
                  Follow-up
                </th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead._id}
                  className="border-b border-gray-100 last:border-0 dark:border-strokedark"
                >
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">
                    {lead.businessName}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {lead.contactName || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {lead.nextFollowUp
                      ? new Date(lead.nextFollowUp).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Quick Action Icons */}
                      <div className="flex gap-2">
                        {lead.email && (
                          <button
                            onClick={() => openEmail({ lead })}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/20"
                            title="Send Email"
                          >
                            <FaEnvelope className="w-4 h-4" />
                          </button>
                        )}
                        {lead.phone && (
                          <>
                            <button
                              onClick={() => openWhatsApp({ lead })}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors dark:hover:bg-green-900/20"
                              title="Send WhatsApp"
                            >
                              <FaWhatsapp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openCall(lead.phone!)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors dark:hover:bg-gray-700 dark:text-gray-400"
                              title="Call"
                            >
                              <FaPhoneAlt className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                      
                      {/* Standard Actions */}
                      <div className="flex gap-3 border-l border-gray-200 dark:border-gray-700 pl-3 ml-1">
                        <button
                          onClick={() => navigate(`/leads/${lead._id}`)}
                          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleOpen(lead)}
                          className="text-sm font-medium text-green-600 hover:underline dark:text-green-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl dark:bg-boxdark overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5 dark:border-strokedark dark:bg-boxdark flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {editingLead ? "Edit Lead" : "Add New Lead"}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form - Scrollable */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-5">
                {/* Business Information Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">
                    Business Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Business Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={(e) => {
                          setFormData({ ...formData, businessName: e.target.value });
                          if (errors.businessName) {
                            setErrors({ ...errors, businessName: "" });
                          }
                        }}
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 ${
                          errors.businessName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter business name"
                      />
                      {errors.businessName && (
                        <p className="mt-1 text-xs text-red-500">{errors.businessName}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={formData.contactName || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, contactName: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        placeholder="Contact person name"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Source
                      </label>
                      <select
                        value={formData.source || "Manual"}
                        onChange={(e) =>
                          setFormData({ ...formData, source: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                      >
                        <option value="Manual">Manual</option>
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Email Campaign">Email Campaign</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">
                    Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) {
                            setErrors({ ...errors, email: "" });
                          }
                        }}
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="example@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Website
                      </label>
                      <input
                        type="text"
                        value={formData.website || ""}
                        onChange={(e) => {
                          setFormData({ ...formData, website: e.target.value });
                          if (errors.website) {
                            setErrors({ ...errors, website: "" });
                          }
                        }}
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 ${
                          errors.website ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="https://example.com or example.com"
                      />
                      {errors.website && (
                        <p className="mt-1 text-xs text-red-500">{errors.website}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">URL will be automatically formatted</p>
                    </div>
                  </div>
                </div>

                {/* Status & Follow-up Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">
                    Status & Follow-up
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value as LeadFormData["status"] })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="FollowUp">Follow-up</option>
                        <option value="Interested">Interested</option>
                        <option value="Converted">Converted</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Next Follow-up
                      </label>
                      <div className="relative">
                        <input
                          ref={datePickerRef}
                          type="text"
                          readOnly
                          value={formData.nextFollowUp || ""}
                          placeholder="Select date"
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 cursor-pointer"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none dark:text-gray-400">
                          <CalenderIcon className="size-5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ""}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    rows={4}
                    placeholder="Add any additional notes about this lead..."
                  />
                </div>

              </div>

              {/* Footer Actions */}
              <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-strokedark">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {editingLead ? "Updating..." : "Saving..."}
                    </span>
                  ) : (
                    editingLead ? "Update Lead" : "Create Lead"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>

    
  );
};

export default Leads;
