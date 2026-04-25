import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageCircleMore, Search, Send } from "lucide-react";
import styles from "./Messages.module.scss";
import { useAuth } from "../../context/AuthContext";
import { socket } from "../../utils/socket";
import {
  getChatContacts,
  getConversationMessages,
  getConversations,
  sendChatMessage,
  type ChatMessage,
  type ChatParticipant,
  type ConversationSummary,
} from "../../services/messages.service";

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

const getDisplayName = (participant: ChatParticipant) =>
  participant.fullName || participant.username || "Participant";

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState<
    ConversationSummary[]
  >([]);
  const [contacts, setContacts] = useState<ChatParticipant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const selectedId = searchParams.get("userId") || "";
  const selectedUsername = searchParams.get("username") || "";

  const refreshInbox = async () => {
    const [conversationData, contactData] = await Promise.all([
      getConversations(),
      getChatContacts(),
    ]);

    setConversations(conversationData);
    setContacts(contactData);
  };

  useEffect(() => {
    if (!user?._id) return;

    const load = async () => {
      try {
        setLoading(true);
        await refreshInbox();
      } catch (error) {
        console.error("Failed to load inbox:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
    socket.emit("register", user._id);
  }, [user?._id]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    const loadThread = async () => {
      try {
        setThreadLoading(true);
        const data = await getConversationMessages(selectedId);
        setMessages(data);
        await refreshInbox();
      } catch (error) {
        console.error("Failed to load thread:", error);
      } finally {
        setThreadLoading(false);
      }
    };

    loadThread();
  }, [selectedId]);

  useEffect(() => {
    const handler = (incoming: ChatMessage) => {
      const participantId = incoming.isMine
        ? incoming.recipient._id
        : incoming.sender._id;

      setConversations((previous) => {
        const existing = previous.find(
          (item) => item.participant._id === participantId
        );

        const nextConversation = {
          participant: incoming.isMine
            ? incoming.recipient
            : incoming.sender,
          unreadCount:
            selectedId === participantId || incoming.isMine
              ? 0
              : (existing?.unreadCount || 0) + 1,
          lastMessage: incoming,
        };

        return [
          nextConversation,
          ...previous.filter(
            (item) => item.participant._id !== participantId
          ),
        ];
      });

      setContacts((previous) => {
        const participant = incoming.isMine
          ? incoming.recipient
          : incoming.sender;

        if (previous.some((item) => item._id === participant._id)) {
          return previous;
        }

        return [participant, ...previous];
      });

      if (selectedId === participantId) {
        setMessages((previous) =>
          previous.some((item) => item._id === incoming._id)
            ? previous
            : [...previous, incoming]
        );
      }
    };

    socket.on("chat:message", handler);

    return () => {
      socket.off("chat:message", handler);
    };
  }, [selectedId]);

  const mergedContacts = useMemo(() => {
    const map = new Map<string, ChatParticipant>();

    conversations.forEach((item) => {
      map.set(item.participant._id, item.participant);
    });

    contacts.forEach((item) => {
      if (!map.has(item._id)) {
        map.set(item._id, item);
      }
    });

    if (selectedId && !map.has(selectedId)) {
      map.set(selectedId, {
        _id: selectedId,
        username: selectedUsername || "participant",
        fullName: "",
      });
    }

    return [...map.values()];
  }, [contacts, conversations, selectedId, selectedUsername]);

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return mergedContacts;
    }

    return mergedContacts.filter((participant) => {
      const label = getDisplayName(participant).toLowerCase();
      const username = participant.username.toLowerCase();
      return (
        label.includes(query) || username.includes(query)
      );
    });
  }, [mergedContacts, search]);

  const selectedParticipant = useMemo(
    () =>
      mergedContacts.find((participant) => participant._id === selectedId) ||
      null,
    [mergedContacts, selectedId]
  );

  const selectConversation = (participant: ChatParticipant) => {
    setSearchParams({
      userId: participant._id,
      username: participant.username || "participant",
    });
  };

  const handleSend = async () => {
    if (!selectedParticipant || !draft.trim()) {
      return;
    }

    try {
      setSending(true);
      const sent = await sendChatMessage(
        selectedParticipant._id,
        draft.trim()
      );

      setMessages((previous) => [...previous, sent]);
      setDraft("");

      setConversations((previous) => [
        {
          participant: selectedParticipant,
          unreadCount: 0,
          lastMessage: sent,
        },
        ...previous.filter(
          (item) => item.participant._id !== selectedParticipant._id
        ),
      ]);

      if (
        !contacts.some(
          (participant) =>
            participant._id === selectedParticipant._id
        )
      ) {
        setContacts((previous) => [selectedParticipant, ...previous]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  if (authLoading || !user) {
    return <div className={styles.loading}>Loading messages...</div>;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>Messages</span>
          <h1>Keep learner and tutor conversations in one place</h1>
          <p>
            Follow up on session requests, coordinate timing, and keep
            the context close to your dashboard workflow.
          </p>
        </div>

        <div className={styles.snapshot}>
          <span className={styles.snapshotLabel}>Inbox</span>
          <strong>
            {conversations.length
              ? `${conversations.length} active conversation${
                  conversations.length > 1 ? "s" : ""
                }`
              : "No active conversations yet"}
          </strong>
          <span className={styles.snapshotHint}>
            {contacts.length
              ? `${contacts.length} recent contact${
                  contacts.length > 1 ? "s" : ""
                } available`
              : "Your session contacts will show up here"}
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
              placeholder="Search conversations"
            />
          </div>

          <div className={styles.list}>
            {loading ? (
              <div className={styles.emptyState}>
                <strong>Loading inbox</strong>
                <span>Please wait while we gather your conversations.</span>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className={styles.emptyState}>
                <strong>No contacts yet</strong>
                <span>
                  Book or manage sessions first and the people you work
                  with will appear here.
                </span>
              </div>
            ) : (
              filteredContacts.map((participant) => {
                const conversation = conversations.find(
                  (item) => item.participant._id === participant._id
                );

                return (
                  <button
                    key={participant._id}
                    type="button"
                    className={`${styles.contactCard} ${
                      selectedId === participant._id
                        ? styles.contactCardActive
                        : ""
                    }`}
                    onClick={() => selectConversation(participant)}
                  >
                    <div className={styles.avatar}>
                      {participant.profilePhoto ? (
                        <img
                          src={participant.profilePhoto}
                          alt={getDisplayName(participant)}
                        />
                      ) : (
                        <span>
                          {getDisplayName(participant).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className={styles.contactContent}>
                      <div className={styles.contactTop}>
                        <strong>{getDisplayName(participant)}</strong>
                        {conversation?.lastMessage?.createdAt ? (
                          <span>
                            {formatDate(
                              conversation.lastMessage.createdAt
                            )}
                          </span>
                        ) : null}
                      </div>

                      <span className={styles.contactMeta}>
                        @{participant.username || "participant"}
                      </span>

                      <p>
                        {conversation?.lastMessage?.text ||
                          "No messages yet. Start the conversation."}
                      </p>
                    </div>

                    {conversation?.unreadCount ? (
                      <span className={styles.unreadBadge}>
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <div className={styles.chatPanel}>
          {!selectedParticipant ? (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>
                <MessageCircleMore size={24} />
              </div>
              <strong>Select a conversation</strong>
              <span>
                Choose someone from the inbox to read or send messages.
              </span>
            </div>
          ) : (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.chatIdentity}>
                  <div className={styles.avatar}>
                    {selectedParticipant.profilePhoto ? (
                      <img
                        src={selectedParticipant.profilePhoto}
                        alt={getDisplayName(selectedParticipant)}
                      />
                    ) : (
                      <span>
                        {getDisplayName(selectedParticipant)
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <strong>{getDisplayName(selectedParticipant)}</strong>
                    <span>@{selectedParticipant.username}</span>
                  </div>
                </div>
              </div>

              <div className={styles.messagesArea}>
                {threadLoading ? (
                  <div className={styles.placeholder}>
                    <strong>Loading conversation</strong>
                    <span>Bringing in your recent messages now.</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className={styles.placeholder}>
                    <strong>No messages yet</strong>
                    <span>
                      Start the first conversation with{" "}
                      {getDisplayName(selectedParticipant)}.
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
                        <p>{message.text}</p>
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
                  placeholder={`Message ${getDisplayName(
                    selectedParticipant
                  )}`}
                />

                <button
                  type="button"
                  className={styles.sendButton}
                  onClick={() => void handleSend()}
                  disabled={sending || !draft.trim()}
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

export default Messages;
