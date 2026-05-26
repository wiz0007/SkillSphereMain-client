import { FaGithub, FaGoogle, FaLinkedinIn } from "react-icons/fa6";
import { getSocialAuthStartUrl } from "../../services/auth.service";
import styles from "./SocialAuthButtons.module.scss";

const providers = [
  {
    id: "google" as const,
    label: "Continue with Google",
    icon: <FaGoogle aria-hidden="true" />,
  },
  {
    id: "linkedin" as const,
    label: "Continue with LinkedIn",
    icon: <FaLinkedinIn aria-hidden="true" />,
  },
  {
    id: "github" as const,
    label: "Continue with GitHub",
    icon: <FaGithub aria-hidden="true" />,
  },
];

type Props = {
  compact?: boolean;
};

const SocialAuthButtons = ({ compact = false }: Props) => {
  const handleSocialLogin = (provider: (typeof providers)[number]["id"]) => {
    window.location.assign(getSocialAuthStartUrl(provider));
  };

  return (
    <div className={`${styles.block} ${compact ? styles.blockCompact : ""}`}>
      <div className={styles.divider} aria-hidden="true">
        <span>{compact ? "or sign in with" : "or continue with"}</span>
      </div>

      <div className={`${styles.grid} ${compact ? styles.gridCompact : ""}`}>
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            className={`${styles.button} ${compact ? styles.buttonCompact : ""}`}
            onClick={() => handleSocialLogin(provider.id)}
          >
            <span className={styles.icon}>{provider.icon}</span>
            <span>{compact ? provider.label.replace("Continue with ", "") : provider.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SocialAuthButtons;
