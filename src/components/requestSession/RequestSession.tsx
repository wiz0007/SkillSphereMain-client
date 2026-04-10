import { useState } from "react";
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

const RequestModal: React.FC<Props> = ({ course, onClose }) => {
  const { user, loading: authLoading } = useAuth();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (authLoading || !user?._id) {
      alert("Please login first");
      return;
    }

    if (!date || !time) {
      alert("Please select date and time");
      return;
    }

    const selectedDate = new Date(`${date}T${time}`);

    if (selectedDate <= new Date()) {
      alert("Please select a future time");
      return;
    }

    try {
      setLoading(true);

      await createSession({
        courseId: course._id,
        date: selectedDate.toISOString(),
        duration,
        message,
      });

      setSuccess(true);
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          "Failed to request session"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUCCESS ================= */

  if (success) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <h2>🎉 Request Sent!</h2>

          <p>
            Your session request has been sent to the tutor.
          </p>

          <p>⏳ Status: Pending Approval</p>

          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  /* ================= LOADING GUARD ================= */

  if (authLoading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  /* ================= PRICE ================= */

  const price = course.price
    ? Math.round((course.price / 60) * duration)
    : 0;

  /* ================= UI ================= */

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Request a Session</h2>

        <div className={styles.field}>
          <label>Date</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split("T")[0]} // ✅ prevent past
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Duration</label>
          <select
            value={duration}
            onChange={(e) =>
              setDuration(Number(e.target.value))
            }
          >
            <option value={30}>30 mins</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Message</label>
          <textarea
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
          />
        </div>

        <div className={styles.price}>
          <span>Estimated Price:</span>
          <strong>₹ {price}</strong>
        </div>

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Requesting..." : "Confirm Request"}
        </button>

        <button className={styles.cancel} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RequestModal;