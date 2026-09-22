import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

export type UserRole = "admin" | "institute" | "employer" | "trainee";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  instituteId?: string;
  employerId?: string;
  traineeId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  loginTrainee: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("outcometrack_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("outcometrack_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    const res = await fetch(`/api/v1/auth/${role}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Login failed");
    }

    const userData = await res.json();
    setUser(userData.user);
    localStorage.setItem("outcometrack_user", JSON.stringify(userData.user));
  };

  const loginTrainee = async (token: string) => {
    const res = await fetch(`/api/v1/auth/trainee/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Invalid magic link");
    }

    const traineeData = await res.json();
    const userData: AuthUser = {
      id: traineeData.trainee.id,
      email: traineeData.trainee.email ?? "",
      name: traineeData.trainee.fullName,
      role: "trainee",
      traineeId: traineeData.trainee.id,
    };
    setUser(userData);
    localStorage.setItem("outcometrack_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("outcometrack_user");
  };

  const hasRole = (roles: UserRole[]) => {
    return user !== null && roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginTrainee,
        logout,
        loading,
        isAuthenticated: user !== null,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}