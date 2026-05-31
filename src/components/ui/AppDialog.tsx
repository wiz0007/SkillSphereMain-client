import type { ReactNode } from "react";
import styles from "./AppDialog.module.scss";

type AppDialogTone = "default" | "success" | "warning" | "danger";
type AppDialogSize = "default" | "wide";

interface AppDialogProps {
  open: boolean;
  title: string;
  message?: string;
  kicker?: string;
  tone?: AppDialogTone;
  confirmLabel?: string;
  cancelLabel?: string;
  busyLabel?: string;
  busy?: boolean;
  size?: AppDialogSize;
  onConfirm?: () => void;
  onClose: () => void;
  children?: ReactNode;
}

const AppDialog = ({
  open,
  title,
  message,
  kicker,
  tone = "default",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  busyLabel,
  busy = false,
  size = "default",
  onConfirm,
  onClose,
  children,
}: AppDialogProps) => {
  if (!open) {
    return null;
  }

  const singleAction = !onConfirm;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={`${styles.card} ${styles[tone]} ${styles[size]}`}>
        {kicker ? <span className={styles.kicker}>{kicker}</span> : null}
        <h2>{title}</h2>
        {message ? <p>{message}</p> : null}
        {children ? <div className={styles.content}>{children}</div> : null}

        <div className={styles.actions}>
          {!singleAction ? (
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={onClose}
              disabled={busy}
            >
              {cancelLabel}
            </button>
          ) : null}

          <button
            type="button"
            className={tone === "danger" ? styles.dangerAction : styles.primaryAction}
            onClick={singleAction ? onClose : onConfirm}
            disabled={busy}
          >
            {busy ? busyLabel || "Working..." : singleAction ? "Close" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppDialog;
