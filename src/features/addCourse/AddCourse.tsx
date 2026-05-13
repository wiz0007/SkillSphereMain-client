import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  IndianRupee,
  Layers3,
  Save,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import styles from "./AddCourse.module.scss";

import {
  createCourse,
  updateCourse,
} from "../../services/courses.service";

type FormState = {
  title: string;
  description: string;
  type: "live" | "recorded";
  category: string;
  level: string;
  skills: string;
  price: string;
  duration: string;
  contentDriveLink: string;
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
  "contentDriveLink",
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
  contentDriveLink: "Google Drive link",
};

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
    description: "Clarify level, duration, and the skills each session actually covers.",
    fields: ["level", "duration", "skills"] as FormField[],
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
      type: state?.type === "recorded" ? "recorded" : "live",
      category: state?.category || "",
      level: state?.level || "Beginner",
      skills: state?.skills?.join(", ") || "",
      price: state?.price ? String(state.price) : "",
      duration: state?.duration || "",
      contentDriveLink: state?.contentDriveLink || "",
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
        return value === "live" || value === "recorded"
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
        if (!value.trim()) return "Set a price per hour.";
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
        return value.trim() ? "" : "Add a session duration.";
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
      const shouldLeave = window.confirm(
        "You have unsaved course changes. Leave this form anyway?"
      );

      if (!shouldLeave) {
        return;
      }
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
      contentDriveLink: isRecordedCourse ? form.contentDriveLink.trim() : "",
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
            are booking.
          </p>
        </div>

        <div className={styles.snapshot}>
          <span className={styles.snapshotLabel}>Preview state</span>
          <strong>{form.title || "Untitled course"}</strong>
          <span className={styles.snapshotHint}>
            {isRecordedCourse ? "Recorded course" : "Live session"} |{" "}
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
                    </select>
                    {visibleErrors.type ? (
                      <small className={styles.errorText}>
                        {visibleErrors.type}
                      </small>
                    ) : (
                      <small className={styles.helperText}>
                        Live courses are booked by time. Recorded courses unlock after payment and your approval.
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
                    <span>Session duration</span>
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
                          : "Use a simple format like 60 min, 90 min, or 2 hr."}
                      </small>
                    )}
                  </label>

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
                    className={`${styles.field} ${
                      visibleErrors.price ? styles.fieldInvalid : ""
                    }`}
                  >
                    <span>{isRecordedCourse ? "Unlock price" : "Price per hour"}</span>
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
                      Learners will be charged in SkillCoin based on the live session duration they choose.
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
                {isRecordedCourse ? "Recorded" : form.level || "Level"}
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
                  {isRecordedCourse ? " SC unlock" : "/hr"}
                </span>
              </div>
              <div className={styles.metric}>
                <Clock3 size={15} />
                <span>{form.duration || "Flexible"}</span>
              </div>
              <div className={styles.metric}>
                <Layers3 size={15} />
                <span>{form.level || "All levels"}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default AddCourse;
