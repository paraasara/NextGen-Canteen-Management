
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserLoginFormProps {
  formData: {
    email: string;
    password: string;
  };
  loading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const UserLoginForm: React.FC<UserLoginFormProps> = ({
  formData,
  loading,
  onInputChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user-signin-email">Email</Label>
        <Input
          id="user-signin-email"
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
        <Label htmlFor="user-signin-password">Password</Label>
        <Input
          id="user-signin-password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={onInputChange}
          disabled={loading}
          required
        />
      </div>
      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
        {loading ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  );
};

export default UserLoginForm;
