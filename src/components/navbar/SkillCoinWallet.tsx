import { useEffect, useMemo, useRef, useState } from "react";
import { Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.scss";
import { useAuth } from "../../context/AuthContext";
import AppDialog from "../ui/AppDialog";
import {
  createWalletRechargeOrder,
  getWithdrawalRequests,
  getWalletProof,
  getWalletTransactions,
  requestWithdrawal,
  verifyWalletRecharge,
} from "../../services/auth.service";
import WalletPanelContent from "./WalletPanelContent";
import {
  getRechargeBonus,
  type WalletHistoryItem,
  type WithdrawalHistoryItem,
} from "./walletHelpers";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(true), {
        once: true,
      });
      existing.addEventListener("error", () => resolve(false), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const SkillCoinWallet = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("250");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<WalletHistoryItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalHistoryItem[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawUpiId, setWithdrawUpiId] = useState("");
  const [withdrawNote, setWithdrawNote] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [proofLoadingId, setProofLoadingId] = useState("");
  const [dialog, setDialog] = useState<{
    title: string;
    message: string;
    tone?: "default" | "success" | "warning" | "danger";
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const lockedRatio = useMemo(() => {
    if (!user?.skillCoinBalance) {
      return 0;
    }

    return (user.lockedSkillCoins / user.skillCoinBalance) * 100;
  }, [user?.lockedSkillCoins, user?.skillCoinBalance]);

  useEffect(() => {
    if (!open) {
      return;
    }

    void Promise.all([getWalletTransactions(), getWithdrawalRequests()])
      .then(([walletHistory, withdrawalHistory]) => {
        setTransactions(walletHistory);
        setWithdrawals(withdrawalHistory);
      })
      .catch((error) => {
        console.error("Failed to load wallet data:", error);
      });
  }, [open]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  if (!user) {
    return null;
  }

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;

  const startRecharge = async (requestedAmount?: number) => {
    const rechargeAmount = Math.round(
      requestedAmount || Number(amount || 0)
    );

    if (!rechargeAmount || rechargeAmount <= 0) {
      setDialog({
        title: "Enter a valid amount",
        message: "Add a positive recharge amount before starting SkillCoin checkout.",
        tone: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      const scriptReady = await loadRazorpayScript();

      if (!scriptReady || !window.Razorpay) {
        setDialog({
          title: "Checkout unavailable",
          message: "Razorpay checkout could not be loaded right now. Please try again in a moment.",
          tone: "danger",
        });
        return;
      }

      const order = await createWalletRechargeOrder(rechargeAmount);
      const bonusSkillCoins = order.conversion.bonusSkillCoins;
      const totalSkillCoins = order.conversion.skillCoins;

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "SkillSphere",
        description: bonusSkillCoins
          ? `Recharge ${rechargeAmount} INR and get ${totalSkillCoins} SC`
          : `Recharge ${totalSkillCoins} SkillCoin`,
        order_id: order.orderId,
        handler: async (response: Record<string, unknown>) => {
          await verifyWalletRecharge({
            razorpayOrderId: String(response.razorpay_order_id || ""),
            razorpayPaymentId: String(response.razorpay_payment_id || ""),
            razorpaySignature: String(response.razorpay_signature || ""),
          });
          await refreshUser();
          const latestTransactions = await getWalletTransactions();
          setTransactions(latestTransactions);
          setOpen(true);
        },
        prefill: {
          name: user.name || user.username,
          email: user.email,
        },
        theme: {
          color: "#0f172a",
        },
      });

      razorpay.open();
    } catch (error: any) {
      setDialog({
        title: "Recharge could not start",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "SkillCoin recharge could not be started",
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewProof = async (transactionId: string) => {
    try {
      setProofLoadingId(transactionId);
      const proof = await getWalletProof(transactionId);

      const summary = [
        `Audit status: ${proof.auditStatus}`,
        `Transaction hash: ${proof.hash}`,
        `Previous hash: ${proof.previousHash || "Genesis"}`,
        `Anchor batch: ${proof.anchor?.batchId || "Not anchored yet"}`,
        `Root hash: ${proof.anchor?.rootHash || "Pending"}`,
        `Chain tx: ${proof.anchor?.chainTxHash || "Pending"}`,
        `Proof nodes: ${proof.proof.proofPath.length}`,
      ].join("\n");

      setDialog({
        title: "Wallet proof summary",
        message: summary,
      });
    } catch (error: any) {
      setDialog({
        title: "Proof unavailable",
        message:
          error?.response?.data?.message ||
          "Wallet proof could not be loaded",
        tone: "danger",
      });
    } finally {
      setProofLoadingId("");
    }
  };

  const handleWithdrawalRequest = async () => {
    const numericAmount = Math.round(Number(withdrawAmount || 0));

    if (!numericAmount || numericAmount <= 0) {
      setDialog({
        title: "Enter a valid withdrawal amount",
        message: "Add a positive SkillCoin amount before requesting a withdrawal.",
        tone: "warning",
      });
      return;
    }

    if (!withdrawUpiId.trim()) {
      setDialog({
        title: "UPI ID required",
        message: "Enter the UPI ID where the admin should send your payout.",
        tone: "warning",
      });
      return;
    }

    try {
      setWithdrawLoading(true);
      const response = await requestWithdrawal({
        amount: numericAmount,
        upiId: withdrawUpiId.trim(),
        note: withdrawNote.trim(),
      });

      await refreshUser();
      const [walletHistory, withdrawalHistory] = await Promise.all([
        getWalletTransactions(),
        getWithdrawalRequests(),
      ]);
      setTransactions(walletHistory);
      setWithdrawals(withdrawalHistory);
      setWithdrawAmount("");
      setWithdrawNote("");
      setDialog({
        title: "Withdrawal requested",
        message: `${response.request.amount} SC has been locked for withdrawal to ${response.request.upiId}. Admin will update the status after review.`,
        tone: "success",
      });
    } catch (error: any) {
      setDialog({
        title: "Withdrawal unavailable",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Withdrawal request could not be submitted",
        tone: "danger",
      });
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className={styles.walletWrap} ref={rootRef}>
      <button
        type="button"
        className={styles.walletTrigger}
        onClick={() => {
          if (isMobile) {
            navigate("/wallet");
            return;
          }

          setOpen((previous) => !previous);
        }}
        aria-label="Open SkillCoin wallet"
      >
        <div className={styles.walletIcon}>
          <Coins size={16} />
        </div>
        <div className={styles.walletMeta}>
          <span>SkillCoin</span>
          <strong>{user.availableSkillCoins} SC</strong>
          <div className={styles.walletMiniBar}>
            <div
              className={styles.walletMiniFill}
              style={{ width: `${lockedRatio}%` }}
            />
          </div>
        </div>
      </button>

      {open ? (
        <div className={styles.walletPanel}>
          <WalletPanelContent
            user={user}
            loading={loading}
            amount={amount}
            setAmount={setAmount}
            transactions={transactions}
            withdrawals={withdrawals}
            proofLoadingId={proofLoadingId}
            lockedRatio={lockedRatio}
            selectedBonus={getRechargeBonus(
              Math.round(Number(amount || 0))
            )}
            onRecharge={startRecharge}
            onViewProof={handleViewProof}
            withdrawAmount={withdrawAmount}
            setWithdrawAmount={setWithdrawAmount}
            withdrawUpiId={withdrawUpiId}
            setWithdrawUpiId={setWithdrawUpiId}
            withdrawNote={withdrawNote}
            setWithdrawNote={setWithdrawNote}
            onWithdraw={handleWithdrawalRequest}
            withdrawLoading={withdrawLoading}
          />
        </div>
      ) : null}

      <AppDialog
        open={Boolean(dialog)}
        title={dialog?.title || ""}
        message={dialog?.message || ""}
        tone={dialog?.tone}
        onClose={() => setDialog(null)}
      />
    </div>
  );
};

export default SkillCoinWallet;
