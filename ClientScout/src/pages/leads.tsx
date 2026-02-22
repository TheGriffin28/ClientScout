import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getLeads, createLead, updateLead, deleteLead, Lead, LeadFormData } from "../services/leadService";
import StatusBadge from "../components/common/StatusBadge";
import {
  FaSearch,
  FaPlus,
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp,
  FaTrash,
  FaEdit
} from "react-icons/fa";
import { openCall } from "../services/outreachService";
import { TableSkeleton } from "../components/ui/Skeleton";
import AddEditLeadModal from "../components/leads/AddEditLeadModal";
import EmailDraftModal from "../components/leads/EmailDraftModal";
import WhatsAppDraftModal from "../components/leads/WhatsAppDraftModal";

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Selection
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [outreachLead, setOutreachLead] = useState<Lead | null>(null);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  // Search Debounce
  const [searchInput, setSearchInput] = useState(searchQuery);

  const fetchLeads = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const data: any = await getLeads(page, 10, search);
      if (data.leads) {
        setLeads(data.leads);
        setTotalPages(data.totalPages);
        setTotalLeads(data.totalLeads);
      } else {
        setLeads([]);
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchParams({ search: searchInput });
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput, setSearchParams, searchQuery]);

  useEffect(() => {
    fetchLeads(currentPage, searchQuery);
  }, [currentPage, searchQuery, fetchLeads]);

  // Bulk Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeadIds(leads.map(l => l._id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleSelectLead = (id: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedLeadIds.length} leads?`)) return;
    
    const toastId = toast.loading("Deleting leads...");
    try {
      await Promise.all(selectedLeadIds.map(id => deleteLead(id)));
      toast.success("Leads deleted successfully", { id: toastId });
      setSelectedLeadIds([]);
      fetchLeads(currentPage, searchQuery);
    } catch (error) {
      toast.error("Failed to delete leads", { id: toastId });
    }
  };

  // CRUD Handlers
  const handleAddEditSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      if (editingLead) {
        await updateLead(editingLead._id, data);
        toast.success("Lead updated successfully");
      } else {
        await createLead(data);
        toast.success("Lead created successfully");
      }
      setIsAddEditOpen(false);
      setEditingLead(null);
      fetchLeads(currentPage, searchQuery);
    } catch (error) {
      console.error(error);
      toast.error("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await deleteLead(id);
      toast.success("Lead deleted");
      fetchLeads(currentPage, searchQuery);
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage and track your potential clients</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-64 shadow-sm placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <button 
            onClick={() => { setEditingLead(null); setIsAddEditOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md font-medium"
          >
            <FaPlus size={14} /> Add Lead
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedLeadIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded-lg flex items-center justify-between animate-fade-in">
          <span className="text-blue-700 dark:text-blue-300 font-medium px-2">
            {selectedLeadIds.length} lead{selectedLeadIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedLeadIds([])}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium px-3 py-1.5"
            >
              Cancel
            </button>
            <button 
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 px-4 py-1.5 rounded-md transition-colors text-sm font-medium"
            >
              <FaTrash size={14} /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
              <FaSearch size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No leads found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
              {searchQuery ? `No results for "${searchQuery}"` : "Get started by adding your first lead manually or importing from maps."}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => { setEditingLead(null); setIsAddEditOpen(true); }}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add New Lead
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="p-4 w-12 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer dark:bg-gray-700"
                        checked={leads.length > 0 && selectedLeadIds.length === leads.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {leads.map((lead) => (
                    <tr 
                      key={lead._id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group ${selectedLeadIds.includes(lead._id) ? 'bg-blue-50/30 dark:bg-blue-900/20' : ''}`}
                    >
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer dark:bg-gray-700"
                          checked={selectedLeadIds.includes(lead._id)}
                          onChange={() => handleSelectLead(lead._id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          <Link to={`/leads/${lead._id}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                            {lead.businessName}
                          </Link>
                        </div>
                        {lead.website && (
                          <a 
                            href={lead.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-blue-500 hover:underline truncate block max-w-[200px]"
                          >
                            {lead.website.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900 dark:text-gray-200">{lead.contactName || "—"}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{lead.email || lead.phone || "No contact info"}</div>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="p-4">
                        {lead.leadScore ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            lead.leadScore >= 80 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                            lead.leadScore >= 50 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                            "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}>
                            {lead.leadScore}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setOutreachLead(lead); setIsEmailOpen(true); }}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="Send Email"
                          >
                            <FaEnvelope size={14} />
                          </button>
                          <button 
                            onClick={() => { setOutreachLead(lead); setIsWhatsAppOpen(true); }}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                            title="WhatsApp"
                          >
                            <FaWhatsapp size={14} />
                          </button>
                          {lead.phone && (
                            <button 
                              onClick={() => openCall(lead.phone!)}
                              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded transition-colors"
                              title="Call"
                            >
                              <FaPhoneAlt size={14} />
                            </button>
                          )}
                          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                          <button 
                            onClick={() => { setEditingLead(lead); setIsAddEditOpen(true); }}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(lead._id)}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Delete"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {leads.map((lead) => (
                <div 
                  key={lead._id} 
                  className={`bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm ${
                    selectedLeadIds.includes(lead._id) 
                      ? 'border-blue-500 dark:border-blue-500 ring-1 ring-blue-500' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        className="mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer dark:bg-gray-700"
                        checked={selectedLeadIds.includes(lead._id)}
                        onChange={() => handleSelectLead(lead._id)}
                      />
                      <div>
                        <Link 
                          to={`/leads/${lead._id}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block"
                        >
                          {lead.businessName}
                        </Link>
                        {lead.website && (
                          <a 
                            href={lead.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-blue-500 hover:underline truncate block max-w-[200px]"
                          >
                            {lead.website.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs block mb-1">Contact</span>
                      <div className="text-gray-900 dark:text-gray-200 font-medium">{lead.contactName || "—"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{lead.email || lead.phone}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs block mb-1">Score</span>
                      {lead.leadScore ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          lead.leadScore >= 80 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                          lead.leadScore >= 50 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}>
                          {lead.leadScore}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setOutreachLead(lead); setIsEmailOpen(true); }}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                      >
                        <FaEnvelope size={16} />
                      </button>
                      <button 
                        onClick={() => { setOutreachLead(lead); setIsWhatsAppOpen(true); }}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                      >
                        <FaWhatsapp size={16} />
                      </button>
                      {lead.phone && (
                        <button 
                          onClick={() => openCall(lead.phone!)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded transition-colors"
                        >
                          <FaPhoneAlt size={16} />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setEditingLead(lead); setIsAddEditOpen(true); }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(lead._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Pagination */}
        {leads.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(currentPage * 10, totalLeads)}</span> of <span className="font-medium">{totalLeads}</span> leads
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddEditLeadModal 
        isOpen={isAddEditOpen} 
        onClose={() => { setIsAddEditOpen(false); setEditingLead(null); }} 
        onSubmit={handleAddEditSubmit}
        initialData={editingLead}
        isSubmitting={isSubmitting}
      />
      
      <EmailDraftModal 
        isOpen={isEmailOpen} 
        onClose={() => setIsEmailOpen(false)} 
        lead={outreachLead} 
      />
      
      <WhatsAppDraftModal 
        isOpen={isWhatsAppOpen} 
        onClose={() => setIsWhatsAppOpen(false)} 
        lead={outreachLead} 
      />
    </div>
  );
};

export default Leads;
