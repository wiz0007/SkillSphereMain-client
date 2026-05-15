import { useEffect, useMemo, useState } from "react";
import {
  adjustAdminUserWallet,
  deleteAdminUser,
  deleteAdminCourse,
  deleteAdminReview,
  getAdminCourses,
  getAdminOverview,
  getAdminReviews,
  getAdminSessions,
  getAdminSupportConversations,
  getAdminSupportMessages,
  getAdminUsers,
  getAdminWalletTransactions,
  setAdminCoursePublishStatus,
  sendAdminSupportMessage,
  updateAdminSupportStatus,
  type AdminCourse,
  type AdminOverview,
  type AdminReview,
  type AdminSession,
  type AdminSupportConversation,
  type AdminSupportMessage,
  type AdminUser,
  type AdminWalletTransaction,
} from "../../services/admin.service";
import styles from "./AdminPortal.module.scss";

type AdminTab =
  | "overview"
  | "users"
  | "courses"
  | "sessions"
  | "support"
  | "reviews"
  | "wallet";

type PendingAdminAction =
  | {
      kind: "wallet";
      user: AdminUser;
      walletAction: "credit" | "debit";
      amount: number;
      note: string;
    }
  | {
      kind: "deleteUser";
      user: AdminUser;
    }
  | {
      kind: "deleteCourse";
      course: AdminCourse;
    }
  | {
      kind: "deleteReview";
      review: AdminReview;
    };

type ActionFeedback = {
  title: string;
  message: string;
};

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "courses", label: "Courses" },
  { id: "sessions", label: "Sessions" },
  { id: "support", label: "Support" },
  { id: "reviews", label: "Reviews" },
  { id: "wallet", label: "Wallet" },
];

