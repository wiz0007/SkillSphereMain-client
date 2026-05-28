import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { getCurrentUser } from "../services/auth.service";
import { socket } from "../utils/socket";

export interface User {
  username: string;
  _id: string;
  name?: string;
  email: string;
  authProvider: "local" | "google" | "linkedin" | "github";
  hasPassword: boolean;
  linkedProviders: {
    google: boolean;
    linkedin: boolean;
    github: boolean;
  };
  profilePhoto?: string;
  profileCompleted?: boolean;
  isTutor: boolean;
  isAdmin: boolean;
  identityVerificationStatus:
    | "not_started"
    | "pending"
    | "approved"
    | "rejected"
    | "resubmission_required";
  tutorVerificationStatus:
    | "not_started"
    | "pending"
    | "approved"
    | "rejected"
    | "resubmission_required";
  verifiedBadgeLevel: "none" | "basic" | "identity" | "tutor";
  skillCoinBalance: number;
  lockedSkillCoins: number;
  availableSkillCoins: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const { user: nextUser } = await getCurrentUser();
      setUser(nextUser);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  // ✅ Load user from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");

      if (stored) {
        const parsed: User = JSON.parse(stored);

        if (parsed?._id) {
          setUser({
            ...parsed,
            _id: String(parsed._id),
            skillCoinBalance: Number(parsed.skillCoinBalance || 0),
            lockedSkillCoins: Number(parsed.lockedSkillCoins || 0),
            availableSkillCoins: Number(
              parsed.availableSkillCoins ||
                Number(parsed.skillCoinBalance || 0) -
                  Number(parsed.lockedSkillCoins || 0)
            ),
          });
        } else {
          localStorage.removeItem("user");
        }
      }
    } catch {
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      void refreshUser();
    }
  }, []);

  // ✅ Sync user to storage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    socket.emit("register", user._id);

    const handleWalletUpdate = (wallet: {
      skillCoinBalance: number;
      lockedSkillCoins: number;
      availableSkillCoins: number;
    }) => {
      setUser((previous) =>
        previous
          ? {
              ...previous,
              ...wallet,
            }
          : previous
      );
    };

    socket.on("wallet:update", handleWalletUpdate);

    return () => {
      socket.off("wallet:update", handleWalletUpdate);
    };
  }, [user?._id]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, setUser, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
