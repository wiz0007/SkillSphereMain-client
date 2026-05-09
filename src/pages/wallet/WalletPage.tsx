import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  createWalletRechargeOrder,
  getWalletProof,
  getWalletTransactions,
  verifyWalletRecharge,
} from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";
import WalletPanelContent from "../../components/navbar/WalletPanelContent";
import { type WalletHistoryItem } from "../../components/navbar/walletHelpers";
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
  const [proofLoadingId, setProofLoadingId] = useState("");

  const lockedRatio = useMemo(() => {
    if (!user?.skillCoinBalance) {
      return 0;
    }

    return (user.lockedSkillCoins / user.skillCoinBalance) * 100;
  }, [user?.lockedSkillCoins, user?.skillCoinBalance]);

  useEffect(() => {
    void getWalletTransactions()
      .then(setTransactions)
      .catch((error) => {
        console.error("Failed to load wallet history:", error);
      });
  }, []);

  if (!user) {
    return null;
  }

  const startRecharge = async (requestedAmount?: number) => {
    const rechargeAmount = Math.round(requestedAmount || Number(amount || 0));

    if (!rechargeAmount || rechargeAmount <= 0) {
      alert("Enter a valid SkillCoin recharge amount");
      return;
    }

    try {
      setLoading(true);

      const scriptReady = await loadRazorpayScript();

      if (!scriptReady || !window.Razorpay) {
        alert("Razorpay checkout could not be loaded");
        return;
      }

      const order = await createWalletRechargeOrder(rechargeAmount);

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "SkillSphere",
        description: `Recharge ${order.conversion.skillCoins} SkillCoin`,
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
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "SkillCoin recharge could not be started"
      );
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

      alert(summary);
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Wallet proof could not be loaded"
      );
    } finally {
      setProofLoadingId("");
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
          onRecharge={startRecharge}
          onViewProof={handleViewProof}
          compact
        />
      </div>
    </section>
  );
};

export default WalletPage;
