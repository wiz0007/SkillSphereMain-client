import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  IndianRupee,
  Layers3,
  CalendarRange,
  Save,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AppDialog from "../../components/ui/AppDialog";

import styles from "./AddCourse.module.scss";

import {
  createCourse,
  updateCourse,
} from "../../services/courses.service";

type FormState = {
  title: string;
  description: string;
  type: "live" | "recorded" | "tuition";
  category: string;
  level: string;
  skills: string;
  price: string;
  duration: string;
  demoVideoUrl: string;
  contentDriveLink: string;
  tuitionStartTime: string;
  tuitionDays: string;
  tuitionWeeks: string;
};

type FormField = keyof FormState;

const fieldOrder: FormField[] = [
  "title",
  "type",
  "category",
  "description",
  "level",
  "duration",
  "skills",
  "price",
  "demoVideoUrl",
  "contentDriveLink",
  "tuitionStartTime",
  "tuitionDays",
  "tuitionWeeks",
];

const fieldLabels: Record<FormField, string> = {
  title: "Course title",
  description: "Description",
  type: "Course type",
  category: "Category",
  level: "Level",
  skills: "Skills",
  price: "Price",
  duration: "Duration",
  demoVideoUrl: "Demo video link",
  contentDriveLink: "Google Drive link",
  tuitionStartTime: "Tuition start time",
  tuitionDays: "Tuition days",
  tuitionWeeks: "Weeks of month",
};

const tuitionDayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const tuitionWeekOptions = [
  { value: "1", label: "Week 1" },
  { value: "2", label: "Week 2" },
  { value: "3", label: "Week 3" },
  { value: "4", label: "Week 4" },
  { value: "5", label: "Week 5" },
] as const;

const sectionDefinitions = [
  {
    id: "basics",
    label: "Basics",
    title: "Course basics",
    description: "Start with the information learners use to understand the offer.",
    fields: ["title", "type", "category", "description"] as FormField[],
  },
  {
    id: "teaching",
    label: "Teaching",
    title: "Teaching details",
    description: "Clarify level, duration, schedule, and the skills each class actually covers.",
    fields: [
      "level",
      "duration",
      "tuitionStartTime",
      "tuitionDays",
      "tuitionWeeks",
      "skills",
    ] as FormField[],
  },
  {
    id: "pricing",
    label: "Pricing",
    title: "Pricing & delivery",
    description: "Finish with the amount learners will pay and, for recorded courses, where the content will be unlocked from.",
    fields: ["price", "contentDriveLink"] as FormField[],
  },
] as const;

