
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useUserAuth } from "@/hooks/useUserAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import UserAuthTabs from "@/components/auth/UserAuthTabs";
import AdminLoginForm from "@/components/auth/AdminLoginForm";

const Login = () => {
  const navigate = useNavigate();
  const { authState, profile, loading: authLoading } = useAuth();
  
  const {
    userFormData,
    loading: userLoading,
    handleUserInputChange,
    handleUserSignIn,
    handleSignUp,
  } = useUserAuth();

  const {
    adminFormData,
    loading: adminLoading,
    isAdminLogin,
    setIsAdminLogin,
    handleAdminInputChange,
    handleAdminSignIn,
  } = useAdminAuth();

  const loading = userLoading || adminLoading;

  // Redirect if already logged in - wait for profile to load
  useEffect(() => {
    if (authState.user && !authState.loading && !authLoading) {
      console.log("User logged in, profile:", profile);
      // Only redirect after we have profile information or confirmed there's no profile
      if (profile?.role === 'admin' || isAdminLogin) {
        console.log("Redirecting admin to dashboard");
        navigate('/admin/dashboard');
      } else if (profile?.role === 'student' || profile === null) {
        console.log("Redirecting student/user to home");
        navigate('/home');
      }
      // If profile is still loading, don't redirect yet
    }
  }, [authState.user, authState.loading, authLoading, profile, navigate, isAdminLogin]);

  // Show loading while auth is being determined
  if (authState.loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-gray-50">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to College Canteen</CardTitle>
              <CardDescription>
                Choose your login type below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="user" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="user">Student Login</TabsTrigger>
                  <TabsTrigger value="admin">Admin Login</TabsTrigger>
                </TabsList>
                
                <TabsContent value="user">
                  <UserAuthTabs
                    formData={userFormData}
                    loading={loading}
                    onInputChange={handleUserInputChange}
                    onSignIn={handleUserSignIn}
                    onSignUp={handleSignUp}
                  />
                </TabsContent>
                
                <TabsContent value="admin">
                  <AdminLoginForm
                    formData={adminFormData}
                    loading={loading}
                    onInputChange={handleAdminInputChange}
                    onSubmit={handleAdminSignIn}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
