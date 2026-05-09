import { useEffect, useMemo, useRef, useState } from "react";
import { Coins, Plus } from "lucide-react";
import styles from "./Navbar.module.scss";
import { useAuth } from "../../context/AuthContext";
import {
  createWalletRechargeOrder,
  getWalletProof,
  getWalletTransactions,
  verifyWalletRecharge,
} from "../../services/auth.service";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

const QUICK_AMOUNTS = [100, 250, 500];

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

const formatTransactionAmount = (amount: number) =>
  `${amount > 0 ? "+" : ""}${amount} SC`;

const getExplorerUrl = (
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

const SkillCoinWallet = () => {
  const { user, refreshUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("250");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<
    Array<{
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
    }>
  >([]);
  const [proofLoadingId, setProofLoadingId] = useState("");
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

    void getWalletTransactions()
      .then(setTransactions)
      .catch((error) => {
        console.error("Failed to load wallet history:", error);
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

  const startRecharge = async (requestedAmount?: number) => {
    const rechargeAmount = Math.round(
      requestedAmount || Number(amount || 0)
    );

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
    <div className={styles.walletWrap} ref={rootRef}>
      <button
        type="button"
        className={styles.walletTrigger}
        onClick={() => setOpen((previous) => !previous)}
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
          <div className={styles.walletPanelHeader}>
            <div>
              <span className={styles.walletKicker}>Wallet</span>
              <h3>SkillCoin balance</h3>
            </div>
            <button
              type="button"
              className={styles.walletChargeButton}
              onClick={() => void startRecharge()}
              disabled={loading}
            >
              <Plus size={16} />
              {loading ? "Opening..." : "Recharge"}
            </button>
          </div>

          <p className={styles.walletCopy}>
            1 INR = 1 SC. Requested sessions lock coins, and they settle
            only after completion is confirmed.
          </p>

          <div className={styles.walletStats}>
            <div className={styles.walletStat}>
              <span>Available</span>
              <strong>{user.availableSkillCoins} SC</strong>
            </div>
            <div className={styles.walletStat}>
              <span>Locked</span>
              <strong>{user.lockedSkillCoins} SC</strong>
            </div>
            <div className={styles.walletStat}>
              <span>Total</span>
              <strong>{user.skillCoinBalance} SC</strong>
            </div>
          </div>

          <div className={styles.walletBar}>
            <div
              className={styles.walletBarFill}
              style={{ width: `${lockedRatio}%` }}
            />
          </div>

          <div className={styles.walletQuickActions}>
            {QUICK_AMOUNTS.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => {
                  setAmount(String(quickAmount));
                  void startRecharge(quickAmount);
                }}
              >
                +{quickAmount} SC
              </button>
            ))}
          </div>

          <label className={styles.walletInputGroup}>
            <span>Custom recharge</span>
            <div className={styles.walletInputRow}>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Enter amount in INR"
              />
              <button
                type="button"
                onClick={() => void startRecharge()}
                disabled={loading}
              >
                Pay
              </button>
            </div>
          </label>

          <div className={styles.walletHistory}>
            <div className={styles.walletHistoryHeader}>
              <strong>Recent activity</strong>
            </div>

            {transactions.length ? (
              transactions.map((transaction) => (
                <div key={transaction._id} className={styles.walletTxn}>
                  <div>
                    <strong>{transaction.description}</strong>
                    <span>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </span>
                    <div className={styles.walletAuditRow}>
                      <span
                        className={`${styles.walletAuditBadge} ${
                          transaction.auditStatus === "anchored"
                            ? styles.walletAuditAnchored
                            : transaction.auditStatus === "failed"
                              ? styles.walletAuditFailed
                              : styles.walletAuditPending
                        }`}
                      >
                        {transaction.auditStatus === "anchored"
                          ? "Anchored on Polygon"
                          : transaction.auditStatus === "failed"
                            ? "Anchor failed"
                            : "Pending anchor"}
                      </span>
                      <button
                        type="button"
                        className={styles.walletProofButton}
                        onClick={() => void handleViewProof(transaction._id)}
                        disabled={proofLoadingId === transaction._id}
                      >
                        {proofLoadingId === transaction._id
                          ? "Loading..."
                          : "View proof"}
                      </button>
                      {transaction.chainTxHash ? (
                        <a
                          href={getExplorerUrl(
                            transaction.chainTxHash,
                            transaction.network
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.walletExplorerLink}
                        >
                          Explorer
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <span
                    className={
                      transaction.amount >= 0
                        ? styles.walletTxnPositive
                        : styles.walletTxnNegative
                    }
                  >
                    {formatTransactionAmount(transaction.amount)}
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.walletEmpty}>
                No SkillCoin activity yet.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SkillCoinWallet;
