
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminAuth = () => {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    email: "",
    password: "",
  });

  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminFormData({
      ...adminFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminFormData.email || !adminFormData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Check if the email is an admin email before attempting login
    const adminEmails = ['admin@gmail.com', 'chinmayir30@gmail.com'];
    if (!adminEmails.includes(adminFormData.email)) {
      toast({
        title: "Access Denied",
        description: "This email is not authorized for admin access. Please use student login instead.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setIsAdminLogin(true);
    try {
      await signIn(adminFormData.email, adminFormData.password);
    } catch (error) {
      setIsAdminLogin(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    adminFormData,
    loading,
    isAdminLogin,
    setIsAdminLogin,
    handleAdminInputChange,
    handleAdminSignIn,
  };
};
