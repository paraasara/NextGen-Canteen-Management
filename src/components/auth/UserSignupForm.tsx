
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserSignupFormProps {
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  loading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const UserSignupForm: React.FC<UserSignupFormProps> = ({
  formData,
  loading,
  onInputChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user-signup-email">Email</Label>
        <Input
          id="user-signup-email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={onInputChange}
          disabled={loading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-signup-password">Password</Label>
        <Input
          id="user-signup-password"
          name="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={onInputChange}
          disabled={loading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-confirm-password">Confirm Password</Label>
        <Input
          id="user-confirm-password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={onInputChange}
          disabled={loading}
          required
        />
      </div>
      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
        {loading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
};

export default UserSignupForm;
