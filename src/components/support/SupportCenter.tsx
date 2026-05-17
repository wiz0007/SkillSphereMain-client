import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BadgeCheck,
  LifeBuoy,
  MailPlus,
  Search,
  Send,
} from "lucide-react";
import { socket } from "../../utils/socket";
import { useAuth } from "../../context/AuthContext";
import {
  createSupportConversation,
  getSupportBootstrap,
  getSupportMessages,
  sendSupportMessage,
  updateSupportConversationStatus,
  type SupportBootstrap,
  type SupportConversation,
  type SupportMessage,
} from "../../services/support.service";
import styles from "./SupportCenter.module.scss";

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

const getParticipantName = (conversation: SupportConversation) =>
  conversation.requester.fullName ||
  conversation.requester.username ||
  "User";

const isVerifiedParticipant = (participant: SupportConversation["requester"]) =>
  !!participant.isAdmin ||
  ["identity", "tutor"].includes(participant.verifiedBadgeLevel || "none");

const SupportCenter = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [bootstrap, setBootstrap] = useState<SupportBootstrap | null>(
    null
  );
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [draftAttachment, setDraftAttachment] = useState<File | null>(null);
  const [topic, setTopic] = useState(
    searchParams.get("topic") || "Other"
  );
  const [subject, setSubject] = useState(
    searchParams.get("subject") || ""
  );
  const [openingMessage, setOpeningMessage] = useState("");
  const [openingAttachment, setOpeningAttachment] = useState<File | null>(null);
  const [createError, setCreateError] = useState("");
  const [createAttempted, setCreateAttempted] = useState(false);

  const selectedConversationId =
    searchParams.get("conversationId") || "";

  const refreshBootstrap = async () => {
    const next = await getSupportBootstrap();
    setBootstrap(next);
    return next;
  };

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        await refreshBootstrap();
      } catch (error) {
        console.error("Failed to load support center:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
    socket.emit("register", user._id);
  }, [user?._id]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    const loadThread = async () => {
      try {
        setThreadLoading(true);
        const nextMessages = await getSupportMessages(
          selectedConversationId
        );
        setMessages(nextMessages);
        await refreshBootstrap();
      } catch (error) {
        console.error("Failed to load support thread:", error);
      } finally {
        setThreadLoading(false);
      }
    };

    void loadThread();
  }, [selectedConversationId]);

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    const handler = (incoming: {
      conversation: SupportConversation;
      message: SupportMessage;
    }) => {
      setBootstrap((previous) => {
        if (!previous) {
          return previous;
        }

        const existingConversation = previous.conversations.find(
          (conversation) =>
            conversation._id === incoming.conversation._id
        );

        const unreadCount =
          selectedConversationId === incoming.conversation._id ||
          incoming.message.isMine
            ? 0
            : (existingConversation?.unreadCount || 0) + 1;

        return {
          ...previous,
          conversations: [
            {
              ...incoming.conversation,
              unreadCount,
            },
            ...previous.conversations.filter(
              (conversation) =>
                conversation._id !== incoming.conversation._id
            ),
          ],
        };
      });

      if (selectedConversationId === incoming.conversation._id) {
        setMessages((previous) =>
          previous.some((message) => message._id === incoming.message._id)
            ? previous
            : [...previous, incoming.message]
        );
      }
    };

    socket.on("support:message", handler);

    return () => {
      socket.off("support:message", handler);
    };
  }, [selectedConversationId, user?._id]);

  const conversations = bootstrap?.conversations || [];
  const isExecutive = !!bootstrap?.isExecutive;
  const topics = bootstrap?.topics || [];

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const haystack = [
        conversation.topic,
        conversation.subject,
        getParticipantName(conversation),
        conversation.requester.username,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [conversations, search]);

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation._id === selectedConversationId
    ) || null;

  const handleSelectConversation = (conversationId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("conversationId", conversationId);
    setSearchParams(next);
  };

  const handleCreateConversation = async () => {
    setCreateAttempted(true);

    if (!topic || !subject.trim() || (!openingMessage.trim() && !openingAttachment)) {
      setCreateError("Topic, subject, and either an opening message or attachment are required.");
      return;
    }

    try {
      setCreating(true);
      setCreateError("");
      const created = await createSupportConversation({
        topic,
        subject: subject.trim(),
        text: openingMessage.trim(),
        attachment: openingAttachment,
      });
      await refreshBootstrap();
      setSearchParams({ conversationId: created.conversation._id });
      setOpeningMessage("");
      setOpeningAttachment(null);
      setDraft("");
    } catch (error) {
      console.error("Failed to create support conversation:", error);
      setCreateError("Could not open support request right now.");
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async () => {
    if (!selectedConversation || (!draft.trim() && !draftAttachment)) {
      return;
    }

    try {
      setSending(true);
      const sent = await sendSupportMessage(
        selectedConversation._id,
        {
          text: draft.trim(),
          attachment: draftAttachment,
        }
      );
      setMessages((previous) => [...previous, sent.message]);
      setDraft("");
      setDraftAttachment(null);
      setBootstrap((previous) =>
        previous
          ? {
              ...previous,
              conversations: [
                {
                  ...sent.conversation,
                  unreadCount: 0,
                },
                ...previous.conversations.filter(
                  (conversation) =>
                    conversation._id !== sent.conversation._id
                ),
              ],
            }
          : previous
      );
    } catch (error) {
      console.error("Failed to send support message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (
    status: SupportConversation["status"]
  ) => {
    if (!selectedConversation) {
      return;
    }

    try {
      const updated = await updateSupportConversationStatus(
        selectedConversation._id,
        status
      );

      setBootstrap((previous) =>
        previous
          ? {
              ...previous,
              conversations: previous.conversations.map((conversation) =>
                conversation._id === updated._id
                  ? {
                      ...conversation,
                      ...updated,
                    }
                  : conversation
              ),
            }
          : previous
      );
    } catch (error) {
      console.error("Failed to update support status:", error);
    }
  };

  if (authLoading || !user) {
    return <div className={styles.loading}>Loading support center...</div>;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>Support</span>
          <h1>
            {isExecutive
              ? "Executive inbox for live support requests"
              : "Get human help without leaving SkillSphere"}
          </h1>
          <p>
            {isExecutive
              ? "Respond to platform issues, payment questions, and learner or tutor support requests from one dedicated queue."
              : "Start with a support request and continue the conversation in-app whenever you need platform help."}
          </p>
        </div>

        <div className={styles.snapshot}>
          <span className={styles.snapshotLabel}>
            {isExecutive ? "Queue" : "Support status"}
          </span>
          <strong>
            {conversations.length
              ? `${conversations.length} active conversation${
                  conversations.length > 1 ? "s" : ""
                }`
              : "No support requests yet"}
          </strong>
          <span className={styles.snapshotHint}>
            {isExecutive
              ? "Handle user issues separately from tutor chat."
              : "Use this channel for platform and payment issues, not tutor session discussion."}
          </span>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search support conversations"
            />
          </div>

          {!isExecutive ? (
            <div className={styles.createCard}>
              <div className={styles.createHeader}>
                <div className={styles.iconWrap}>
                  <MailPlus size={18} />
                </div>
                <div>
                  <strong>Open a support request</strong>
                  <span>
                    Start a thread for payments, session state, or account issues.
                  </span>
                </div>
              </div>

              <select
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className={
                  createAttempted && !topic ? styles.inputError : ""
                }
              >
                {topics.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Short subject line"
                className={
                  createAttempted && !subject.trim()
                    ? styles.inputError
                    : ""
                }
              />

              <textarea
                value={openingMessage}
                onChange={(event) =>
                  setOpeningMessage(event.target.value)
                }
                placeholder="Describe the issue, what you expected, and any session or payment details that might help."
                className={
                  createAttempted && !openingMessage.trim()
                    ? styles.inputError
                    : ""
                }
              />

              <label className={styles.fileField}>
                <span>Optional attachment</span>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.txt"
                  onChange={(event) =>
                    setOpeningAttachment(event.target.files?.[0] || null)
                  }
                />
                <small>
                  {openingAttachment
                    ? `Attached: ${openingAttachment.name}`
                    : "Attach screenshots, PDFs, or docs if they help explain the issue."}
                </small>
              </label>

              {createError ? (
                <p className={styles.error}>{createError}</p>
              ) : null}

              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => void handleCreateConversation()}
                disabled={creating}
              >
                {creating ? "Opening..." : "Create Support Thread"}
              </button>
            </div>
          ) : null}

          <div className={styles.list}>
            {loading ? (
              <div className={styles.emptyState}>
                <strong>Loading support queue</strong>
                <span>Please wait while we gather your conversations.</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className={styles.emptyState}>
                <strong>No conversations yet</strong>
                <span>
                  {isExecutive
                    ? "New support requests will appear here."
                    : "Create a support request to start chatting with the team."}
                </span>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation._id}
                  type="button"
                  className={`${styles.threadCard} ${
                    selectedConversationId === conversation._id
                      ? styles.threadCardActive
                      : ""
                  }`}
                  onClick={() =>
                    handleSelectConversation(conversation._id)
                  }
                >
                  <div className={styles.threadTop}>
                    <span className={styles.threadTopic}>
                      {conversation.topic}
                    </span>
                    <span className={styles.threadDate}>
                      {formatDate(conversation.lastMessageAt)}
                    </span>
                  </div>
                    <strong>{conversation.subject}</strong>
                    <p>
                      {isExecutive
                      ? ""
                      : conversation.assignedTo
                        ? `Assigned to ${conversation.assignedTo.fullName || conversation.assignedTo.username}`
                        : "Awaiting assignment"}
                    </p>
                    {isExecutive ? (
                      <div className={styles.identityRow}>
                        <span>{getParticipantName(conversation)} (@{conversation.requester.username})</span>
                        {isVerifiedParticipant(conversation.requester) ? (
                          <span
                            className={`${styles.verifiedTick} ${
                              conversation.requester.isAdmin ? styles.adminTick : ""
                            }`}
                            aria-label={conversation.requester.isAdmin ? "Admin" : "Verified user"}
                            title={conversation.requester.isAdmin ? "Admin" : "Verified user"}
                          >
                            <BadgeCheck size={15} />
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                    <div className={styles.threadBottom}>
                    <span className={styles[conversation.status]}>
                      {conversation.status.replaceAll("_", " ")}
                    </span>
                    {conversation.unreadCount ? (
                      <span className={styles.unreadBadge}>
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className={styles.chatPanel}>
          {!selectedConversation ? (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>
                <LifeBuoy size={24} />
              </div>
              <strong>
                {isExecutive
                  ? "Select a support conversation"
                  : "Open or select a support thread"}
              </strong>
              <span>
                {isExecutive
                  ? "Pick a request from the queue to review the conversation."
                  : "Use a thread for payment, wallet, session-state, and account issues. Tutor discussion stays in Messages."}
              </span>
              <Link to="/help-center" className={styles.helpLink}>
                Back to Help Center
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.chatHeader}>
                <div>
                  <span className={styles.chatKicker}>
                    {selectedConversation.topic}
                  </span>
                  <h2>{selectedConversation.subject}</h2>
                  <p>
                    {isExecutive
                      ? ""
                      : selectedConversation.assignedTo
                        ? `Handled by ${selectedConversation.assignedTo.fullName || selectedConversation.assignedTo.username}`
                        : "Awaiting assignment from the support team"}
                  </p>
                  {isExecutive ? (
                    <div className={styles.identityRow}>
                      <span>
                        Requested by {getParticipantName(selectedConversation)} (@{selectedConversation.requester.username})
                      </span>
                      {isVerifiedParticipant(selectedConversation.requester) ? (
                        <span
                          className={`${styles.verifiedTick} ${
                            selectedConversation.requester.isAdmin ? styles.adminTick : ""
                          }`}
                          aria-label={selectedConversation.requester.isAdmin ? "Admin" : "Verified user"}
                          title={selectedConversation.requester.isAdmin ? "Admin" : "Verified user"}
                        >
                          <BadgeCheck size={15} />
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className={styles.statusActions}>
                  <span className={styles[selectedConversation.status]}>
                    {selectedConversation.status.replaceAll("_", " ")}
                  </span>
                  {selectedConversation.status !== "resolved" ? (
                    <button
                      type="button"
                      onClick={() => void handleStatusChange("resolved")}
                    >
                      Mark resolved
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleStatusChange("open")}
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.messagesArea}>
                {threadLoading ? (
                  <div className={styles.placeholder}>
                    <strong>Loading support thread</strong>
                    <span>Bringing in the latest messages now.</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className={styles.placeholder}>
                    <strong>No messages yet</strong>
                    <span>
                      Once a reply is sent, the conversation will appear here.
                    </span>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`${styles.messageRow} ${
                        message.isMine ? styles.mine : styles.theirs
                      }`}
                    >
                      <div className={styles.messageBubble}>
                        <span className={styles.senderLabel}>
                          {message.senderRole === "support"
                            ? "Support"
                            : message.sender.fullName ||
                              message.sender.username}
                        </span>
                        {message.text ? <p>{message.text}</p> : null}
                        {message.attachment ? (
                          <a
                            href={message.attachment.url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.attachmentLink}
                          >
                            {message.attachment.name}
                          </a>
                        ) : null}
                        <span>{formatTime(message.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.composer}>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Write your reply"
                />

                <label className={styles.fileField}>
                  <span>Attachment</span>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.txt"
                    onChange={(event) =>
                      setDraftAttachment(event.target.files?.[0] || null)
                    }
                  />
                  <small>
                    {draftAttachment
                      ? `Attached: ${draftAttachment.name}`
                      : "Optional file for screenshots or supporting documents."}
                  </small>
                </label>

                <button
                  type="button"
                  className={styles.sendButton}
                  onClick={() => void handleSend()}
                  disabled={sending || (!draft.trim() && !draftAttachment)}
                >
                  <Send size={16} />
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default SupportCenter;
