
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Form validation schema
const adminSignupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type AdminSignupFormValues = z.infer<typeof adminSignupSchema>;

const AdminSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<AdminSignupFormValues>({
    resolver: zodResolver(adminSignupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const onSubmit = async (values: AdminSignupFormValues) => {
    setLoading(true);
    
    try {
      // 1. First sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      
      if (signUpError) throw signUpError;
      
      if (!signUpData.user) {
        throw new Error("Failed to create user account");
      }
      
      // 2. Then invoke the setup-admin function to grant admin privileges
      const { data: adminData, error: adminError } = await supabase.functions.invoke('setup-admin', {
        body: { email: values.email },
      });
      
      if (adminError) throw adminError;
      
      if (!adminData.success) {
        throw new Error(adminData.error || "Failed to set admin role");
      }
      
      toast({
        title: "Admin account created",
        description: "Your admin account was created successfully. You can now log in.",
      });
      
      // Automatically sign in the user
      await signIn(values.email, values.password);
      
      // Redirect to the admin dashboard
      navigate('/admin');
      
    } catch (error: any) {
      console.error("Error creating admin account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-gray-50">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Admin Signup</CardTitle>
              <CardDescription>
                Create an administrator account to manage the canteen system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="admin@example.com"
                            type="email"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type="password"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type="password"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Alert className="bg-yellow-50">
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Creating this account will grant administrative privileges to access
                      the admin dashboard. Use this feature responsibly.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex flex-col gap-4 pt-2">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating Account..." : "Create Admin Account"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/login')}
                      disabled={loading}
                    >
                      Already have an account? Log in
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminSignup;
