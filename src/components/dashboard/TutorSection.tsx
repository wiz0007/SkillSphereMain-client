import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../dashboard/Dashboard.module.scss";
import {
  cancelTuitionEnrollment,
  getMyCourses,
  getMyTuitionEnrollments,
  pauseTuitionEnrollment,
  resumeTuitionEnrollment,
  deleteCourse,
  type Course,
  type TuitionEnrollmentListItem,
} from "../../services/courses.service";
import TutorCourseCard from "../tutorCourseCard/TutorCourseCard";
import { useAuth } from "../../context/AuthContext";
import AppDialog from "../ui/AppDialog";

interface TutorSectionProps {
  summary: {
    courseCount: number;
    pendingRequests: number;
    averageRating: number;
  };
}

const TutorSection = ({ summary }: TutorSectionProps) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [tuitionEnrollments, setTuitionEnrollments] = useState<
    TuitionEnrollmentListItem[]
  >([]);
  const [tuitionActionLoading, setTuitionActionLoading] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{
    mode: "single" | "bulk";
    course?: Course;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{
    title: string;
    message: string;
    tone?: "default" | "success" | "warning" | "danger";
  } | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const [data, tuitionData] = await Promise.all([
        getMyCourses(),
        getMyTuitionEnrollments(),
      ]);
      setCourses(Array.isArray(data) ? data : []);
      setTuitionEnrollments(
        Array.isArray(tuitionData)
          ? tuitionData.filter((entry) => entry.role === "tutor")
          : []
      );
    } catch (err) {
      console.error("Fetch error:", err);
      setCourses([]);
      setTuitionEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user?.isTutor) return;
    fetchCourses();
  }, [user, authLoading]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddCourse = () => {
    navigate("/add-course");
  };

  const handleEdit = (course: Course) => {
    navigate(`/add-course/${course._id}`, {
      state: course,
    });
  };

  const handleView = (id: string) => {
    navigate(`/course/${id}`);
  };

  const handleDelete = async (id: string) => {
    const course = courses.find((entry) => entry._id === id);
    if (!course) return;
    setPendingDelete({ mode: "single", course });
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    setPendingDelete({ mode: "bulk" });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      setDeleting(true);

      if (pendingDelete.mode === "single" && pendingDelete.course) {
        await deleteCourse(pendingDelete.course._id);
        setFeedback({
          title: "Course deleted",
          message: `"${pendingDelete.course.title}" has been removed from your tutor catalogue.`,
          tone: "success",
        });
      } else {
        await Promise.all(selected.map((id) => deleteCourse(id)));
        setFeedback({
          title: "Courses deleted",
          message: `${selected.length} selected courses have been removed from your tutor catalogue.`,
          tone: "success",
        });
        setSelected([]);
      }

      await fetchCourses();
      setPendingDelete(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      setFeedback({
        title: "Delete unavailable",
        message: err?.message || "The course could not be deleted right now.",
        tone: "danger",
      });
    } finally {
      setDeleting(false);
    }
  };

  const updateTuitionEnrollmentState = (
    enrollmentId: string,
    nextStatus: TuitionEnrollmentListItem["status"]
  ) => {
    setTuitionEnrollments((previous) =>
      previous.map((entry) =>
        entry._id === enrollmentId
          ? { ...entry, status: nextStatus }
          : entry
      )
    );
  };

  const handlePauseTuition = async (enrollmentId: string) => {
    try {
      setTuitionActionLoading(`pause:${enrollmentId}`);
      await pauseTuitionEnrollment(enrollmentId);
      updateTuitionEnrollmentState(enrollmentId, "paused");
      await fetchCourses();
    } catch (err: any) {
      setFeedback({
        title: "Pause unavailable",
        message:
          err?.message || "The tuition plan could not be paused right now.",
        tone: "danger",
      });
    } finally {
      setTuitionActionLoading("");
    }
  };

  const handleResumeTuition = async (enrollmentId: string) => {
    try {
      setTuitionActionLoading(`resume:${enrollmentId}`);
      await resumeTuitionEnrollment(enrollmentId);
      updateTuitionEnrollmentState(enrollmentId, "approved");
      await fetchCourses();
    } catch (err: any) {
      setFeedback({
        title: "Resume unavailable",
        message:
          err?.message || "The tuition plan could not be resumed right now.",
        tone: "danger",
      });
    } finally {
      setTuitionActionLoading("");
    }
  };

  const handleCancelTuition = async (enrollmentId: string) => {
    try {
      setTuitionActionLoading(`cancel:${enrollmentId}`);
      await cancelTuitionEnrollment(enrollmentId);
      updateTuitionEnrollmentState(enrollmentId, "cancelled");
      await fetchCourses();
    } catch (err: any) {
      setFeedback({
        title: "Cancellation unavailable",
        message:
          err?.message || "The tuition plan could not be cancelled right now.",
        tone: "danger",
      });
    } finally {
      setTuitionActionLoading("");
    }
  };

  return (
    <div className={styles.tutorSection}>
      <div className={styles.sectionTitleRow}>
        <div>
          <h2>Your Courses</h2>
          <p className={styles.sectionSubtitle}>
            Manage your catalogue, respond to demand, and keep your offers fresh.
          </p>
        </div>

        <div className={styles.tutorHighlights}>
          <span>{summary.courseCount} courses</span>
          <span>{summary.pendingRequests} pending</span>
          <span>
            {summary.averageRating ? `${summary.averageRating}★ avg` : "New tutor"}
          </span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <button className={styles.addBtn} onClick={handleAddCourse}>
          + Add Course
        </button>

        {selected.length > 0 ? (
          <button className={styles.bulkDelete} onClick={handleBulkDelete}>
            Delete Selected ({selected.length})
          </button>
        ) : null}
      </div>

      <div className={styles.panel}>
        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>No courses yet</strong>
            <span>
              Create your first course to start accepting student requests.
            </span>
          </div>
        ) : (
          <div className={styles.grid}>
            {courses.map((course) => (
              <TutorCourseCard
                key={course._id}
                course={course}
                selectable
                selected={selected.includes(course._id)}
                onSelect={toggleSelect}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onView={handleView}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.panel}>
        <div className={styles.sectionTitleRow}>
          <div>
            <h2>Recurring tuition enrollments</h2>
            <p className={styles.sectionSubtitle}>
              Monitor active recurring learners, their next class, and pause or cancel plans when needed.
            </p>
          </div>
        </div>

        {loading ? (
          <p>Loading enrollments...</p>
        ) : tuitionEnrollments.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>No tuition enrollments yet</strong>
            <span>
              Approved recurring learners will appear here with next-class visibility and control actions.
            </span>
          </div>
        ) : (
          <div className={styles.tuitionList}>
            {tuitionEnrollments.map((entry) => {
              const isPausing =
                tuitionActionLoading === `pause:${entry._id}`;
              const isResuming =
                tuitionActionLoading === `resume:${entry._id}`;
              const isCancelling =
                tuitionActionLoading === `cancel:${entry._id}`;

              return (
                <div key={entry._id} className={styles.tuitionCard}>
                  <div className={styles.tuitionHeader}>
                    <div>
                      <strong>{entry.course.title}</strong>
                      <span>
                        {entry.student.fullName || entry.student.username
                          ? `Learner: ${entry.student.fullName || entry.student.username}`
                          : "Learner enrolled"}
                      </span>
                    </div>
                    <span className={styles.tuitionStatus}>{entry.status}</span>
                  </div>

                  <div className={styles.tuitionMeta}>
                    <span>
                      {entry.scheduleSnapshot.days.join(", ")}
                      {entry.scheduleSnapshot.startTime
                        ? ` at ${entry.scheduleSnapshot.startTime}`
                        : ""}
                    </span>
                    <span>
                      Weeks {entry.scheduleSnapshot.weeks.join(", ")} | ₹
                      {entry.price}/month
                    </span>
                    <span>
                      {entry.nextSessionDate
                        ? `Next class: ${new Date(
                            entry.nextSessionDate
                          ).toLocaleString()}`
                        : entry.status === "paused"
                          ? "No classes generated while paused"
                          : "Next class will appear after schedule sync"}
                    </span>
                  </div>

                  <div className={styles.tuitionActions}>
                    {entry.status === "approved" ? (
                      <>
                        <button
                          type="button"
                          className={styles.tuitionSecondary}
                          onClick={() => void handlePauseTuition(entry._id)}
                          disabled={isPausing || isCancelling}
                        >
                          {isPausing ? "Pausing..." : "Pause"}
                        </button>
                        <button
                          type="button"
                          className={styles.tuitionDanger}
                          onClick={() => void handleCancelTuition(entry._id)}
                          disabled={isPausing || isCancelling}
                        >
                          {isCancelling ? "Cancelling..." : "Cancel plan"}
                        </button>
                      </>
                    ) : null}

                    {entry.status === "paused" ? (
                      <>
                        <button
                          type="button"
                          className={styles.tuitionPrimary}
                          onClick={() => void handleResumeTuition(entry._id)}
                          disabled={isResuming || isCancelling}
                        >
                          {isResuming ? "Resuming..." : "Resume"}
                        </button>
                        <button
                          type="button"
                          className={styles.tuitionDanger}
                          onClick={() => void handleCancelTuition(entry._id)}
                          disabled={isResuming || isCancelling}
                        >
                          {isCancelling ? "Cancelling..." : "Cancel plan"}
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AppDialog
        open={Boolean(pendingDelete)}
        kicker="Delete confirmation"
        title={
          pendingDelete?.mode === "bulk"
            ? "Delete selected courses"
            : "Delete this course"
        }
        message={
          pendingDelete?.mode === "bulk"
            ? `Remove ${selected.length} selected courses from your catalogue? This cannot be undone.`
            : `Remove "${pendingDelete?.course?.title || "this course"}" from your catalogue? This cannot be undone.`
        }
        tone="danger"
        confirmLabel="Delete"
        busyLabel={
          pendingDelete?.mode === "bulk"
            ? "Deleting courses..."
            : "Deleting course..."
        }
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => setPendingDelete(null)}
      />

      <AppDialog
        open={Boolean(feedback)}
        title={feedback?.title || ""}
        message={feedback?.message || ""}
        tone={feedback?.tone}
        onClose={() => setFeedback(null)}
      />
    </div>
  );
};

export default TutorSection;
