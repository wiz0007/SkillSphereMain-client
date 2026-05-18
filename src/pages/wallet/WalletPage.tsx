import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  createWalletRechargeOrder,
  getWithdrawalRequests,
  getWalletProof,
  getWalletTransactions,
  requestWithdrawal,
  verifyWalletRecharge,
} from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";
import WalletPanelContent from "../../components/navbar/WalletPanelContent";
import AppDialog from "../../components/ui/AppDialog";
import {
  getRechargeBonus,
  type WalletHistoryItem,
} from "../../components/navbar/walletHelpers";
import styles from "../../components/navbar/Navbar.module.scss";

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

const WalletPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("250");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<WalletHistoryItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<
    Array<{
      _id: string;
      amount: number;
      upiId: string;
      note: string;
      status: "pending" | "processing" | "paid" | "rejected";
      adminNote: string;
      reviewedAt: string | null;
      paidAt: string | null;
      createdAt: string;
    }>
  >([]);
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

  const lockedRatio = useMemo(() => {
    if (!user?.skillCoinBalance) {
      return 0;
    }

    return (user.lockedSkillCoins / user.skillCoinBalance) * 100;
  }, [user?.lockedSkillCoins, user?.skillCoinBalance]);

  useEffect(() => {
    void Promise.all([getWalletTransactions(), getWithdrawalRequests()])
      .then(([walletHistory, withdrawalHistory]) => {
        setTransactions(walletHistory);
        setWithdrawals(withdrawalHistory);
      })
      .catch((error) => {
        console.error("Failed to load wallet data:", error);
      });
  }, []);

  if (!user) {
    return null;
  }

  const startRecharge = async (requestedAmount?: number) => {
    const rechargeAmount = Math.round(requestedAmount || Number(amount || 0));

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
    <section className={styles.walletPage}>
      <div className={styles.walletPageHeader}>
        <button
          type="button"
          className={styles.walletPageBack}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div>
          <span className={styles.walletKicker}>Mobile wallet</span>
          <h1>SkillCoin</h1>
        </div>
      </div>

      <div className={styles.walletPageCard}>
        <WalletPanelContent
          user={user}
          loading={loading}
          amount={amount}
          setAmount={setAmount}
          transactions={transactions}
          proofLoadingId={proofLoadingId}
          lockedRatio={lockedRatio}
          selectedBonus={getRechargeBonus(
            Math.round(Number(amount || 0))
          )}
          onRecharge={startRecharge}
          onViewProof={handleViewProof}
          compact
        />
      </div>

      <div className={styles.walletPageCard}>
        <div className={styles.walletSectionHeader}>
          <div>
            <span className={styles.walletKicker}>Withdrawals</span>
            <h3>Request a manual payout</h3>
          </div>
        </div>

        <div className={styles.walletWithdrawGrid}>
          <label className={styles.walletInputGroup}>
            <span>SkillCoin amount</span>
            <input
              type="number"
              min="1"
              step="1"
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              placeholder="Enter SkillCoin amount"
            />
          </label>

          <label className={styles.walletInputGroup}>
            <span>UPI ID</span>
            <input
              type="text"
              value={withdrawUpiId}
              onChange={(event) => setWithdrawUpiId(event.target.value)}
              placeholder="example@upi"
            />
          </label>
        </div>

        <label className={styles.walletInputGroup}>
          <span>Note for admin</span>
          <textarea
            className={styles.walletTextarea}
            rows={3}
            value={withdrawNote}
            onChange={(event) => setWithdrawNote(event.target.value)}
            placeholder="Optional payout note or context..."
          />
        </label>

        <div className={styles.walletWithdrawActions}>
          <small className={styles.walletOfferHint}>
            Requested withdrawals stay locked until admin marks them paid or rejected.
          </small>
          <button
            type="button"
            className={styles.walletChargeButton}
            onClick={() => void handleWithdrawalRequest()}
            disabled={withdrawLoading}
          >
            {withdrawLoading ? "Submitting..." : "Request withdrawal"}
          </button>
        </div>

        <div className={styles.walletHistory}>
          <div className={styles.walletHistoryHeader}>
            <strong>Withdrawal history</strong>
          </div>

          {withdrawals.length ? (
            withdrawals.map((request) => (
              <div key={request._id} className={styles.walletTxn}>
                <div>
                  <strong>
                    {request.amount} SC to {request.upiId}
                  </strong>
                  <span>{new Date(request.createdAt).toLocaleString()}</span>
                  <div className={styles.walletAuditRow}>
                    <span
                      className={`${styles.walletAuditBadge} ${
                        request.status === "paid"
                          ? styles.walletAuditAnchored
                          : request.status === "rejected"
                            ? styles.walletAuditFailed
                            : styles.walletAuditPending
                      }`}
                    >
                      {request.status}
                    </span>
                    {request.adminNote ? (
                      <span className={styles.walletAdminNote}>
                        Admin note: {request.adminNote}
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className={styles.walletTxnNegative}>
                  -{request.amount} SC
                </span>
              </div>
            ))
          ) : (
            <div className={styles.walletEmpty}>No withdrawal requests yet.</div>
          )}
        </div>
      </div>

      <AppDialog
        open={Boolean(dialog)}
        title={dialog?.title || ""}
        message={dialog?.message || ""}
        tone={dialog?.tone}
        onClose={() => setDialog(null)}
      />
    </section>
  );
};

export default WalletPage;
