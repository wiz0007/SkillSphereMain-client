export const QUICK_AMOUNTS = [250, 500, 1000];

export const RECHARGE_OFFERS = [
  {
    amountRupees: 500,
    bonusSkillCoins: 50,
    label: "500+ gets 50 bonus",
  },
  {
    amountRupees: 1000,
    bonusSkillCoins: 110,
    label: "1000+ gets 110 bonus",
  },
] as const;

export const getRechargeBonus = (amountRupees: number) =>
  [...RECHARGE_OFFERS]
    .sort((left, right) => right.amountRupees - left.amountRupees)
    .find((offer) => amountRupees >= offer.amountRupees)?.bonusSkillCoins || 0;

export const formatTransactionAmount = (amount: number) =>
  `${amount > 0 ? "+" : ""}${amount} SC`;

export const getExplorerUrl = (
  chainTxHash: string | null,
  network: string | null
) => {
  if (!chainTxHash) {
    return "";
  }

  if (network === "amoy") {
    return `https://www.oklink.com/amoy/tx/${chainTxHash}`;
  }

  return `https://polygonscan.com/tx/${chainTxHash}`;
};

export type WalletHistoryItem = {
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
};
