import { api } from "../api/api";

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
      profilePhoto?: string;
      profileCompleted?: boolean;
      isTutor: boolean;
      isAdmin: boolean;
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
