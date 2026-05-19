import { Plus } from "lucide-react";
import { useState } from "react";
import styles from "./Navbar.module.scss";
import {
  formatTransactionAmount,
  getExplorerUrl,
  getRechargeBonus,
  QUICK_AMOUNTS,
  RECHARGE_OFFERS,
  type WalletHistoryItem,
  type WithdrawalHistoryItem,
} from "./walletHelpers";

type WalletTab = "recharge" | "withdraw";

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
  withdrawals: WithdrawalHistoryItem[];
  proofLoadingId: string;
  lockedRatio: number;
  selectedBonus: number;
  onRecharge: (requestedAmount?: number) => Promise<void>;
  onViewProof: (transactionId: string) => Promise<void>;
  withdrawAmount: string;
  setWithdrawAmount: (value: string) => void;
  withdrawUpiId: string;
  setWithdrawUpiId: (value: string) => void;
  withdrawNote: string;
  setWithdrawNote: (value: string) => void;
  onWithdraw: () => Promise<void>;
  withdrawLoading: boolean;
  compact?: boolean;
};

const WalletPanelContent = ({
  user,
  loading,
  amount,
  setAmount,
  transactions,
  withdrawals,
  proofLoadingId,
  lockedRatio,
  selectedBonus,
  onRecharge,
  onViewProof,
  withdrawAmount,
  setWithdrawAmount,
  withdrawUpiId,
  setWithdrawUpiId,
  withdrawNote,
  setWithdrawNote,
  onWithdraw,
  withdrawLoading,
  compact = false,
}: Props) => {
  const [activeTab, setActiveTab] = useState<WalletTab>("recharge");

  return (
    <div
      className={`${styles.walletPanelContent} ${
        compact ? styles.walletPanelContentCompact : ""
      }`}
    >
      <div className={styles.walletPanelHeader}>
        <div>
          <span className={styles.walletKicker}>Wallet</span>
          <h3>SkillCoin balance</h3>
        </div>
        <button
          type="button"
          className={styles.walletChargeButton}
          onClick={() =>
            void (activeTab === "recharge" ? onRecharge() : onWithdraw())
          }
          disabled={activeTab === "recharge" ? loading : withdrawLoading}
        >
          <Plus size={16} />
          {activeTab === "recharge"
            ? loading
              ? "Opening..."
              : "Recharge"
            : withdrawLoading
              ? "Sending..."
              : "Withdraw"}
        </button>
      </div>

      <p className={styles.walletCopy}>
        1 INR = 1 SC. Requested sessions lock coins, and they settle only
        after completion is confirmed.
      </p>

      <div className={styles.walletTabRow}>
        <button
          type="button"
          className={`${styles.walletTabButton} ${
            activeTab === "recharge" ? styles.walletTabButtonActive : ""
          }`}
          onClick={() => setActiveTab("recharge")}
        >
          Recharge
        </button>
        <button
          type="button"
          className={`${styles.walletTabButton} ${
            activeTab === "withdraw" ? styles.walletTabButtonActive : ""
          }`}
          onClick={() => setActiveTab("withdraw")}
        >
          Withdraw
        </button>
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

      {activeTab === "recharge" ? (
        <>
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
        </>
      ) : (
        <>
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
              Withdrawal requests stay locked until admin marks them paid or rejected.
            </small>
            <button
              type="button"
              className={styles.walletChargeButton}
              onClick={() => void onWithdraw()}
              disabled={withdrawLoading}
            >
              {withdrawLoading ? "Submitting..." : "Request withdrawal"}
            </button>
          </div>
        </>
      )}

      <div className={styles.walletHistory}>
        <div className={styles.walletHistoryHeader}>
          <strong>
            {activeTab === "recharge" ? "Recent activity" : "Withdrawal history"}
          </strong>
        </div>

        {activeTab === "recharge" ? (
          transactions.length ? (
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
          )
        ) : withdrawals.length ? (
          withdrawals.map((request) => (
            <div key={request._id} className={styles.walletTxn}>
              <div>
                <strong>
                  {request.amount} SC to {request.upiId}
                </strong>
                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
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

      {compact ? <div className={styles.walletPageSpacer} /> : null}
    </div>
  );
};

export default WalletPanelContent;
