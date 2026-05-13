import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  IndianRupee,
  Layers3,
  Link2,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import styles from "./CourseDetails.module.scss";

const CourseSidebar = ({
  course,
  onOpen,
  canRequestSession = true,
  isOwnCourse = false,
  isLoggedIn = false,
  onRecordedPurchaseRequest,
  onApproveRecordedRequest,
  onRejectRecordedRequest,
  recordedActionLoading = "",
  recordedError = "",
}: any) => {
  const isRecorded = course.type === "recorded";
  const recordedAccess = course.recordedAccess;
  const recordedRequests = course.recordedRequests || [];

  const actionLabel = !isLoggedIn
    ? "Login to unlock"
    : recordedAccess?.hasAccess
      ? "Open recorded content"
      : recordedAccess?.hasPendingRequest
        ? "Waiting for tutor approval"
        : "Pay & request unlock";

  const handleRecordedAction = () => {
    if (!isLoggedIn) {
      onOpen?.();
      return;
    }

    if (recordedAccess?.hasAccess && recordedAccess.contentDriveLink) {
      window.open(recordedAccess.contentDriveLink, "_blank", "noopener,noreferrer");
      return;
    }

    onRecordedPurchaseRequest?.();
  };

  return (
    <aside className={styles.right}>
      <div className={styles.previewCard}>
        <span className={styles.sidebarKicker}>Course snapshot</span>
        <h3>{course.category || "Personalized learning"}</h3>
        <p>
          {isRecorded
            ? isOwnCourse
              ? "Learners pay in SkillCoin first, then you approve the unlock request before the Drive content becomes visible."
              : "Recorded access stays locked until payment is reserved and the tutor approves the unlock request."
            : canRequestSession
              ? "Book a live session to turn the course material into a focused working plan with direct tutor guidance."
              : "Review how this course is presented to learners, including pricing, positioning, ratings, and written feedback."}
        </p>

        <div className={styles.previewTags}>
          <span>{isRecorded ? "Recorded" : "Live session"}</span>
          <span>{course.level || "All levels"}</span>
          <span>{course.duration || "Flexible pace"}</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.priceBlock}>
          <span className={styles.priceLabel}>
            {isRecorded ? "Unlock price" : "Session rate"}
          </span>
          <strong className={styles.price}>
            <IndianRupee size={22} />
            {course.price ?? 0}
          </strong>
          <p className={styles.priceNote}>
            {isRecorded
              ? "One-time SkillCoin payment that stays locked until the tutor approves access."
              : "Estimated for a 60-minute live session."}
          </p>
        </div>

        {isRecorded ? (
          <>
            {!isOwnCourse ? (
              <button
                type="button"
                className={styles.requestButton}
                onClick={handleRecordedAction}
                disabled={
                  recordedActionLoading === "purchase" ||
                  recordedAccess?.hasPendingRequest
                }
              >
                {recordedActionLoading === "purchase"
                  ? "Processing..."
                  : actionLabel}
                <ArrowRight size={16} />
              </button>
            ) : null}

            {recordedError ? (
              <p className={styles.error}>{recordedError}</p>
            ) : null}

            {recordedAccess?.hasAccess ? (
              <div className={styles.sidebarItem}>
                <CheckCircle2 size={18} />
                <div>
                  <strong>Unlocked for you</strong>
                  <span>
                    The tutor has approved your request. Use the button above to open the Drive content.
                  </span>
                </div>
              </div>
            ) : null}

            {recordedAccess?.hasPendingRequest ? (
              <div className={styles.sidebarItem}>
                <CircleAlert size={18} />
                <div>
                  <strong>Approval pending</strong>
                  <span>
                    SkillCoin is locked now. The tutor still needs to approve content unlock.
                  </span>
                </div>
              </div>
            ) : null}

            {isOwnCourse ? (
              <div className={styles.recordedRequests}>
                <div className={styles.recordedRequestsHeader}>
                  <span className={styles.summaryLabel}>Unlock requests</span>
                  <strong>
                    {recordedRequests.length} learner
                    {recordedRequests.length === 1 ? "" : "s"}
                  </strong>
                </div>

                {course.contentDriveLink ? (
                  <div className={styles.sidebarItem}>
                    <Link2 size={18} />
                    <div>
                      <strong>Drive content ready</strong>
                      <span>
                        Learners only receive the Google Drive link after you approve the request.
                      </span>
                    </div>
                  </div>
                ) : null}

                {recordedRequests.length ? (
                  <div className={styles.requestList}>
                    {recordedRequests.map((request: any) => {
                      const isApproving =
                        recordedActionLoading === `approve:${request._id}`;
                      const isRejecting =
                        recordedActionLoading === `reject:${request._id}`;

                      return (
                        <div key={request._id} className={styles.requestCard}>
                          <div className={styles.requestCardHeader}>
                            <div>
                              <strong>
                                {request.student?.fullName ||
                                  request.student?.username ||
                                  "Learner"}
                              </strong>
                              <span>
                                @{request.student?.username || "learner"} |{" "}
                                {request.skillCoinAmount} SC
                              </span>
                            </div>
                            <span className={styles.requestStatus}>
                              {request.status}
                            </span>
                          </div>

                          <span className={styles.requestTime}>
                            Requested{" "}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>

                          {request.status === "pending" ? (
                            <div className={styles.requestActions}>
                              <button
                                type="button"
                                className={styles.approveAction}
                                onClick={() =>
                                  onApproveRecordedRequest?.(request._id)
                                }
                                disabled={isApproving || isRejecting}
                              >
                                {isApproving ? "Approving..." : "Approve unlock"}
                              </button>
                              <button
                                type="button"
                                className={styles.rejectAction}
                                onClick={() =>
                                  onRejectRecordedRequest?.(request._id)
                                }
                                disabled={isApproving || isRejecting}
                              >
                                {isRejecting ? "Rejecting..." : "Reject"}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.emptyRequestState}>
                    No unlock requests yet. Learners will appear here after they pay and request access.
                  </div>
                )}
              </div>
            ) : null}
          </>
        ) : canRequestSession ? (
          <button
            type="button"
            className={styles.requestButton}
            onClick={onOpen}
          >
            Request session
            <ArrowRight size={16} />
          </button>
        ) : null}

        <div className={styles.sidebarList}>
          <div className={styles.sidebarItem}>
            {isRecorded ? <PlayCircle size={18} /> : <CalendarClock size={18} />}
            <div>
              <strong>
                {isRecorded ? "Tutor-approved access" : "Flexible scheduling"}
              </strong>
              <span>
                {isRecorded
                  ? "The Google Drive content unlocks only after the tutor approves your paid request."
                  : "Choose a date and time that fits your plan."}
              </span>
            </div>
          </div>

          <div className={styles.sidebarItem}>
            <Layers3 size={18} />
            <div>
              <strong>
                {isRecorded ? "Structured course path" : "Focused guidance"}
              </strong>
              <span>
                {isRecorded
                  ? "Use the course material at your own pace once access is granted."
                  : "Use the session to clarify lessons and next steps."}
              </span>
            </div>
          </div>

          <div className={styles.sidebarItem}>
            <Clock3 size={18} />
            <div>
              <strong>
                {isRecorded ? "Full content length" : "30 to 90 minute blocks"}
              </strong>
              <span>
                {isRecorded
                  ? "The duration shown here reflects the total learning runtime of the recorded course."
                  : "Right-sized time slots for quick help or deep work."}
              </span>
            </div>
          </div>

          <div className={styles.sidebarItem}>
            <Sparkles size={18} />
            <div>
              <strong>
                {isRecorded
                  ? "Secure unlock workflow"
                  : "Personalized follow-through"}
              </strong>
              <span>
                {isRecorded
                  ? "SkillCoin stays protected until the tutor either unlocks the content or rejects the request."
                  : "Send context up front so the tutor can prepare well."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CourseSidebar;
