import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getApiConfig } from "@/lib/config";
import { encryptPassword } from "@/lib/encryptPassword";

export interface User {
  username: string;
  accessToken: string;
  tokenType: string;
  firstName?: string;
  lastName?: string;
}

const USER_STORAGE_KEY = "azam-user";
const TOKEN_STORAGE_KEY = "azam-access-token";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { baseUrl } = getApiConfig();
      const encryptedPassword = encryptPassword(password);

      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/auth/v1/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: encryptedPassword }),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();

      if (
        result.status === "SUCCESS" &&
        result.data &&
        result.data.accessToken
      ) {
        const userData: User = {
          username: result.data.username,
          accessToken: result.data.accessToken,
          tokenType: result.data.tokenType,
        };

        setUser(userData);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        localStorage.setItem(TOKEN_STORAGE_KEY, userData.accessToken);

        setLocation("/dashboard");
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setLocation("/login");
  };

  const getAccessToken = () => {
    return user?.accessToken || localStorage.getItem(TOKEN_STORAGE_KEY) || "";
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      getAccessToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}