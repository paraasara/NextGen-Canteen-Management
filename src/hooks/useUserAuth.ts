
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useUserAuth = () => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userFormData, setUserFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserFormData({
      ...userFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUserSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.email || !userFormData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Check if the email is an admin email - prevent admin login through student tab
    const adminEmails = ['admin@gmail.com', 'chinmayir30@gmail.com'];
    if (adminEmails.includes(userFormData.email)) {
      toast({
        title: "Access Denied",
        description: "Admin accounts must use the Admin Login tab.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await signIn(userFormData.email, userFormData.password);
    } catch (error) {
      // Error is handled in the signIn function
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.email || !userFormData.password || !userFormData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (userFormData.password !== userFormData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Prevent admin email signup through student signup
    const adminEmails = ['admin@gmail.com', 'chinmayir30@gmail.com'];
    if (adminEmails.includes(userFormData.email)) {
      toast({
        title: "Access Denied",
        description: "Admin accounts cannot be created through student signup.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await signUp(userFormData.email, userFormData.password);
    } catch (error) {
      // Error is handled in the signUp function
    } finally {
      setLoading(false);
    }
  };

  return {
    userFormData,
    loading,
    handleUserInputChange,
    handleUserSignIn,
    handleSignUp,
  };
};
