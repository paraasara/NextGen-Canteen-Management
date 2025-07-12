
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AdminAuthGuardProps {
  children: React.ReactNode;
  isAuthorized: boolean;
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children, isAuthorized }) => {
  if (!isAuthorized) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Only administrators can access this page.
            Please <a href="/" className="underline">login</a> with admin credentials.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminAuthGuard;
