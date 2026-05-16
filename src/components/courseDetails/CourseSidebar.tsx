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
  onTuitionEnrollmentRequest,
  onApproveTuitionRequest,
  onRejectTuitionRequest,
  onPauseTuitionEnrollment,
  onResumeTuitionEnrollment,
  onCancelTuitionEnrollment,
  tuitionActionLoading = "",
  tuitionError = "",
}: any) => {
  const isRecorded = course.type === "recorded";
  const isTuition = course.type === "tuition";
  const recordedAccess = course.recordedAccess;
  const recordedRequests = course.recordedRequests || [];
  const tuitionEnrollment = course.tuitionEnrollment;
  const tuitionRequests = course.tuitionRequests || [];
  const tuitionDays = course.tuitionSchedule?.days || [];
  const tuitionWeeks = course.tuitionSchedule?.weeks || [];
  const tuitionScheduleText = tuitionDays.length
    ? `${tuitionDays.join(", ")}${
        course.tuitionSchedule?.startTime
          ? ` at ${course.tuitionSchedule.startTime}`
          : ""
      }`
    : "Weekly timetable shared by tutor";

  const actionLabel = !isLoggedIn
    ? "Login to unlock"
    : recordedAccess?.hasAccess
      ? "Open recorded content"
      : recordedAccess?.hasPendingRequest
        ? "Waiting for tutor approval"
        : "Pay & request unlock";

  const tuitionActionLabel = !isLoggedIn
    ? "Login to enroll"
    : tuitionEnrollment?.hasEnrollment
      ? "Tuition active"
      : tuitionEnrollment?.hasPendingRequest
        ? "Waiting for tutor approval"
        : "Request tuition enrollment";

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

  const handleTuitionAction = () => {
    if (!isLoggedIn) {
      onOpen?.();
      return;
    }

    onTuitionEnrollmentRequest?.();
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
            : isTuition
              ? isOwnCourse
                ? "Publish a recurring timetable so learners can understand the weekly rhythm of your tuition offer at a glance."
                : "This recurring tuition plan runs on a published weekly schedule each month so learners can judge if the timetable fits."
            : canRequestSession
              ? "Book a live session to turn the course material into a focused working plan with direct tutor guidance."
              : "Review how this course is presented to learners, including pricing, positioning, ratings, and written feedback."}
        </p>

        <div className={styles.previewTags}>
          <span>
            {isRecorded
              ? "Recorded"
              : isTuition
                ? "Recurring tuition"
                : "Live session"}
          </span>
          <span>{course.level || "All levels"}</span>
          <span>{isTuition ? tuitionScheduleText : course.duration || "Flexible pace"}</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.priceBlock}>
          <span className={styles.priceLabel}>
            {isRecorded
              ? "Unlock price"
              : isTuition
                ? "Monthly tuition fee"
                : "Session rate"}
          </span>
          <strong className={styles.price}>
            <IndianRupee size={22} />
            {course.price ?? 0}
          </strong>
          <p className={styles.priceNote}>
            {isRecorded
              ? "One-time SkillCoin payment that stays locked until the tutor approves access."
              : isTuition
                ? "Use this to position a repeating tuition plan with a stable monthly fee."
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
        ) : isTuition ? (
          <>
            {!isOwnCourse ? (
              <button
                type="button"
                className={styles.requestButton}
                onClick={handleTuitionAction}
                disabled={
                  tuitionActionLoading === "request" ||
                  tuitionEnrollment?.hasPendingRequest ||
                  tuitionEnrollment?.hasEnrollment
                }
              >
                {tuitionActionLoading === "request"
                  ? "Processing..."
                  : tuitionActionLabel}
                <ArrowRight size={16} />
              </button>
            ) : null}

            {tuitionError ? <p className={styles.error}>{tuitionError}</p> : null}

            {tuitionEnrollment?.hasEnrollment ? (
              <div className={styles.sidebarItem}>
                <CheckCircle2 size={18} />
                <div>
                  <strong>
                    {tuitionEnrollment?.status === "paused"
                      ? "Recurring tuition is paused"
                      : "Recurring tuition is active"}
                  </strong>
                  <span>
                    {tuitionEnrollment?.status === "paused"
                      ? "The tutor has paused new class generation for now. Existing completed records stay intact."
                      : "Upcoming classes are generated automatically into the sessions timeline."}
                  </span>
                </div>
              </div>
            ) : null}

            {tuitionEnrollment?.hasPendingRequest ? (
              <div className={styles.sidebarItem}>
                <CircleAlert size={18} />
                <div>
                  <strong>Approval pending</strong>
                  <span>
                    Your monthly tuition fee is locked until the tutor accepts or declines the recurring plan.
                  </span>
                </div>
              </div>
            ) : null}

            {!isOwnCourse && tuitionEnrollment?.requestId && tuitionEnrollment?.canCancel ? (
              <button
                type="button"
                className={styles.rejectAction}
                onClick={() => onCancelTuitionEnrollment?.(tuitionEnrollment.requestId)}
                disabled={tuitionActionLoading === `cancel:${tuitionEnrollment.requestId}`}
              >
                {tuitionActionLoading === `cancel:${tuitionEnrollment.requestId}`
                  ? "Cancelling..."
                  : tuitionEnrollment.status === "pending"
                    ? "Cancel request"
                    : "Cancel tuition"}
              </button>
            ) : null}

            {isOwnCourse ? (
              <div className={styles.recordedRequests}>
                <div className={styles.recordedRequestsHeader}>
                  <span className={styles.summaryLabel}>Tuition requests</span>
                  <strong>
                    {tuitionRequests.length} learner
                    {tuitionRequests.length === 1 ? "" : "s"}
                  </strong>
                </div>

                {tuitionRequests.length ? (
                  <div className={styles.requestList}>
                    {tuitionRequests.map((request: any) => {
                      const isApproving =
                        tuitionActionLoading === `approve:${request._id}`;
                      const isRejecting =
                        tuitionActionLoading === `reject:${request._id}`;
                      const isPausing =
                        tuitionActionLoading === `pause:${request._id}`;
                      const isResuming =
                        tuitionActionLoading === `resume:${request._id}`;
                      const isCancelling =
                        tuitionActionLoading === `cancel:${request._id}`;

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
                            <span className={styles.requestStatus}>{request.status}</span>
                          </div>

                          <span className={styles.requestTime}>
                            {request.scheduleSnapshot?.days?.join(", ") || "Weekly schedule"}
                            {request.scheduleSnapshot?.startTime
                              ? ` at ${request.scheduleSnapshot.startTime}`
                              : ""}
                          </span>

                          {request.status === "pending" ? (
                            <div className={styles.requestActions}>
                              <button
                                type="button"
                                className={styles.approveAction}
                                onClick={() => onApproveTuitionRequest?.(request._id)}
                                disabled={isApproving || isRejecting}
                              >
                                {isApproving ? "Approving..." : "Approve tuition"}
                              </button>
                              <button
                                type="button"
                                className={styles.rejectAction}
                                onClick={() => onRejectTuitionRequest?.(request._id)}
                                disabled={isApproving || isRejecting}
                              >
                                {isRejecting ? "Rejecting..." : "Reject"}
                              </button>
                            </div>
                          ) : request.status === "approved" ? (
                            <div className={styles.requestActions}>
                              <button
                                type="button"
                                className={styles.secondaryAction}
                                onClick={() => onPauseTuitionEnrollment?.(request._id)}
                                disabled={isPausing || isCancelling}
                              >
                                {isPausing ? "Pausing..." : "Pause"}
                              </button>
                              <button
                                type="button"
                                className={styles.rejectAction}
                                onClick={() => onCancelTuitionEnrollment?.(request._id)}
                                disabled={isPausing || isCancelling}
                              >
                                {isCancelling ? "Cancelling..." : "Cancel plan"}
                              </button>
                            </div>
                          ) : request.status === "paused" ? (
                            <div className={styles.requestActions}>
                              <button
                                type="button"
                                className={styles.approveAction}
                                onClick={() => onResumeTuitionEnrollment?.(request._id)}
                                disabled={isResuming || isCancelling}
                              >
                                {isResuming ? "Resuming..." : "Resume"}
                              </button>
                              <button
                                type="button"
                                className={styles.rejectAction}
                                onClick={() => onCancelTuitionEnrollment?.(request._id)}
                                disabled={isResuming || isCancelling}
                              >
                                {isCancelling ? "Cancelling..." : "Cancel plan"}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.emptyRequestState}>
                    No tuition requests yet. Learners will appear here after they request the recurring plan.
                  </div>
                )}
              </div>
            ) : null}
          </>
        ) : !isTuition && canRequestSession ? (
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
                {isRecorded
                  ? "Tutor-approved access"
                  : isTuition
                    ? "Recurring timetable"
                    : "Flexible scheduling"}
              </strong>
              <span>
                {isRecorded
                  ? "The Google Drive content unlocks only after the tutor approves your paid request."
                  : isTuition
                    ? tuitionScheduleText
                  : "Choose a date and time that fits your plan."}
              </span>
            </div>
          </div>

          <div className={styles.sidebarItem}>
            <Layers3 size={18} />
            <div>
              <strong>
                {isRecorded
                  ? "Structured course path"
                  : isTuition
                    ? "Monthly repeat pattern"
                    : "Focused guidance"}
              </strong>
              <span>
                {isRecorded
                  ? "Use the course material at your own pace once access is granted."
                  : isTuition
                    ? tuitionWeeks.length
                      ? `Runs across week ${tuitionWeeks.join(", ")} of the month on a repeating basis.`
                      : "Recurring tuition is published as a repeating monthly timetable."
                  : "Use the session to clarify lessons and next steps."}
              </span>
            </div>
          </div>

          <div className={styles.sidebarItem}>
            <Clock3 size={18} />
            <div>
              <strong>
                {isRecorded
                  ? "Full content length"
                  : isTuition
                    ? "Each class duration"
                    : "30 to 90 minute blocks"}
              </strong>
              <span>
                {isRecorded
                  ? "The duration shown here reflects the total learning runtime of the recorded course."
                  : isTuition
                    ? `${course.duration || "Flexible"} per class within the recurring tuition schedule.`
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
                  : isTuition
                    ? "Recurring learning rhythm"
                    : "Personalized follow-through"}
              </strong>
              <span>
                {isRecorded
                  ? "SkillCoin stays protected until the tutor either unlocks the content or rejects the request."
                  : isTuition
                    ? "Use this offer to present a dependable weekly tuition cadence instead of one-off session work."
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
