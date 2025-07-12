
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserLoginForm from './UserLoginForm';
import UserSignupForm from './UserSignupForm';

interface UserAuthTabsProps {
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  loading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSignIn: (e: React.FormEvent) => void;
  onSignUp: (e: React.FormEvent) => void;
}

const UserAuthTabs: React.FC<UserAuthTabsProps> = ({
  formData,
  loading,
  onInputChange,
  onSignIn,
  onSignUp,
}) => {
  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="signin">
        <UserLoginForm
          formData={{ email: formData.email, password: formData.password }}
          loading={loading}
          onInputChange={onInputChange}
          onSubmit={onSignIn}
        />
      </TabsContent>
      
      <TabsContent value="signup">
        <UserSignupForm
          formData={formData}
          loading={loading}
          onInputChange={onInputChange}
          onSubmit={onSignUp}
        />
      </TabsContent>
    </Tabs>
  );
};

export default UserAuthTabs;