const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [walletAmounts, setWalletAmounts] = useState<Record<string, string>>({});
  const [walletNotes, setWalletNotes] = useState<Record<string, string>>({});
  const [pendingAction, setPendingAction] = useState<PendingAdminAction | null>(null);
  const [actionInFlight, setActionInFlight] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null);
  const [selectedSupportId, setSelectedSupportId] = useState("");
  const [supportMessages, setSupportMessages] = useState<AdminSupportMessage[]>([]);
  const [supportMessagesLoading, setSupportMessagesLoading] = useState(false);
  const [supportReplyText, setSupportReplyText] = useState("");
  const [supportReplyAttachment, setSupportReplyAttachment] = useState<File | null>(null);
  const [supportReplySending, setSupportReplySending] = useState(false);

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [support, setSupport] = useState<AdminSupportConversation[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [wallet, setWallet] = useState<AdminWalletTransaction[]>([]);

  const loadAll = async (userSearch = "") => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const [
        nextOverview,
        nextUsers,
        nextCourses,
        nextSessions,
        nextSupport,
        nextReviews,
        nextWallet,
      ] = await Promise.all([
        getAdminOverview(),
        getAdminUsers(userSearch),
        getAdminCourses(),
        getAdminSessions(),
        getAdminSupportConversations(),
        getAdminReviews(),
        getAdminWalletTransactions(),
      ]);

      setOverview(nextOverview);
      setUsers(nextUsers);
      setCourses(nextCourses);
      setSessions(nextSessions);
      setSupport(nextSupport);
      setSelectedSupportId((previous) => {
        if (previous && nextSupport.some((thread) => thread._id === previous)) {
          return previous;
        }

        return nextSupport[0]?._id || "";
      });
      setReviews(nextReviews);
      setWallet(nextWallet);
    } catch (nextError: any) {
      setError(nextError?.message || "Failed to load admin portal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    if (!support.length) {
      setSelectedSupportId("");
      return;
    }

    if (!selectedSupportId || !support.some((thread) => thread._id === selectedSupportId)) {
      setSelectedSupportId(support[0]._id);
    }
  }, [selectedSupportId, support]);

  useEffect(() => {
    const loadSupportMessages = async () => {
      if (activeTab !== "support" || !selectedSupportId) {
        return;
      }

      try {
        setSupportMessagesLoading(true);
        const payload = await getAdminSupportMessages(selectedSupportId);
        setSupportMessages(payload.messages);
        setSupport((previous) =>
          previous.map((thread) =>
            thread._id === payload.conversation._id
              ? { ...thread, ...payload.conversation }
              : thread
          )
        );
      } catch (nextError: any) {
        setError(nextError?.message || "Failed to load support messages");
      } finally {
        setSupportMessagesLoading(false);
      }
    };

    void loadSupportMessages();
  }, [activeTab, selectedSupportId]);

  useEffect(() => {
    setSupportReplyText("");
    setSupportReplyAttachment(null);
  }, [selectedSupportId]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [user.username, user.email, user.fullName || ""]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [search, users]);

  const handleUserSearch = async (value: string) => {
    setSearch(value);
    if (!value.trim()) {
      void loadAll();
      return;
    }

    try {
      const nextUsers = await getAdminUsers(value);
      setUsers(nextUsers);
    } catch (nextError: any) {
      setError(nextError?.message || "Failed to search users");
    }
  };

  const handleTogglePublish = async (course: AdminCourse) => {
    try {
      await setAdminCoursePublishStatus(course._id, !course.isPublished);
      setCourses((previous) =>
        previous.map((entry) =>
          entry._id === course._id
            ? { ...entry, isPublished: !entry.isPublished }
            : entry
        )
      );
    } catch (nextError: any) {
      setError(nextError?.message || "Failed to update course status");
    }
  };

  const handleUserWalletChange = async (
    user: AdminUser,
    action: "credit" | "debit"
  ) => {
    const rawAmount = walletAmounts[user._id] || "";
    const amount = Number(rawAmount);
    const note = (walletNotes[user._id] || "").trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid SkillCoin amount before applying a wallet action");
      return;
    }

    setError("");
    setPendingAction({
      kind: "wallet",
      user,
      walletAction: action,
      amount,
      note,
    });
  };

  const handleDeleteUser = async (user: AdminUser) => {
    setPendingAction({
      kind: "deleteUser",
      user,
    });
  };

  const handleDeleteCourse = async (course: AdminCourse) => {
    setPendingAction({
      kind: "deleteCourse",
      course,
    });
  };

  const handleSupportStatus = async (
    conversation: AdminSupportConversation,
    status: AdminSupportConversation["status"]
  ) => {
    try {
      await updateAdminSupportStatus(conversation._id, status);
      setSupport((previous) =>
        previous.map((entry) =>
          entry._id === conversation._id ? { ...entry, status } : entry
        )
      );
      setSuccessMessage(`Support status updated to ${status.replaceAll("_", " ")}`);
    } catch (nextError: any) {
      setError(nextError?.message || "Failed to update support status");
    }
  };

  const selectedSupportConversation = useMemo(
    () => support.find((thread) => thread._id === selectedSupportId) || null,
    [selectedSupportId, support]
  );

  const handleSendSupportReply = async () => {
    if (!selectedSupportConversation) {
      return;
    }

    if (!supportReplyText.trim() && !supportReplyAttachment) {
      setError("Write a reply or attach a file before sending");
      return;
    }

    try {
      setSupportReplySending(true);
      setError("");

      const payload = await sendAdminSupportMessage(selectedSupportConversation._id, {
        text: supportReplyText,
        attachment: supportReplyAttachment,
      });

      setSupportMessages((previous) => [...previous, payload.message]);
      setSupport((previous) =>
        previous.map((thread) =>
          thread._id === payload.conversation._id
            ? { ...thread, ...payload.conversation }
            : thread
        )
      );
      setSupportReplyText("");
      setSupportReplyAttachment(null);
      setSuccessMessage("Support reply sent");
    } catch (nextError: any) {
      setError(nextError?.message || "Failed to send support reply");
    } finally {
      setSupportReplySending(false);
    }
  };

  const handleDeleteReview = async (review: AdminReview) => {
    setPendingAction({
      kind: "deleteReview",
      review,
    });
  };

  const confirmTitle = useMemo(() => {
    if (!pendingAction) return "";

    switch (pendingAction.kind) {
      case "wallet":
        return pendingAction.walletAction === "credit"
          ? "Send SkillCoin gift"
          : "Debit SkillCoin";
      case "deleteUser":
        return "Delete user";
      case "deleteCourse":
        return "Delete course";
      case "deleteReview":
        return "Delete review";
      default:
        return "";
    }
  }, [pendingAction]);

  const confirmDescription = useMemo(() => {
    if (!pendingAction) return "";

    switch (pendingAction.kind) {
      case "wallet":
        return pendingAction.walletAction === "credit"
          ? `Send ${pendingAction.amount} SC to ${pendingAction.user.fullName || pendingAction.user.username} as an admin gift. The user will claim it from the gift popup before it reaches their wallet.`
          : `Remove ${pendingAction.amount} SC from ${pendingAction.user.fullName || pendingAction.user.username}'s available wallet balance.`;
      case "deleteUser":
        return `Delete ${pendingAction.user.fullName || pendingAction.user.username} from SkillSphere. This will remove their courses, sessions, reviews, messages, and wallet history.`;
      case "deleteCourse":
        return `Delete "${pendingAction.course.title}" from the platform. This action removes the course and its linked reviews.`;
      case "deleteReview":
        return `Delete the review from ${pendingAction.review.user.fullName || pendingAction.review.user.username}.`;
      default:
        return "";
    }
  }, [pendingAction]);

  const processingLabel = useMemo(() => {
    if (!pendingAction) return "Processing...";

    switch (pendingAction.kind) {
      case "wallet":
        return pendingAction.walletAction === "credit"
          ? "Sending SkillCoin gift..."
          : "Debiting SkillCoin...";
      case "deleteUser":
        return "Removing user and linked records...";
      case "deleteCourse":
        return "Deleting course...";
      case "deleteReview":
        return "Deleting review...";
      default:
        return "Processing...";
    }
  }, [pendingAction]);

  const handleConfirmPendingAction = async () => {
    if (!pendingAction) return;

    try {
      setActionInFlight(true);
      setError("");

      switch (pendingAction.kind) {
        case "wallet": {
          const { user, walletAction, amount, note } = pendingAction;
          const result = await adjustAdminUserWallet(user._id, {
            action: walletAction,
            amount,
            note,
          });

          if (result.wallet) {
            setUsers((previous) =>
              previous.map((entry) =>
                entry._id === user._id
                  ? {
                      ...entry,
                      skillCoinBalance: result.wallet!.skillCoinBalance,
                      lockedSkillCoins: result.wallet!.lockedSkillCoins,
                    }
                  : entry
              )
            );
          }

          setWalletAmounts((previous) => ({ ...previous, [user._id]: "" }));
          setWalletNotes((previous) => ({ ...previous, [user._id]: "" }));
          setSuccessMessage(
            walletAction === "credit"
              ? `Gift sent to ${user.fullName || user.username}`
              : `${amount} SC debited from ${user.fullName || user.username}`
          );
          setActionFeedback({
            title:
              walletAction === "credit" ? "Gift sent successfully" : "Debit completed",
            message:
              walletAction === "credit"
                ? `${amount} SC has been sent to ${user.fullName || user.username}. They’ll receive it through the in-app gift flow.`
                : `${amount} SC has been debited from ${user.fullName || user.username}'s wallet.`,
          });
          break;
        }

        case "deleteUser": {
          const { user } = pendingAction;
          await deleteAdminUser(user._id);
          setUsers((previous) =>
            previous.filter((entry) => entry._id !== user._id)
          );
          setSuccessMessage(`${user.fullName || user.username} deleted successfully`);
          setActionFeedback({
            title: "User removed",
            message: `${user.fullName || user.username} and their linked platform records have been removed.`,
          });
          break;
        }

        case "deleteCourse": {
          const { course } = pendingAction;
          await deleteAdminCourse(course._id);
          setCourses((previous) =>
            previous.filter((entry) => entry._id !== course._id)
          );
          setActionFeedback({
            title: "Course deleted",
            message: `"${course.title}" has been removed from the platform.`,
          });
          break;
        }

        case "deleteReview": {
          const { review } = pendingAction;
          await deleteAdminReview(review._id);
          setReviews((previous) =>
            previous.filter((entry) => entry._id !== review._id)
          );
          setActionFeedback({
            title: "Review deleted",
            message: `The review from ${review.user.fullName || review.user.username} has been removed.`,
          });
          break;
        }
      }

      void loadAll(search);
      setPendingAction(null);
    } catch (nextError: any) {
      setError(nextError?.message || "Failed to complete admin action");
    } finally {
      setActionInFlight(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>Admin Portal</span>
          <h1>Operate SkillSphere from one secure workspace</h1>
          <p>
            Review platform activity, moderate courses and reviews, track
            support conversations, and monitor wallet operations without
            leaving the admin surface.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={() => void loadAll(search)}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh data"}
        </button>
      </div>

      <div className={styles.tabRow}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tabButton} ${
              activeTab === tab.id ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? <div className={styles.errorBanner}>{error}</div> : null}
      {successMessage ? (
        <div className={styles.successBanner}>{successMessage}</div>
      ) : null}

      {pendingAction ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <span className={styles.modalKicker}>Admin confirmation</span>
            <h2>{confirmTitle}</h2>
            <p>{confirmDescription}</p>

            {pendingAction.kind === "wallet" && pendingAction.note ? (
              <div className={styles.modalNote}>
                <span>Admin note</span>
                <strong>{pendingAction.note}</strong>
              </div>
            ) : null}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => setPendingAction(null)}
                disabled={actionInFlight}
              >
                Cancel
              </button>
              <button
                type="button"
                className={
                  pendingAction.kind === "wallet" &&
                  pendingAction.walletAction === "credit"
                    ? styles.primaryAction
                    : styles.dangerAction
                }
                onClick={() => void handleConfirmPendingAction()}
                disabled={actionInFlight}
              >
                {actionInFlight
                  ? processingLabel
                  : pendingAction.kind === "wallet" &&
                      pendingAction.walletAction === "credit"
                    ? "Send gift"
                    : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {actionFeedback ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <span className={styles.modalKicker}>Action complete</span>
            <h2>{actionFeedback.title}</h2>
            <p>{actionFeedback.message}</p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.primaryAction}
                onClick={() => setActionFeedback(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {loading && !overview ? (
        <div className={styles.loadingState}>Loading admin workspace...</div>
      ) : null}

      {activeTab === "overview" && overview ? (
        <div className={styles.stack}>
          <div className={styles.metricGrid}>
            {[
              ["Users", overview.metrics.totalUsers],
              ["Tutors", overview.metrics.totalTutors],
              ["Courses", overview.metrics.totalCourses],
              ["Recorded", overview.metrics.recordedCourses],
              ["Sessions", overview.metrics.totalSessions],
              ["Pending sessions", overview.metrics.pendingSessions],
              ["Support threads", overview.metrics.totalSupportThreads],
              ["Pending support", overview.metrics.pendingSupportThreads],
              ["Reviews", overview.metrics.totalReviews],
              ["Wallet events", overview.metrics.totalWalletTransactions],
            ].map(([label, value]) => (
              <article key={label} className={styles.metricCard}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>

          <div className={styles.twoColumn}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Recent users</h2>
              </div>
              <div className={styles.list}>
                {overview.recentUsers.map((user) => (
                  <div key={user._id} className={styles.listRow}>
                    <div>
                      <strong>{user.fullName || user.username}</strong>
                      <span>
                        @{user.username} | {user.email}
                      </span>
                    </div>
                    <span className={styles.statusPill}>
                      {user.isAdmin
                        ? "Admin"
                        : user.isTutor
                          ? "Tutor"
                          : "User"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Recent platform activity</h2>
              </div>
              <div className={styles.list}>
                {overview.recentActivities.map((activity) => (
                  <div key={activity._id} className={styles.listRow}>
                    <div>
                      <strong>{activity.message}</strong>
                      <span>
                        {activity.type} | {activity.action}
                      </span>
                    </div>
                    <span className={styles.timestamp}>
                      {new Date(activity.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "users" ? (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>User management</h2>
            <input
              className={styles.searchInput}
              placeholder="Search by username, email, or name"
              value={search}
              onChange={(event) => void handleUserSearch(event.target.value)}
            />
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Profile</th>
                  <th>Wallet</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.fullName || user.username}</strong>
                      <span>@{user.username} | {user.email}</span>
                    </td>
                    <td>
                      {user.isAdmin
                        ? "Admin"
                        : user.isTutor
                          ? "Tutor"
                          : "User"}
                    </td>
                    <td>{user.isVerified ? "Verified" : "Pending"}</td>
                    <td>
                      {user.profileCompleted ? "Completed" : "Incomplete"}
                    </td>
                    <td>
                      {user.skillCoinBalance} SC / {user.lockedSkillCoins} locked
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.userActionStack}>
                        <div className={styles.inlineWalletTools}>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            className={styles.amountInput}
                            placeholder="SC amount"
                            value={walletAmounts[user._id] || ""}
                            onChange={(event) =>
                              setWalletAmounts((previous) => ({
                                ...previous,
                                [user._id]: event.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            className={styles.noteInput}
                            placeholder="Optional note"
                            value={walletNotes[user._id] || ""}
                            onChange={(event) =>
                              setWalletNotes((previous) => ({
                                ...previous,
                                [user._id]: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className={styles.inlineActions}>
                          <button
                            type="button"
                            className={styles.secondaryAction}
                            onClick={() => void handleUserWalletChange(user, "credit")}
                          >
                            Credit SC
                          </button>
                          <button
                            type="button"
                            className={styles.secondaryAction}
                            onClick={() => void handleUserWalletChange(user, "debit")}
                          >
                            Debit SC
                          </button>
                          {!user.isAdmin ? (
                            <button
                              type="button"
                              className={styles.dangerAction}
                              onClick={() => void handleDeleteUser(user)}
                            >
                              Delete user
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === "courses" ? (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Course moderation</h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Tutor</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td>
                      <strong>{course.title}</strong>
                      <span>{course.category} | {course.level}</span>
                    </td>
                    <td>{course.tutor.fullName || course.tutor.username}</td>
                    <td>{course.type}</td>
                    <td>
                      {course.price}
                      {course.type === "recorded" ? " SC" : "/hr"}
                    </td>
                    <td>
                      {course.averageRating.toFixed(1)} ({course.totalRatings})
                    </td>
                    <td>{course.isPublished ? "Published" : "Hidden"}</td>
                    <td>
                      <div className={styles.inlineActions}>
                        <button
                          type="button"
                          className={styles.secondaryAction}
                          onClick={() => void handleTogglePublish(course)}
                        >
                          {course.isPublished ? "Hide" : "Publish"}
                        </button>
                        <button
                          type="button"
                          className={styles.dangerAction}
                          onClick={() => void handleDeleteCourse(course)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === "sessions" ? (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Session oversight</h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Student</th>
                  <th>Tutor</th>
                  <th>Status</th>
                  <th>Coins</th>
                  <th>Scheduled</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session._id}>
                    <td>
                      <strong>{session.title}</strong>
                      <span>{session.course?.type || "live"} course</span>
                    </td>
                    <td>{session.student.fullName || session.student.username}</td>
                    <td>{session.tutor.fullName || session.tutor.username}</td>
                    <td>{session.status}</td>
                    <td>
                      {session.skillCoinAmount} SC / {session.coinStatus}
                    </td>
                    <td>{new Date(session.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === "support" ? (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Support conversations</h2>
          </div>
          <div className={styles.supportWorkspace}>
            <aside className={styles.supportList}>
              {support.map((thread) => (
                <button
                  key={thread._id}
                  type="button"
                  className={`${styles.supportThreadCard} ${
                    thread._id === selectedSupportId ? styles.supportThreadCardActive : ""
                  }`}
                  onClick={() => setSelectedSupportId(thread._id)}
                >
                  <div className={styles.supportThreadTop}>
                    <strong>{thread.subject}</strong>
                    <span>{new Date(thread.lastMessageAt).toLocaleDateString()}</span>
                  </div>
                  <span className={styles.supportThreadMeta}>
                    {thread.requester.fullName || thread.requester.username}
                  </span>
                  <span className={styles.supportThreadMeta}>
                    {thread.topic} · {thread.status.replaceAll("_", " ")}
                  </span>
                </button>
              ))}
            </aside>

            <section className={styles.supportDetail}>
              {selectedSupportConversation ? (
                <>
                  <div className={styles.supportDetailHeader}>
                    <div>
                      <h3>{selectedSupportConversation.subject}</h3>
                      <p>
                        {selectedSupportConversation.requester.fullName ||
                          selectedSupportConversation.requester.username}
                        {" · "}
                        {selectedSupportConversation.topic}
                      </p>
                    </div>

                    <div className={styles.supportDetailControls}>
                      <span className={styles.statusPill}>
                        {selectedSupportConversation.status.replaceAll("_", " ")}
                      </span>
                      <select
                        className={styles.statusSelect}
                        value={selectedSupportConversation.status}
                        onChange={(event) =>
                          void handleSupportStatus(
                            selectedSupportConversation,
                            event.target.value as AdminSupportConversation["status"]
                          )
                        }
                      >
                        <option value="open">Open</option>
                        <option value="waiting_on_support">Waiting on support</option>
                        <option value="waiting_on_user">Waiting on user</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.supportThreadFacts}>
                    <div>
                      <span>Requester</span>
                      <strong>
                        {selectedSupportConversation.requester.fullName ||
                          selectedSupportConversation.requester.username}
                      </strong>
                    </div>
                    <div>
                      <span>Assigned to</span>
                      <strong>
                        {selectedSupportConversation.assignedTo?.fullName ||
                          selectedSupportConversation.assignedTo?.username ||
                          "Unassigned"}
                      </strong>
                    </div>
                    <div>
                      <span>Last update</span>
                      <strong>
                        {new Date(
                          selectedSupportConversation.lastMessageAt
                        ).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <div className={styles.supportMessagesPane}>
                    {supportMessagesLoading ? (
                      <div className={styles.supportEmptyState}>
                        Loading conversation…
                      </div>
                    ) : supportMessages.length ? (
                      supportMessages.map((message) => (
                        <article key={message._id} className={styles.supportMessageCard}>
                          <div className={styles.supportMessageHeader}>
                            <div>
                              <strong>
                                {message.sender.fullName || message.sender.username}
                              </strong>
                              <span>
                                {message.senderRole === "support"
                                  ? "Support executive"
                                  : "User"}
                              </span>
                            </div>
                            <time dateTime={message.createdAt}>
                              {new Date(message.createdAt).toLocaleString()}
                            </time>
                          </div>

                          <p>{message.text || "Attachment only"}</p>

                          {message.attachment ? (
                            <a
                              href={message.attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.attachmentLink}
                            >
                              Open attachment: {message.attachment.name}
                            </a>
                          ) : null}
                        </article>
                      ))
                    ) : (
                      <div className={styles.supportEmptyState}>
                        No messages in this conversation yet.
                      </div>
                    )}
                  </div>

                  <div className={styles.supportReplyBox}>
                    <div className={styles.supportReplyHeader}>
                      <h4>Reply as admin</h4>
                      {supportReplyAttachment ? (
                        <span>{supportReplyAttachment.name}</span>
                      ) : (
                        <span>Attach a file if needed</span>
                      )}
                    </div>

                    <textarea
                      className={styles.supportReplyInput}
                      placeholder="Write the next response for this support conversation..."
                      value={supportReplyText}
                      onChange={(event) => setSupportReplyText(event.target.value)}
                      rows={4}
                    />

                    <div className={styles.supportReplyActions}>
                      <label className={styles.supportAttachmentButton}>
                        <input
                          type="file"
                          onChange={(event) =>
                            setSupportReplyAttachment(
                              event.target.files?.[0] || null
                            )
                          }
                        />
                        {supportReplyAttachment ? "Replace attachment" : "Attach file"}
                      </label>

                      <button
                        type="button"
                        className={styles.primaryAction}
                        onClick={() => void handleSendSupportReply()}
                        disabled={supportReplySending}
                      >
                        {supportReplySending ? "Sending reply..." : "Send reply"}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.supportEmptyState}>
                  Select a support conversation to read the message thread.
                </div>
              )}
            </section>
          </div>
        </div>
      ) : null}

      {activeTab === "reviews" ? (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Review moderation</h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Reviewer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id}>
                    <td>{review.course?.title || "Removed course"}</td>
                    <td>{review.user.fullName || review.user.username}</td>
                    <td>{review.rating}/5</td>
                    <td>{review.comment || "No comment"}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.dangerAction}
                        onClick={() => void handleDeleteReview(review)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === "wallet" ? (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Wallet activity</h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Audit</th>
                  <th>Description</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {wallet.map((entry) => (
                  <tr key={entry._id}>
                    <td>{entry.user.fullName || entry.user.username}</td>
                    <td>{entry.type}</td>
                    <td>{entry.amount} SC</td>
                    <td>{entry.auditStatus}</td>
                    <td>{entry.description}</td>
                    <td>{new Date(entry.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default AdminPortal;
