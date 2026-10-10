import React, { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { AdminUser } from "../../../services/adminService";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";

interface UserLimitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser;
  onSave: (userId: string, updates: Partial<AdminUser>) => Promise<void>;
}

const UserLimitsModal: React.FC<UserLimitsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    maxMonthlyEmailsPerUser: user.maxMonthlyEmailsPerUser,
    maxMonthlyAICallsPerUser: user.maxMonthlyAICallsPerUser,
    maxMonthlyMapSearchesPerUser: user.maxMonthlyMapSearchesPerUser,
    extraEmailCredits: user.extraEmailCredits || 0,
    extraAICallsCredits: user.extraAICallsCredits || 0,
    extraMapSearchCredits: user.extraMapSearchCredits || 0,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    // Check if field is extra credit
    const isExtra = field.startsWith("extra");
    let numValue: number | null = null;
    
    if (value === "") {
        numValue = isExtra ? 0 : null;
    } else {
        numValue = parseInt(value);
        if (isNaN(numValue)) numValue = isExtra ? 0 : null;
    }

    setFormData((prev) => ({ ...prev, [field]: numValue }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
      handleChange(field, e.target.value);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(user.id, formData);
      onClose();
    } catch (error) {
      console.error("Failed to update user limits", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Limits for ${user.name}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white border-b pb-2">Monthly Limits</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Emails (Monthly)
              </label>
              <Input
                type="number"
                min="0"
                placeholder="Default"
                value={formData.maxMonthlyEmailsPerUser ?? ""}
                onChange={(e) => handleInputChange(e, "maxMonthlyEmailsPerUser")}
                hint="Leave empty for system default"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max AI Calls (Monthly)
              </label>
              <Input
                type="number"
                min="0"
                placeholder="Default"
                value={formData.maxMonthlyAICallsPerUser ?? ""}
                onChange={(e) => handleInputChange(e, "maxMonthlyAICallsPerUser")}
                hint="Leave empty for system default"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Map Searches (Monthly)
              </label>
              <Input
                type="number"
                min="0"
                placeholder="Default"
                value={formData.maxMonthlyMapSearchesPerUser ?? ""}
                onChange={(e) => handleInputChange(e, "maxMonthlyMapSearchesPerUser")}
                hint="Leave empty for system default"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white border-b pb-2">Extra Credits</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Extra Email Credits
              </label>
              <Input
                type="number"
                min="0"
                value={formData.extraEmailCredits || 0}
                onChange={(e) => handleInputChange(e, "extraEmailCredits")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Extra AI Credits
              </label>
              <Input
                type="number"
                min="0"
                value={formData.extraAICallsCredits || 0}
                onChange={(e) => handleInputChange(e, "extraAICallsCredits")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Extra Map Search Credits
              </label>
              <Input
                type="number"
                min="0"
                value={formData.extraMapSearchCredits || 0}
                onChange={(e) => handleInputChange(e, "extraMapSearchCredits")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserLimitsModal;
