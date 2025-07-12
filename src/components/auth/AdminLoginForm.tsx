
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminLoginFormProps {
  formData: {
    email: string;
    password: string;
  };
  loading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({
  formData,
  loading,
  onInputChange,
  onSubmit,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <p className="text-sm text-yellow-800">
          <strong>Admin Access:</strong> Only authorized email addresses can access admin features.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Admin Email</Label>
          <Input
            id="admin-email"
            name="email"
            type="email"
            placeholder="Enter admin email"
            value={formData.email}
            onChange={onInputChange}
            disabled={loading}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Admin Password</Label>
          <Input
            id="admin-password"
            name="password"
            type="password"
            placeholder="Enter admin password"
            value={formData.password}
            onChange={onInputChange}
            disabled={loading}
            required
          />
        </div>
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
          {loading ? "Signing In..." : "Admin Sign In"}
        </Button>
      </form>
    </div>
  );
};

export default AdminLoginForm;
