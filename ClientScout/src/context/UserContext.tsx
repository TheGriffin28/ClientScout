import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  bio?: string;
  location?: string;
  socialLinks?: {
    facebook?: string;
    x?: string;
    linkedin?: string;
    instagram?: string;
  };
  address?: {
    country?: string;
    cityState?: string;
    postalCode?: string;
    taxId?: string;
  };
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const response = await api.get("/auth/me");
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
      // Optional: clear token if invalid
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
