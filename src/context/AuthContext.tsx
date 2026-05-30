import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { getCurrentUser, logoutUser } from "../services/auth.service";
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
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const normalizeUser = (user: User): User => ({
  ...user,
  _id: String(user._id),
  skillCoinBalance: Number(user.skillCoinBalance || 0),
  lockedSkillCoins: Number(user.lockedSkillCoins || 0),
  availableSkillCoins: Number(
    user.availableSkillCoins ||
      Number(user.skillCoinBalance || 0) -
        Number(user.lockedSkillCoins || 0)
  ),
});

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { user: nextUser } = await getCurrentUser();
      setUser(normalizeUser(nextUser));
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const hydrateStoredUser = () => {
    try {
      const stored = localStorage.getItem("user");

      if (!stored) {
        return;
      }

      const parsed: User = JSON.parse(stored);

      if (parsed?._id) {
        setUser(normalizeUser(parsed));
      } else {
        localStorage.removeItem("user");
      }
    } catch {
      localStorage.removeItem("user");
    }
  };

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      try {
        hydrateStoredUser();
        await refreshUser();
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void initializeAuth();

    return () => {
      active = false;
    };
  }, []);

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

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Client state is still cleared even if the network request fails.
    }

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
