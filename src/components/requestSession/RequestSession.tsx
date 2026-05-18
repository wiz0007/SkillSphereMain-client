import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  MessageSquareText,
  Send,
  X,
} from "lucide-react";
import styles from "./RequestSession.module.scss";
import { createSession } from "../../services/session.service";
import { useAuth } from "../../context/AuthContext";

interface Props {
  course: {
    _id: string;
    price?: number;
  };
  onClose: () => void;
}

const RequestModal = ({ course, onClose }: Props) => {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const durationOptions = [30, 60, 90];

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formError, setFormError] = useState("");

  const selectedDate = date && time ? new Date(`${date}T${time}`) : null;
  const fieldErrors = {
    date: !date ? "Choose a date." : "",
    time: !time ? "Choose a time." : "",
    timing:
      selectedDate && selectedDate <= new Date()
        ? "Pick a future date and time."
        : "",
  };

  const handleRechargeRedirect = () => {
    onClose();
    navigate("/wallet", {
      state: {
        from: location.pathname,
        suggestedRechargeAmount: Math.max(
          estimatedPrice,
          estimatedPrice - availableSkillCoins
        ),
      },
    });
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    setFormError("");

    if (authLoading || !user?._id) {
      onClose();
      navigate("/login", {
        state: { from: location.pathname },
      });
      return;
    }

    if (fieldErrors.date || fieldErrors.time || fieldErrors.timing) {
      return;
    }

    const requestDate = selectedDate;
    if (!requestDate) {
      return;
    }

    try {
      setLoading(true);

      await createSession({
        courseId: course._id,
        date: requestDate.toISOString(),
        duration,
        message,
      });

      await refreshUser();
      setSuccess(true);
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message ||
          "Failed to request session"
      );
    } finally {
      setLoading(false);
    }
  };

  const estimatedPrice = course.price
    ? Math.round((course.price / 60) * duration)
    : 0;
  const availableSkillCoins = user?.availableSkillCoins || 0;
  const lockedSkillCoins = user?.lockedSkillCoins || 0;
  const hasEnoughSkillCoins = availableSkillCoins >= estimatedPrice;

  const selectedDateLabel = useMemo(() => {
    if (!date || !time) return "Choose a date and time";

    return new Date(`${date}T${time}`).toLocaleString([], {
      dateStyle: "full",
      timeStyle: "short",
    });
  }, [date, time]);

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(value);

  const handlePrimaryAction = async () => {
    if (hasEnoughSkillCoins) {
      await handleSubmit();
      return;
    }

    handleRechargeRedirect();
  };

  if (success) {
    return (
      <div className={styles.overlay}>
        <div
          className={`${styles.modal} ${styles.successModal}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-session-success"
        >
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close request session modal"
          >
            <X size={18} />
          </button>

          <div className={styles.successBadge}>
            <CheckCircle2 size={18} />
            Request sent
          </div>

          <h2 id="request-session-success">Your request is on its way</h2>
          <p className={styles.successNote}>
            The tutor can now review your preferred time, session
            length, and message before confirming. The matching
            SkillCoin amount stays locked until the request is
            declined or the session is completed and confirmed.
          </p>

          <div className={styles.summaryCard}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Requested for</span>
              <strong className={styles.summaryValue}>
                {selectedDateLabel}
              </strong>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Session length</span>
              <strong className={styles.summaryValue}>
                {duration} minutes
              </strong>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Status</span>
              <strong className={styles.summaryValue}>
                Pending approval
              </strong>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>SkillCoin lock</span>
              <strong className={styles.summaryValue}>
                {estimatedPrice} SC reserved
              </strong>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <p className={styles.loadingState}>
            Loading your session workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-session-title"
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close request session modal"
        >
          <X size={18} />
        </button>

        <div className={styles.header}>
          <div>
            <span className={styles.kicker}>Session request</span>
            <h2 id="request-session-title">Plan a 1-on-1 session</h2>
            <p>
              Pick a time that works for you, add context for the
              tutor, and send a focused request in one step.
              SkillCoin follows a simple rule: 1 INR = 1 SC.
            </p>
          </div>

          <div className={styles.headerBadge}>
            <IndianRupee size={16} />
            {course.price
              ? `${formatAmount(course.price)}/hour`
              : "Flexible pricing"}
          </div>
        </div>

        <div className={styles.body}>
          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            {submitAttempted &&
            (fieldErrors.date ||
              fieldErrors.time ||
              fieldErrors.timing ||
              formError) ? (
              <div className={styles.errorBanner} role="alert">
                {formError ||
                  fieldErrors.date ||
                  fieldErrors.time ||
                  fieldErrors.timing}
              </div>
            ) : null}

            <div className={styles.grid}>
              <div
                className={`${styles.field} ${
                  submitAttempted && fieldErrors.date
                    ? styles.fieldInvalid
                    : ""
                }`}
              >
                <label className={styles.label} htmlFor="session-date">
                  <CalendarDays size={16} />
                  Date
                </label>
                <input
                  id="session-date"
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(event) => setDate(event.target.value)}
                />
                {submitAttempted && fieldErrors.date ? (
                  <small className={styles.errorText}>
                    {fieldErrors.date}
                  </small>
                ) : null}
              </div>

              <div
                className={`${styles.field} ${
                  submitAttempted &&
                  (fieldErrors.time || fieldErrors.timing)
                    ? styles.fieldInvalid
                    : ""
                }`}
              >
                <label className={styles.label} htmlFor="session-time">
                  <Clock3 size={16} />
                  Time
                </label>
                <input
                  id="session-time"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                />
                {submitAttempted &&
                (fieldErrors.time || fieldErrors.timing) ? (
                  <small className={styles.errorText}>
                    {fieldErrors.time || fieldErrors.timing}
                  </small>
                ) : null}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Duration</label>
              <div className={styles.durationGrid}>
                {durationOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`${styles.durationOption} ${
                      duration === option ? styles.durationActive : ""
                    }`}
                    onClick={() => setDuration(option)}
                  >
                    <strong>{option}</strong>
                    <span>minutes</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label
                className={styles.label}
                htmlFor="session-message"
              >
                <MessageSquareText size={16} />
                Message
              </label>
              <textarea
                id="session-message"
                value={message}
                placeholder="Share what you want to work on so the tutor can prepare."
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type={hasEnoughSkillCoins ? "submit" : "button"}
                className={styles.primaryAction}
                disabled={loading}
                onClick={
                  hasEnoughSkillCoins
                    ? undefined
                    : () => void handlePrimaryAction()
                }
              >
                <Send size={16} />
                {loading
                  ? "Sending..."
                  : hasEnoughSkillCoins
                    ? "Send request"
                    : "Recharge SkillCoin"}
              </button>
            </div>
          </form>

          <aside className={styles.summaryCard}>
            <span className={styles.summaryKicker}>Request summary</span>
            <h3>Make the handoff easy</h3>
            <p className={styles.summaryMeta}>
              A clear request helps the tutor confirm faster and
              come prepared with the right context.
            </p>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Requested slot</span>
              <strong className={styles.summaryValue}>
                {selectedDateLabel}
              </strong>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Available now</span>
              <strong className={styles.summaryValue}>
                {availableSkillCoins} SC available
              </strong>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Already locked</span>
              <strong className={styles.summaryValue}>
                {lockedSkillCoins} SC in holds
              </strong>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Session length</span>
              <strong className={styles.summaryValue}>
                {duration} minutes
              </strong>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>
                Estimated total
              </span>
              <strong className={styles.summaryValue}>
                {course.price
                  ? `${formatAmount(estimatedPrice)} SC`
                  : "Shared with tutor"}
              </strong>
            </div>
            <div className={styles.balanceBar}>
              <div
                className={styles.balanceFill}
                style={{
                  width: `${
                    availableSkillCoins + lockedSkillCoins
                      ? (lockedSkillCoins /
                          (availableSkillCoins + lockedSkillCoins)) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className={styles.lockCopy}>
              {hasEnoughSkillCoins
                ? `${estimatedPrice} SC will be locked immediately when you send this request.`
                : `You need ${Math.max(
                    0,
                    estimatedPrice - availableSkillCoins
                  )} more SC before you can book this session.`}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;
