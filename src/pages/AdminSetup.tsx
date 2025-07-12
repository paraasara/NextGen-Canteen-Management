
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const AdminSetup = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [autoFill, setAutoFill] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  // Pre-populate the email field if it's on the query string or default to chinmayir30@gmail.com
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const autoFillParam = urlParams.get('autofill');
    
    if (autoFillParam === 'true') {
      setEmail('chinmayir30@gmail.com');
      setAutoFill(true);
    }
  }, []);

  const handleSetupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setErrorDetails(null);
    
    try {
      console.log("Setting up admin for email:", email);
      const { data, error } = await supabase.functions.invoke('setup-admin', {
        body: { email },
      });
      
      console.log("Response from setup-admin function:", data, error);
      
      if (error) throw error;
      
      if (!data || data.success === false) {
        throw new Error(data?.error || "Failed to set admin role");
      }
      
      toast({
        title: "Success!",
        description: data.message || "Admin role has been granted successfully.",
      });
      
      // Refresh the profile to get updated role
      await refreshProfile();
      
      // Redirect to admin dashboard
      navigate('/admin');
    } catch (error: any) {
      console.error("Error in setup admin:", error);
      setErrorDetails(error.message || "An unknown error occurred while setting up admin privileges.");
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Admin Setup</h1>
          
          {autoFill && (
            <Alert className="mb-6">
              <AlertTitle>Auto-filled Email</AlertTitle>
              <AlertDescription>
                The email address has been pre-filled for you. Click "Make Admin" to grant admin privileges.
              </AlertDescription>
            </Alert>
          )}
          
          {errorDetails && (
            <Alert className="mb-6" variant="destructive">
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap">
                {errorDetails}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleSetupAdmin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Currently only chinmayir30@gmail.com is approved for admin access.
                </p>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Make Admin"
                )}
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">
                This will grant admin privileges to the specified email address.
              </p>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminSetup;
