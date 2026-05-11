import { Plus } from "lucide-react";
import styles from "./Navbar.module.scss";
import {
  formatTransactionAmount,
  getExplorerUrl,
  getRechargeBonus,
  QUICK_AMOUNTS,
  RECHARGE_OFFERS,
  type WalletHistoryItem,
} from "./walletHelpers";

type Props = {
  user: {
    availableSkillCoins: number;
    lockedSkillCoins: number;
    skillCoinBalance: number;
  };
  loading: boolean;
  amount: string;
  setAmount: (value: string) => void;
  transactions: WalletHistoryItem[];
  proofLoadingId: string;
  lockedRatio: number;
  selectedBonus: number;
  onRecharge: (requestedAmount?: number) => Promise<void>;
  onViewProof: (transactionId: string) => Promise<void>;
  compact?: boolean;
};

const WalletPanelContent = ({
  user,
  loading,
  amount,
  setAmount,
  transactions,
  proofLoadingId,
  lockedRatio,
  selectedBonus,
  onRecharge,
  onViewProof,
  compact = false,
}: Props) => (
  <>
    <div className={styles.walletPanelHeader}>
      <div>
        <span className={styles.walletKicker}>Wallet</span>
        <h3>SkillCoin balance</h3>
      </div>
      <button
        type="button"
        className={styles.walletChargeButton}
        onClick={() => void onRecharge()}
        disabled={loading}
      >
        <Plus size={16} />
        {loading ? "Opening..." : "Recharge"}
      </button>
    </div>

    <p className={styles.walletCopy}>
      1 INR = 1 SC. Requested sessions lock coins, and they settle only
      after completion is confirmed.
    </p>

    <div className={styles.walletOfferStrip}>
      {RECHARGE_OFFERS.map((offer) => (
        <button
          key={offer.amountRupees}
          type="button"
          className={styles.walletOfferCard}
          onClick={() => {
            setAmount(String(offer.amountRupees));
            void onRecharge(offer.amountRupees);
          }}
        >
          <span>{offer.amountRupees} INR</span>
          <strong>{offer.amountRupees + offer.bonusSkillCoins} SC</strong>
          <small>on {offer.amountRupees}+ recharge</small>
        </button>
      ))}
    </div>

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
            void onRecharge(quickAmount);
          }}
        >
          +{quickAmount + getRechargeBonus(quickAmount)} SC
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
          onClick={() => void onRecharge()}
          disabled={loading}
        >
          Pay
        </button>
      </div>
      {selectedBonus ? (
        <small className={styles.walletOfferHint}>
          Current offer unlocked: {amount || "0"} INR qualifies for +
          {selectedBonus} bonus SC.
        </small>
      ) : (
        <small className={styles.walletOfferHint}>
          Bonus tiers start at 500 INR and 1000 INR recharge thresholds.
        </small>
      )}
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
                  onClick={() => void onViewProof(transaction._id)}
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
        <div className={styles.walletEmpty}>No SkillCoin activity yet.</div>
      )}
    </div>

    {compact ? <div className={styles.walletPageSpacer} /> : null}
  </>
);

export default WalletPanelContent;
