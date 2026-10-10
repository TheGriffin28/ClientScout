import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { adminService, AdminUser } from "../../services/adminService";
import { toast } from "react-hot-toast";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { TableSkeleton } from "../../components/ui/Skeleton";
import UserLimitsModal from "./components/UserLimitsModal";
import Input from "../../components/form/input/InputField";

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await adminService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const newStatus = !user.isActive;
    try {
      await adminService.toggleUserStatus(user.id, newStatus);
      setUsers(users.map(u => u.id === user.id ? { ...u, isActive: newStatus } : u));
      toast.success(`User ${user.name} has been ${newStatus ? "activated" : "suspended"}`);
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleRoleChange = async (user: AdminUser, newRole: "admin" | "user") => {
    try {
      await adminService.updateUserRole(user.id, newRole);
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      toast.success(`User ${user.name} role updated to ${newRole}`);
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const openLimitsModal = (user: AdminUser) => {
    setSelectedUser(user);
    setIsLimitsModalOpen(true);
  };

  const handleSaveLimits = async (userId: string, updates: Partial<AdminUser>) => {
      try {
        // @ts-ignore
        await adminService.updateUserLimits(userId, updates);
        
        // Update local state
        setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
        toast.success("User limits updated successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to update user limits");
        throw error; // Re-throw so modal knows it failed
      }
  };

  return (
    <>
      <PageMeta
        title="User Management | ClientScout Admin"
        description="Manage ClientScout users"
      />
      <PageBreadCrumb pageTitle="User Management" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:w-72">
             <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full"
              />
          </div>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" onClick={fetchUsers}>
               Refresh
             </Button>
          </div>
        </div>

        <ComponentCard title={`Users List (${filteredUsers.length})`}>
          <div className="overflow-x-auto">
            {loading ? (
              <TableSkeleton rows={8} cols={5} />
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage (Used / Max)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2 items-start">
                            <div className="flex gap-2">
                                <Badge color={user.role === "admin" ? "primary" : "light"}>
                                    {user.role.toUpperCase()}
                                </Badge>
                                <Badge color={user.isActive ? "success" : "error"}>
                                    {user.isActive ? "Active" : "Suspended"}
                                </Badge>
                            </div>
                            <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user, e.target.value as "admin" | "user")}
                                className="text-xs bg-transparent border-none text-blue-500 hover:text-blue-700 p-0 focus:ring-0 cursor-pointer"
                            >
                                <option value="user">Switch to User</option>
                                <option value="admin">Switch to Admin</option>
                            </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                            <div className="flex justify-between gap-4">
                                <span>AI:</span>
                                <span className="font-mono">
                                    {user.aiUsageCount} / {user.maxMonthlyAICallsPerUser ?? "Def"}
                                    {user.extraAICallsCredits ? <span className="text-success-600"> (+{user.extraAICallsCredits})</span> : ""}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span>Maps:</span>
                                <span className="font-mono">
                                    {user.mapSearchCount ?? 0} / {user.maxMonthlyMapSearchesPerUser ?? "Def"}
                                    {user.extraMapSearchCredits ? <span className="text-success-600"> (+{user.extraMapSearchCredits})</span> : ""}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span>Emails:</span>
                                <span className="font-mono">
                                    Limit: {user.maxMonthlyEmailsPerUser ?? "Def"}
                                    {user.extraEmailCredits ? <span className="text-success-600"> (+{user.extraEmailCredits})</span> : ""}
                                </span>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div>
                            <div className="text-xs">AI: {user.lastAIUsedAt ? new Date(user.lastAIUsedAt).toLocaleDateString() : "-"}</div>
                            <div className="text-xs">Created: {new Date(user.createdAt).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openLimitsModal(user)}
                            >
                                Limits
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(user)}
                                className={user.isActive ? "text-error-600 border-error-200 hover:bg-error-50" : "text-success-600 border-success-200 hover:bg-success-50"}
                            >
                                {user.isActive ? "Suspend" : "Activate"}
                            </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                      <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                              No users found matching "{searchQuery}"
                          </td>
                      </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </ComponentCard>
      </div>

      {selectedUser && (
        <UserLimitsModal
          isOpen={isLimitsModalOpen}
          onClose={() => {
            setIsLimitsModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSave={handleSaveLimits}
        />
      )}
    </>
  );
};

export default AdminUsers;
