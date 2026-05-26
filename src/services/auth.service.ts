import { api } from "../api/api";

export type SocialAuthProvider = "google" | "linkedin" | "github";

const getApiOrigin = () => {
  const baseUrl = String(api.defaults.baseURL || "");

  if (!baseUrl) {
    return "";
  }

  return baseUrl.replace(/\/api\/?$/, "");
};

export const getSocialAuthStartUrl = (
  provider: SocialAuthProvider
) => `${getApiOrigin()}/api/auth/${provider}/start`;

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
}) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const verifyOTP = async (data: {
  userId: string;
  otp: string;
}) => {
  const res = await api.post("/auth/verify-otp", data);
  return res.data;
};

export const resendOTP = async (data: {
  userId: string;
}) => {
  const res = await api.post("/auth/resend-otp", data);
  return res.data;
};

export const forgotPassword = async (data: { email: string }) => {
  const res = await api.post("/auth/forgot-password", data);
  return res.data as { message: string };
};

export const resetPassword = async (data: {
  token: string;
  newPassword: string;
}) => {
  const res = await api.post("/auth/reset-password", data);
  return res.data as { message: string };
};

export const checkUsername = async (username: string) => {
  const res = await api.get(`/auth/check-username/${username}`);
  return res.data as { available: boolean };
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const res = await api.post("/auth/change-password", data);
  return res.data;
};

export const deleteAccount = async (data: {
  currentPassword: string;
  confirmationText: string;
}) => {
  const res = await api.post("/auth/delete-account", data);
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data as {
    user: {
      username: string;
      _id: string;
      name?: string;
      email: string;
      authProvider: "local" | "google" | "linkedin" | "github";
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
    };
  };
};

export const rechargeSkillCoins = async (amount: number) => {
  const res = await api.post("/auth/wallet/recharge", { amount });
  return res.data as {
    wallet: {
      skillCoinBalance: number;
      lockedSkillCoins: number;
      availableSkillCoins: number;
    };
  };
};

export const getWalletTransactions = async () => {
  const res = await api.get("/auth/wallet/history");
  return res.data as Array<{
    _id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
    auditStatus: "pending" | "anchored" | "failed";
    hash: string;
    chainTxHash: string | null;
    chainName: string | null;
    network: string | null;
  }>;
};

export const getWithdrawalRequests = async () => {
  const res = await api.get("/auth/wallet/withdrawals");
  return res.data as Array<{
    _id: string;
    amount: number;
    upiId: string;
    note: string;
    status: "pending" | "processing" | "paid" | "rejected";
    adminNote: string;
    reviewedAt: string | null;
    paidAt: string | null;
    createdAt: string;
  }>;
};

export const requestWithdrawal = async (payload: {
  amount: number;
  upiId: string;
  note?: string;
}) => {
  const res = await api.post("/auth/wallet/withdrawals", payload);
  return res.data as {
    message: string;
    wallet: {
      skillCoinBalance: number;
      lockedSkillCoins: number;
      availableSkillCoins: number;
    };
    request: {
      _id: string;
      amount: number;
      upiId: string;
      note: string;
      status: "pending" | "processing" | "paid" | "rejected";
      createdAt: string;
    };
  };
};

export const getWalletProof = async (transactionId: string) => {
  const res = await api.get(`/auth/wallet/proof/${transactionId}`);
  return res.data as {
    transactionId: string;
    hash: string;
    previousHash: string | null;
    canonicalPayload: string;
    auditStatus: "pending" | "anchored" | "failed";
    anchor: null | {
      batchId: string;
      rootHash: string;
      chainName: string;
      network: string;
      chainTxHash: string | null;
      anchoredAt: string | null;
      anchorStatus: string;
    };
    proof: {
      proofPath: string[];
      verificationType: string;
    };
  };
};

export const createWalletRechargeOrder = async (amount: number) => {
  const res = await api.post("/auth/wallet/recharge-order", {
    amount,
  });
  return res.data as {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    conversion: {
      rupees: number;
      baseSkillCoins: number;
      bonusSkillCoins: number;
      skillCoins: number;
      rate: string;
    };
    offers: Array<{
      amountRupees: number;
      bonusSkillCoins: number;
      label: string;
    }>;
  };
};

export const verifyWalletRecharge = async (payload: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) => {
  const res = await api.post("/auth/wallet/verify-recharge", payload);
  return res.data as {
    wallet: {
      skillCoinBalance: number;
      lockedSkillCoins: number;
      availableSkillCoins: number;
    };
  };
};

export const getPendingAdminGift = async () => {
  const res = await api.get("/auth/admin-gifts/pending");
  return res.data as {
    gift: null | {
      _id: string;
      amount: number;
      note: string;
      createdAt: string;
    };
  };
};

export const claimAdminGift = async (giftId: string) => {
  const res = await api.post(`/auth/admin-gifts/${giftId}/claim`);
  return res.data as {
    message: string;
    wallet: {
      skillCoinBalance: number;
      lockedSkillCoins: number;
      availableSkillCoins: number;
    };
    gift: {
      _id: string;
      amount: number;
      note: string;
    };
  };
};
