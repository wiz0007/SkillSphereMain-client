export const QUICK_AMOUNTS = [100, 250, 500];

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
