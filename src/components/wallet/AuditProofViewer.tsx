import { CheckCircle2, Clock3, ExternalLink, ShieldAlert } from "lucide-react";
import type { WalletProof } from "../../services/auth.service";
import { getExplorerUrl } from "../navbar/walletHelpers";
import styles from "./AuditProofViewer.module.scss";

type Props = {
  proof: WalletProof;
};

const shortenHash = (value?: string | null) => {
  if (!value) {
    return "Not available";
  }

  if (value.length <= 22) {
    return value;
  }

  return `${value.slice(0, 12)}...${value.slice(-10)}`;
};

const parseCanonicalPayload = (payload: string) => {
  try {
    return JSON.stringify(JSON.parse(payload), null, 2);
  } catch {
    return payload;
  }
};

const getStatusCopy = (proof: WalletProof) => {
  if (proof.auditStatus === "anchored") {
    return {
      icon: CheckCircle2,
      label: "Verified anchor",
      detail:
        "This transaction hash is included in an anchored batch and can be compared against the blockchain root.",
      tone: styles.verified,
    };
  }

  if (proof.auditStatus === "failed") {
    return {
      icon: ShieldAlert,
      label: "Anchor failed",
      detail:
        "The local hash chain exists, but the latest anchoring attempt did not complete successfully.",
      tone: styles.failed,
    };
  }

  return {
    icon: Clock3,
    label: "Pending anchor",
    detail:
      "The transaction has a local tamper-evident hash and is waiting for the next anchor batch.",
    tone: styles.pending,
  };
};

const AuditProofViewer = ({ proof }: Props) => {
  const status = getStatusCopy(proof);
  const StatusIcon = status.icon;
  const explorerUrl = getExplorerUrl(
    proof.anchor?.chainTxHash || null,
    proof.anchor?.network || null
  );

  return (
    <div className={styles.viewer}>
      <section className={`${styles.statusPanel} ${status.tone}`}>
        <div className={styles.statusIcon}>
          <StatusIcon size={22} />
        </div>
        <div>
          <span>Audit status</span>
          <strong>{status.label}</strong>
          <p>{status.detail}</p>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.proofCard}>
          <span>Transaction hash</span>
          <strong title={proof.hash}>{shortenHash(proof.hash)}</strong>
          <p>The hash generated from this wallet transaction payload.</p>
        </div>

        <div className={styles.proofCard}>
          <span>Previous hash</span>
          <strong title={proof.previousHash || "Genesis"}>
            {proof.previousHash ? shortenHash(proof.previousHash) : "Genesis"}
          </strong>
          <p>Links this record to the user wallet history chain.</p>
        </div>

        <div className={styles.proofCard}>
          <span>Anchor batch</span>
          <strong>{proof.anchor?.batchId || "Not batched"}</strong>
          <p>Batch identifier used when multiple transaction hashes are anchored together.</p>
        </div>

        <div className={styles.proofCard}>
          <span>Root hash</span>
          <strong title={proof.anchor?.rootHash || ""}>
            {shortenHash(proof.anchor?.rootHash)}
          </strong>
          <p>Merkle root committed on-chain for the anchored batch.</p>
        </div>
      </section>

      <section className={styles.chainPanel}>
        <div>
          <span>Blockchain proof</span>
          <strong>
            {proof.anchor?.chainName || "Local audit"}{" "}
            {proof.anchor?.network ? `(${proof.anchor.network})` : ""}
          </strong>
          <p>
            {proof.anchor?.anchoredAt
              ? `Anchored on ${new Date(proof.anchor.anchoredAt).toLocaleString()}`
              : "No confirmed chain transaction is attached yet."}
          </p>
        </div>
        {explorerUrl ? (
          <a href={explorerUrl} target="_blank" rel="noreferrer">
            Open explorer <ExternalLink size={15} />
          </a>
        ) : null}
      </section>

      <section className={styles.proofPath}>
        <div className={styles.sectionHeader}>
          <div>
            <span>Merkle proof path</span>
            <strong>{proof.proof.proofPath.length} proof nodes</strong>
          </div>
          <small>{proof.proof.verificationType}</small>
        </div>
        {proof.proof.proofPath.length ? (
          <ol>
            {proof.proof.proofPath.map((node, index) => (
              <li key={`${node}-${index}`} title={node}>
                <span>Node {index + 1}</span>
                <code>{shortenHash(node)}</code>
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.emptyProof}>
            Proof nodes appear after this transaction is included in an anchor batch.
          </p>
        )}
      </section>

      <section className={styles.payloadPanel}>
        <div className={styles.sectionHeader}>
          <div>
            <span>Canonical payload</span>
            <strong>Auditor-readable source data</strong>
          </div>
        </div>
        <pre>{parseCanonicalPayload(proof.canonicalPayload)}</pre>
      </section>
    </div>
  );
};

export default AuditProofViewer;
