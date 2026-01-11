import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const tokenExists = !!localStorage.getItem("token");
    console.log("Token exists:", tokenExists);

    if (tokenExists) {
      const isValid = validateToken();
      console.log("Token is valid:", isValid);
      setIsAuthenticated(isValid);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const validateToken = (): boolean => {
    try {
      // Add actual token validation logic here (e.g., decode and check expiration)
      return true; // Placeholder for valid token
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center h-screen">Checking authentication...</div>; // Improved loading state
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />; // Redirect to login if not authenticated
  }

  return <>{children}</>;
};

export default PrivateRoute;