const AddCourse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const { id } = useParams();

  const initialForm = useMemo<FormState>(
    () => ({
      title: state?.title || "",
      description: state?.description || "",
      type:
        state?.type === "recorded"
          ? "recorded"
          : state?.type === "tuition"
            ? "tuition"
            : "live",
      category: state?.category || "",
      level: state?.level || "Beginner",
      skills: state?.skills?.join(", ") || "",
      price: state?.price ? String(state.price) : "",
      duration: state?.duration || "",
      demoVideoUrl: state?.demoVideoUrl || "",
      contentDriveLink: state?.contentDriveLink || "",
      tuitionStartTime: state?.tuitionSchedule?.startTime || "",
      tuitionDays: state?.tuitionSchedule?.days?.join(", ") || "",
      tuitionWeeks:
        state?.tuitionSchedule?.weeks?.map(String)?.join(", ") || "",
    }),
    [state]
  );

  const [form, setForm] = useState<FormState>(initialForm);
  const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>(
    {}
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const fieldRefs = useRef<
    Partial<
      Record<
        FormField,
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
      >
    >
  >({});
  const sectionRefs = useRef<
    Partial<Record<(typeof sectionDefinitions)[number]["id"], HTMLElement | null>>
  >({});

  const setFieldRef =
    (field: FormField) =>
    (
      element:
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement
        | null
    ) => {
      fieldRefs.current[field] = element;
    };

  const setSectionRef =
    (sectionId: (typeof sectionDefinitions)[number]["id"]) =>
    (element: HTMLElement | null) => {
      sectionRefs.current[sectionId] = element;
    };

  const normalizeSkills = (value: string) =>
    value
      .split(",")
      .map((item: string) => item.trim())
      .filter(Boolean);

  const parseSelectionList = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const toggleSelection = (field: "tuitionDays" | "tuitionWeeks", value: string) => {
    setForm((current) => {
      const currentValues = parseSelectionList(current[field]);
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return {
        ...current,
        [field]: nextValues.join(", "),
      };
    });

    setTouched((current) => ({ ...current, [field]: true }));
    setServerError("");
  };

  const validateField = (field: FormField, value: string) => {
    switch (field) {
      case "title":
        if (!value.trim()) return "Add a course title.";
        if (value.trim().length < 3) {
          return "Course title must be at least 3 characters.";
        }
        return "";
      case "description":
        if (!value.trim()) return "Add a short course description.";
        if (value.trim().length < 10) {
          return "Description must be at least 10 characters.";
        }
        return "";
      case "type":
        return value === "live" || value === "recorded" || value === "tuition"
          ? ""
          : "Choose how learners access this course.";
      case "category":
        return value.trim() ? "" : "Select a category.";
      case "level":
        return ["Beginner", "Intermediate", "Advanced"].includes(value)
          ? ""
          : "Choose a valid level.";
      case "skills":
        return normalizeSkills(value).length
          ? ""
          : "Add at least one skill, separated by commas if needed.";
      case "price": {
        if (!value.trim()) {
          return form.type === "tuition"
            ? "Set a monthly tuition fee."
            : "Set a price per hour.";
        }
        const numericPrice = Number(value);
        if (Number.isNaN(numericPrice)) {
          return "Price must be a valid number.";
        }
        if (numericPrice <= 0) {
          return "Price must be greater than 0.";
        }
        return "";
      }
      case "duration":
        return value.trim()
          ? ""
          : form.type === "tuition"
            ? "Add the duration of each tuition class."
            : "Add a session duration.";
      case "demoVideoUrl":
        if (!value.trim()) {
          return "";
        }
        try {
          const url = new URL(value.trim());
          const hostname = url.hostname.toLowerCase();
          const isAllowedHost = [
            "youtube.com",
            "www.youtube.com",
            "youtu.be",
            "drive.google.com",
            "www.drive.google.com",
            "res.cloudinary.com",
          ].includes(hostname);

          return isAllowedHost
            ? ""
            : "Use a YouTube, Google Drive, or Cloudinary demo video link.";
        } catch {
          return "Use a valid video URL for the course demo.";
        }
      case "contentDriveLink":
        if (form.type !== "recorded") {
          return "";
        }
        if (!value.trim()) {
          return "Add the Google Drive link tutors will unlock after approval.";
        }
        try {
          const url = new URL(value.trim());
          const isDriveLink = /drive\.google\.com$/i.test(url.hostname);
          return isDriveLink
            ? ""
            : "Use a valid Google Drive link for recorded content.";
        } catch {
          return "Use a valid Google Drive link for recorded content.";
        }
      case "tuitionStartTime":
        if (form.type !== "tuition") {
          return "";
        }
        return value.trim()
          ? ""
          : "Choose when the recurring tuition starts each day.";
      case "tuitionDays":
        if (form.type !== "tuition") {
          return "";
        }
        return parseSelectionList(value).length
          ? ""
          : "Select at least one teaching day.";
      case "tuitionWeeks":
        if (form.type !== "tuition") {
          return "";
        }
        return parseSelectionList(value).length
          ? ""
          : "Select the weeks of the month this tuition repeats.";
      default:
        return "";
    }
  };

  const validationErrors = useMemo(
    () =>
      fieldOrder.reduce(
        (accumulator, field) => {
          accumulator[field] = validateField(field, form[field]);
          return accumulator;
        },
        {} as Record<FormField, string>
      ),
    [form]
  );

  const visibleErrors = fieldOrder.reduce(
    (accumulator, field) => {
      accumulator[field] =
        touched[field] || submitAttempted ? validationErrors[field] : "";
      return accumulator;
    },
    {} as Record<FormField, string>
  );

  const sectionErrorCounts = sectionDefinitions.reduce(
    (accumulator, section) => {
      accumulator[section.id] = section.fields.filter(
        (field) => validationErrors[field]
      ).length;
      return accumulator;
    },
    {} as Record<(typeof sectionDefinitions)[number]["id"], number>
  );

  const totalErrors = fieldOrder.filter((field) => validationErrors[field]).length;
  const hasValidationErrors = totalErrors > 0;

  const previewSkills = normalizeSkills(form.skills).slice(0, 4);
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const isRecordedCourse = form.type === "recorded";
  const isTuitionCourse = form.type === "tuition";
  const selectedTuitionDays = parseSelectionList(form.tuitionDays);
  const selectedTuitionWeeks = parseSelectionList(form.tuitionWeeks);
  const tuitionSchedulePreview = isTuitionCourse
    ? `${
        selectedTuitionDays.length
          ? selectedTuitionDays.join(", ")
          : "Choose tuition days"
      }${
        form.tuitionStartTime ? ` at ${form.tuitionStartTime}` : ""
      }`
    : "";

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || saving) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, saving]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setServerError("");
  };

  const handleBlur = (
    event: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const field = event.target.name as FormField;
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const scrollToField = (field: FormField) => {
    const element = fieldRefs.current[field];
    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    window.setTimeout(() => element.focus(), 120);
  };

  const scrollToSection = (
    sectionId: (typeof sectionDefinitions)[number]["id"]
  ) => {
    const element = sectionRefs.current[sectionId];
    element?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleBack = () => {
    if (isDirty && !saving) {
      setShowLeaveDialog(true);
      return;
    }

    navigate("/dashboard");
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    setTouched(
      fieldOrder.reduce(
        (accumulator, field) => {
          accumulator[field] = true;
          return accumulator;
        },
        {} as Record<FormField, boolean>
      )
    );
    setServerError("");

    if (hasValidationErrors) {
      const firstInvalidField = fieldOrder.find(
        (field) => validationErrors[field]
      );
      if (firstInvalidField) {
        scrollToField(firstInvalidField);
      }
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      skills: normalizeSkills(form.skills),
      demoVideoUrl: form.demoVideoUrl.trim(),
      contentDriveLink: isRecordedCourse ? form.contentDriveLink.trim() : "",
      tuitionSchedule: isTuitionCourse
        ? {
            days: selectedTuitionDays,
            weeks: selectedTuitionWeeks.map(Number),
            startTime: form.tuitionStartTime.trim(),
          }
        : undefined,
    };

    try {
      setSaving(true);

      if (id) {
        await updateCourse(id, payload);
      } else {
        await createCourse(payload);
      }

      navigate("/dashboard");
    } catch (error: any) {
      const message =
        error?.message || "We could not save the course right now.";
      setServerError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.layout}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>
            {id ? "Edit Course" : "New Course"}
          </span>
          <h1>
            {id
              ? "Refresh the details and keep your course current."
              : "Create a course that feels ready to publish."}
          </h1>
           <p>
            Use the same dashboard language across title, price,
            duration, and scope so students know exactly what they
            are booking or unlocking.
           </p>
        </div>

        <div className={styles.snapshot}>
          <span className={styles.snapshotLabel}>Preview state</span>
          <strong>{form.title || "Untitled course"}</strong>
          <span className={styles.snapshotHint}>
            {isRecordedCourse
              ? "Recorded course"
              : isTuitionCourse
                ? "Recurring tuition"
                : "Live session"}{" "}
            |{" "}
            {form.category || "Category pending"} | {form.level || "Level pending"}
          </span>
        </div>
      </div>

      <div className={styles.sectionNav}>
        {sectionDefinitions.map((section) => (
          <button
            key={section.id}
            type="button"
            className={styles.sectionNavButton}
            onClick={() => scrollToSection(section.id)}
          >
            <span>{section.label}</span>
            {sectionErrorCounts[section.id] ? (
              <span className={styles.sectionNavCount}>
                {sectionErrorCounts[section.id]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {(submitAttempted && hasValidationErrors) || serverError ? (
        <div className={styles.summary} role="alert">
          <div className={styles.summaryHeader}>
            <AlertTriangle size={18} />
            <div>
              <strong>
                {serverError
                  ? "We could not save this course yet."
                  : `Please fix ${totalErrors} field${totalErrors > 1 ? "s" : ""} before continuing.`}
              </strong>
              <p>
                {serverError ||
                  "Jump straight to each field below and finish the missing details."}
              </p>
            </div>
          </div>

          {submitAttempted && hasValidationErrors ? (
            <div className={styles.summaryList}>
              {fieldOrder
                .filter((field) => validationErrors[field])
                .map((field) => (
                  <button
                    key={field}
                    type="button"
                    className={styles.summaryItem}
                    onClick={() => scrollToField(field)}
                  >
                    <span>{fieldLabels[field]}</span>
                    <small>{validationErrors[field]}</small>
                  </button>
                ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={styles.container}>
        <div className={styles.formSection}>
          {sectionDefinitions.map((section) => (
            <section
              key={section.id}
              className={styles.formBlock}
              ref={setSectionRef(section.id)}
            >
              <div className={styles.sectionHeader}>
                <h2>{section.title}</h2>
                <p>{section.description}</p>
              </div>

              {section.id === "basics" ? (
                <div className={styles.fieldGrid}>
                  <label
                    className={`${styles.field} ${
                      visibleErrors.title ? styles.fieldInvalid : ""
                    }`}
                  >
                    <span>Course title</span>
                    <input
                      ref={setFieldRef("title")}
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="For example: React interview prep"
                    />
                    {visibleErrors.title ? (
                      <small className={styles.errorText}>
                        {visibleErrors.title}
                      </small>
                    ) : (
                      <small className={styles.helperText}>
                        Keep it short and outcome-focused so students know what they will book.
                      </small>
                    )}
                  </label>

                  <label
                    className={`${styles.field} ${
                      visibleErrors.type ? styles.fieldInvalid : ""
                    }`}
                  >
                    <span>Course type</span>
                    <select
                      ref={setFieldRef("type")}
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <option value="live">Live 1-on-1 sessions</option>
                      <option value="recorded">Recorded video course</option>
                      <option value="tuition">Recurring tuition schedule</option>
                    </select>
                    {visibleErrors.type ? (
                      <small className={styles.errorText}>
                        {visibleErrors.type}
                      </small>
                    ) : (
                        <small className={styles.helperText}>
                        Live courses are booked by time. Recorded courses unlock after payment and your approval. Tuition courses publish a repeating weekly timetable for the month.
                        </small>
                    )}
                  </label>

                  <label
                    className={`${styles.field} ${
                      visibleErrors.category ? styles.fieldInvalid : ""
                    }`}
                  >
                    <span>Category</span>
                    <select
                      ref={setFieldRef("category")}
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <option value="">Select a category</option>
                      <option value="Programming">Programming</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sports">Sports</option>
                    </select>
                    {visibleErrors.category ? (
                      <small className={styles.errorText}>
                        {visibleErrors.category}
                      </small>
                    ) : (
                      <small className={styles.helperText}>
                        Categories help learners discover your course faster.
                      </small>
                    )}
                  </label>

                  <label
                    className={`${styles.field} ${styles.fieldWide} ${
                      visibleErrors.description ? styles.fieldInvalid : ""
                    }`}
                  >
                    <span>Description</span>
                    <textarea
                      ref={setFieldRef("description")}
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Describe outcomes, approach, and who this course is for."
                    />
                    {visibleErrors.description ? (
                      <small className={styles.errorText}>
                        {visibleErrors.description}
                      </small>
                    ) : (
                      <small className={styles.helperText}>
                        Explain what learners will leave with, not just what you will cover.
                      </small>
                    )}
                  </label>
                </div>
              ) : null}

              {section.id === "teaching" ? (
                <div className={styles.fieldGrid}>
                  <label
                    className={`${styles.field} ${
                      visibleErrors.level ? styles.fieldInvalid : ""
                    }`}
                  >
                    <span>Level</span>
                    <select
                      ref={setFieldRef("level")}
                      name="level"
                      value={form.level}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    {visibleErrors.level ? (
                      <small className={styles.errorText}>
                        {visibleErrors.level}
                      </small>
                    ) : (
                      <small className={styles.helperText}>
                        Match this to the learner you want most.
                      </small>
                    )}
                  </label>

                  <label
                    className={`${styles.field} ${
                      visibleErrors.duration ? styles.fieldInvalid : ""
                    }`}
                  >
                    <span>{isTuitionCourse ? "Class duration" : "Session duration"}</span>
                    <input
                      ref={setFieldRef("duration")}
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="60 min"
                    />
                    {visibleErrors.duration ? (
                      <small className={styles.errorText}>
                        {visibleErrors.duration}
                      </small>
                    ) : (
                      <small className={styles.helperText}>
                        {isRecordedCourse
                          ? "Use the total watch time, like 2 hr or 6 hr 30 min."
                          : isTuitionCourse
                            ? "Use a clear format like 60 min, 90 min, or 2 hr per class."
                          : "Use a simple format like 60 min, 90 min, or 2 hr."}
                      </small>
                    )}
                  </label>

                  {isTuitionCourse ? (
                    <>
                      <label
                        className={`${styles.field} ${
                          visibleErrors.tuitionStartTime ? styles.fieldInvalid : ""
                        }`}
                      >
                        <span>Recurring start time</span>
                        <input
                          ref={setFieldRef("tuitionStartTime")}
                          name="tuitionStartTime"
                          type="time"
                          value={form.tuitionStartTime}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        {visibleErrors.tuitionStartTime ? (
                          <small className={styles.errorText}>
                            {visibleErrors.tuitionStartTime}
                          </small>
                        ) : (
                          <small className={styles.helperText}>
                            Choose the daily start time learners should expect for each tuition class.
                          </small>
                        )}
                      </label>

                      <div
                        className={`${styles.field} ${styles.fieldWide} ${
                          visibleErrors.tuitionDays ? styles.fieldInvalid : ""
                        }`}
                      >
                        <span>Teaching days</span>
                        <input
                          ref={setFieldRef("tuitionDays")}
                          name="tuitionDays"
                          value={form.tuitionDays}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={styles.hiddenField}
                          tabIndex={-1}
                          aria-hidden="true"
                        />
                        <div className={styles.optionChips}>
                          {tuitionDayOptions.map((day) => {
                            const active = selectedTuitionDays.includes(day);

                            return (
                              <button
                                key={day}
                                type="button"
                                className={`${styles.optionChip} ${
                                  active ? styles.optionChipActive : ""
                                }`}
                                onClick={() => toggleSelection("tuitionDays", day)}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                        {visibleErrors.tuitionDays ? (
                          <small className={styles.errorText}>
                            {visibleErrors.tuitionDays}
                          </small>
                        ) : (
                          <small className={styles.helperText}>
                            Pick every day this tuition repeats during a selected week.
                          </small>
                        )}
                      </div>

                      <div
                        className={`${styles.field} ${styles.fieldWide} ${
                          visibleErrors.tuitionWeeks ? styles.fieldInvalid : ""
                        }`}
                      >
                        <span>Weeks of the month</span>
                        <input
                          ref={setFieldRef("tuitionWeeks")}
                          name="tuitionWeeks"
                          value={form.tuitionWeeks}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={styles.hiddenField}
                          tabIndex={-1}
                          aria-hidden="true"
                        />
                        <div className={styles.optionChips}>
                          {tuitionWeekOptions.map((week) => {
                            const active = selectedTuitionWeeks.includes(week.value);

                            return (
                              <button
                                key={week.value}
                                type="button"
                                className={`${styles.optionChip} ${
                                  active ? styles.optionChipActive : ""
                                }`}
                                onClick={() =>
                                  toggleSelection("tuitionWeeks", week.value)
                                }
                              >
                                {week.label}
                              </button>
                            );
                          })}
                        </div>
                        {visibleErrors.tuitionWeeks ? (
                          <small className={styles.errorText}>
                            {visibleErrors.tuitionWeeks}
                          </small>
                        ) : (
                          <small className={styles.helperText}>
                            Choose the weeks when the tuition runs in a typical month.
                          </small>
                        )}
                      </div>
                    </>
                  ) : null}

                  <label
                    className={`${styles.field} ${styles.fieldWide} ${
                      visibleErrors.skills ? styles.fieldInvalid : ""
                    }`}
                  >
                    <span>Skills</span>
                    <input
                      ref={setFieldRef("skills")}
                      name="skills"
                      value={form.skills}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="React, JavaScript, Interview prep"
                    />
                    {visibleErrors.skills ? (
                      <small className={styles.errorText}>
                        {visibleErrors.skills}
                      </small>
                    ) : (
                      <small className={styles.helperText}>
                        Separate multiple skills with commas so they turn into clear tags.
                      </small>
                    )}
                  </label>
                </div>
              ) : null}

              {section.id === "pricing" ? (
                <div className={styles.fieldGrid}>
                  <label
                    className={`${styles.field} ${styles.fieldWide} ${
                      visibleErrors.demoVideoUrl ? styles.fieldInvalid : ""
                    }`}
                  >
                    <span>Demo video link</span>
                    <input
                      ref={setFieldRef("demoVideoUrl")}
                      name="demoVideoUrl"
                      value={form.demoVideoUrl}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="https://youtu.be/... or https://drive.google.com/..."
                    />
                    {visibleErrors.demoVideoUrl ? (
                      <small className={styles.errorText}>
                        {visibleErrors.demoVideoUrl}
                      </small>
                    ) : (
                      <small className={styles.helperText}>
                        Optional. Add a short teaching preview from YouTube, Google Drive, or Cloudinary so learners can watch your style before booking.
                      </small>
                    )}
                  </label>

                  <label
                    className={`${styles.field} ${
                      visibleErrors.price ? styles.fieldInvalid : ""
                    }`}
                  >
                    <span>
                      {isRecordedCourse
                        ? "Unlock price"
                        : isTuitionCourse
                          ? "Monthly tuition fee"
                          : "Price per hour"}
                    </span>
                    <input
                      ref={setFieldRef("price")}
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="1200"
                      min="1"
                    />
                    {visibleErrors.price ? (
                      <small className={styles.errorText}>
                        {visibleErrors.price}
                      </small>
                    ) : (
                      <small className={styles.helperText}>
                        {isRecordedCourse
                          ? "Set the one-time SkillCoin price required before the tutor can unlock the content."
                          : isTuitionCourse
                            ? "Set the monthly tuition fee learners should expect for this recurring plan."
                          : "Set a positive hourly price so learners see a real booking amount."}
                      </small>
                    )}
                  </label>

                  {isRecordedCourse ? (
                    <label
                      className={`${styles.field} ${styles.fieldWide} ${
                        visibleErrors.contentDriveLink
                          ? styles.fieldInvalid
                          : ""
                      }`}
                    >
                      <span>Google Drive content link</span>
                      <input
                        ref={setFieldRef("contentDriveLink")}
                        name="contentDriveLink"
                        value={form.contentDriveLink}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="https://drive.google.com/..."
                      />
                      {visibleErrors.contentDriveLink ? (
                        <small className={styles.errorText}>
                          {visibleErrors.contentDriveLink}
                        </small>
                      ) : (
                        <small className={styles.helperText}>
                          This link stays hidden until payment is locked and the tutor approves the unlock request.
                        </small>
                      )}
                    </label>
                  ) : (
                    <small className={styles.helperText}>
                      Set a positive hourly price so learners see a real booking amount.
                    </small>
                  )}
                  {!isRecordedCourse ? (
                    <small className={styles.helperText}>
                      {isTuitionCourse
                        ? "Show the recurring monthly amount clearly so learners can compare it against the published timetable."
                        : "Learners will be charged in SkillCoin based on the live session duration they choose."}
                    </small>
                  ) : null}
                </div>
              ) : null}
            </section>
          ))}

          <div className={styles.actionBar}>
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={handleBack}
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </button>

            <button
              type="button"
              className={styles.submit}
              onClick={handleSubmit}
              disabled={saving}
            >
              <Save size={16} />
              {saving
                ? "Saving..."
                : id
                  ? "Update course"
                  : "Publish course"}
            </button>
          </div>
        </div>

        <aside className={styles.preview}>
          <div className={styles.sectionHeader}>
            <h2>Live preview</h2>
            <p>
              This mirrors the dashboard-style course cards students
              will see.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.previewTop}>
              <span className={styles.category}>
                {form.category || "Category"}
              </span>
              <span className={styles.levelPill}>
                {isRecordedCourse
                  ? "Recorded"
                  : isTuitionCourse
                    ? "Tuition"
                    : form.level || "Level"}
              </span>
            </div>

            <h3>{form.title || "Course title"}</h3>
            <p>
              {form.description ||
                "Course description will appear here as you type."}
            </p>

            <div className={styles.skills}>
              {previewSkills.length
                ? previewSkills.map((skill: string, index: number) => (
                    <span key={`${skill}-${index}`}>{skill}</span>
                  ))
                : null}
            </div>

            <div className={styles.metrics}>
                <div className={styles.metric}>
                  <IndianRupee size={15} />
                  <span>
                    {form.price || 0}
                    {isRecordedCourse
                      ? " SC unlock"
                      : isTuitionCourse
                        ? "/month"
                        : "/hr"}
                  </span>
                </div>
                <div className={styles.metric}>
                  <Clock3 size={15} />
                  <span>
                    {isTuitionCourse
                      ? tuitionSchedulePreview || "Recurring timetable"
                      : form.duration || "Flexible"}
                  </span>
                </div>
                <div className={styles.metric}>
                  {isTuitionCourse ? <CalendarRange size={15} /> : <Layers3 size={15} />}
                  <span>
                    {isTuitionCourse
                      ? selectedTuitionWeeks.length
                        ? `Weeks ${selectedTuitionWeeks.join(", ")}`
                        : "Month schedule"
                      : form.level || "All levels"}
                  </span>
                </div>
            </div>

            {form.demoVideoUrl.trim() ? (
              <div className={styles.skills}>
                <span>Demo video ready</span>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      <AppDialog
        open={showLeaveDialog}
        kicker="Unsaved changes"
        title="Leave without saving?"
        message="You have unsaved course edits. If you leave now, those changes will be lost."
        tone="warning"
        confirmLabel="Leave page"
        onConfirm={() => navigate("/dashboard")}
        onClose={() => setShowLeaveDialog(false)}
      />
    </section>
  );
};

export default AddCourse;
