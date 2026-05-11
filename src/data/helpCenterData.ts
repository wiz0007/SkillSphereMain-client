import {
  BadgeHelp,
  BookOpen,
  CircleDollarSign,
  GraduationCap,
  MessageSquareText,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface HelpSection {
  id: string;
  title: string;
  body: string[];
  checklist?: string[];
}

export interface HelpCategory {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: "teal" | "gold" | "navy";
}

export interface HelpArticle {
  slug: string;
  categorySlug: string;
  title: string;
  summary: string;
  audience: Array<"students" | "tutors" | "guests" | "all">;
  updatedAt: string;
  popular?: boolean;
  keywords: string[];
  sections: HelpSection[];
}

export const helpCategories: HelpCategory[] = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description:
      "Account setup, platform basics, and the fastest path from browsing to booking.",
    icon: BadgeHelp,
    accent: "teal",
  },
  {
    slug: "courses-and-discovery",
    title: "Courses & Discovery",
    description:
      "How course pages work, how learners compare tutors, and how tutors present their offers.",
    icon: BookOpen,
    accent: "navy",
  },
  {
    slug: "sessions-and-booking",
    title: "Sessions & Booking",
    description:
      "Everything about session requests, confirmations, expiry rules, and completion flow.",
    icon: GraduationCap,
    accent: "teal",
  },
  {
    slug: "skillcoin-and-payments",
    title: "SkillCoin & Payments",
    description:
      "Recharge flow, locked balances, settlement after completion, and payment safety rules.",
    icon: CircleDollarSign,
    accent: "gold",
  },
  {
    slug: "messages-and-support",
    title: "Messages & Support",
    description:
      "When chat opens, how to reach the right tutor, and what to do when you still need help.",
    icon: MessageSquareText,
    accent: "navy",
  },
  {
    slug: "account-and-safety",
    title: "Account & Safety",
    description:
      "Profile visibility, reviews, settings, and basic account protection guidance.",
    icon: ShieldCheck,
    accent: "gold",
  },
];

export const helpArticles: HelpArticle[] = [
  {
    slug: "create-an-account-and-start-exploring",
    categorySlug: "getting-started",
    title: "Create an account and start exploring",
    summary:
      "What guests can do before signing in, when login becomes required, and how to finish onboarding.",
    audience: ["students", "tutors", "guests"],
    updatedAt: "May 10, 2026",
    popular: true,
    keywords: ["signup", "login", "guest", "onboarding", "explore"],
    sections: [
      {
        id: "browse-first",
        title: "Browse before you commit",
        body: [
          "Guests can open the main website, explore course listings, inspect public tutor profiles, and read course details before creating an account.",
          "SkillSphere only asks for login once you try to do something that belongs to a real user state, such as requesting a session, saving a course, opening messages, or editing account settings.",
        ],
      },
      {
        id: "when-login-is-required",
        title: "When login becomes required",
        body: [
          "You will be redirected to login before booking a session, recharging SkillCoin, viewing your dashboard, opening messages, or accessing protected account pages.",
          "This keeps discovery friction low for first-time visitors while still protecting actions that change balances, sessions, or private data.",
        ],
        checklist: [
          "Use Explore to compare topics and tutors first.",
          "Create an account before requesting a session or saving courses.",
          "Complete your profile after first sign-in so future booking steps stay fast.",
        ],
      },
    ],
  },
  {
    slug: "understand-course-pages-and-tutor-previews",
    categorySlug: "courses-and-discovery",
    title: "Understand course pages and tutor previews",
    summary:
      "What learners see on a course page, how reviews are loaded, and what changes when tutors open their own course.",
    audience: ["students", "tutors", "all"],
    updatedAt: "May 10, 2026",
    keywords: ["course page", "reviews", "ratings", "dashboard", "preview"],
    sections: [
      {
        id: "learner-view",
        title: "Learner view",
        body: [
          "Learners see the course overview, tutor information, pricing, ratings, and written reviews in one place. If they are logged in and eligible, they can also save the course, rate it, or leave a review after enrollment.",
          "The request-session action appears only for learners who are viewing someone else’s course.",
        ],
      },
      {
        id: "tutor-view",
        title: "Tutor owner preview",
        body: [
          "When tutors open their own course from the dashboard, SkillSphere switches the page into owner preview mode. Learner actions such as requesting a session, saving, or submitting a review are hidden.",
          "Tutors can still inspect ratings, written learner feedback, and the public presentation of the course without accidentally seeing student-only controls.",
        ],
      },
    ],
  },
  {
    slug: "how-session-requests-work",
    categorySlug: "sessions-and-booking",
    title: "How session requests work",
    summary:
      "What happens after a learner chooses date and time, and how tutors confirm or reject the request.",
    audience: ["students", "tutors", "all"],
    updatedAt: "May 10, 2026",
    popular: true,
    keywords: ["request session", "pending", "accepted", "rejected", "expired"],
    sections: [
      {
        id: "request-life-cycle",
        title: "Request life cycle",
        body: [
          "A learner selects a future session time and submits a request from the course page. The request appears as pending until the tutor accepts or rejects it.",
          "If the requested time passes while the session is still pending, SkillSphere marks it as expired instead of keeping it in a waiting state.",
        ],
      },
      {
        id: "tutor-confirmation",
        title: "Tutor confirmation",
        body: [
          "Tutors can accept or reject the request from the sessions workspace. Accepted sessions remain upcoming until the scheduled window passes, after which they move into the completed section.",
          "Rejected or expired requests release any locked SkillCoin back to the learner’s available balance.",
        ],
        checklist: [
          "Learners must pick a future time.",
          "Tutors control whether a session becomes accepted.",
          "Expired pending requests can be removed from view later for cleanup.",
        ],
      },
    ],
  },
  {
    slug: "when-chat-becomes-available",
    categorySlug: "messages-and-support",
    title: "When chat becomes available",
    summary:
      "Why direct messages are limited and when student-tutor conversation opens.",
    audience: ["students", "tutors", "all"],
    updatedAt: "May 10, 2026",
    keywords: ["chat", "messages", "accepted session", "tutor contact"],
    sections: [
      {
        id: "chat-rules",
        title: "Direct message rules",
        body: [
          "Messages are available only between a learner and a tutor who share an accepted or completed session relationship. This keeps the inbox relevant and prevents unrelated spam conversations.",
          "Learners can enter chat from qualifying session cards or from the messages workspace once at least one accepted or completed session exists.",
        ],
      },
      {
        id: "what-if-no-chat",
        title: "If you cannot message yet",
        body: [
          "If chat is unavailable, check whether the session request is still pending. Messaging opens only after acceptance or completion, not immediately after request creation.",
          "If a session should already qualify but the inbox is still missing, use the Contact Support action in the help center with the session date and course title.",
        ],
      },
    ],
  },
  {
    slug: "how-skillcoin-locks-and-releases-work",
    categorySlug: "skillcoin-and-payments",
    title: "How SkillCoin locks and releases work",
    summary:
      "A practical explanation of available balance, locked balance, and final settlement after a session.",
    audience: ["students", "tutors", "all"],
    updatedAt: "May 10, 2026",
    popular: true,
    keywords: ["skillcoin", "wallet", "locked", "available", "payment"],
    sections: [
      {
        id: "balance-types",
        title: "Balance types",
        body: [
          "Available SkillCoin is what you can spend immediately. Locked SkillCoin is temporarily reserved for a requested or accepted session so the same balance cannot be spent twice.",
          "The wallet UI separates available, locked, and total balance to make this clearer before and after booking steps.",
        ],
      },
      {
        id: "lock-release-settlement",
        title: "Lock, release, and settlement",
        body: [
          "When a learner requests a session, the course-equivalent SkillCoin amount is locked. If the tutor rejects the request or the request expires, that amount is released back to the learner.",
          "If the session is accepted and later completed with learner confirmation, the locked amount is settled to the tutor instead of being returned to the learner.",
        ],
        checklist: [
          "Recharge first if available balance is too low.",
          "Pending and accepted sessions can keep part of your balance locked.",
          "Only completed confirmed sessions transfer the final value to the tutor.",
        ],
      },
    ],
  },
  {
    slug: "recharge-skillcoin-safely",
    categorySlug: "skillcoin-and-payments",
    title: "Recharge SkillCoin safely",
    summary:
      "How wallet recharge works, where to find transaction history, and when to contact support.",
    audience: ["students", "tutors", "all"],
    updatedAt: "May 10, 2026",
    keywords: ["recharge", "razorpay", "wallet history", "payment issue"],
    sections: [
      {
        id: "recharge-flow",
        title: "Recharge flow",
        body: [
          "SkillCoin is recharged through the payment gateway. The wallet records the recharge as a ledger event so the balance, transaction history, and audit state stay aligned.",
          "On desktop, the wallet panel is available from the navbar. On mobile, SkillSphere uses a dedicated wallet page so recharge and history stay readable.",
        ],
      },
      {
        id: "payment-issue",
        title: "If a recharge looks wrong",
        body: [
          "First check the wallet activity list and the current balance bar. If the payment succeeded but the balance still looks off after refresh, open Contact Support from the help center and include the recharge amount, approximate time, and whether the gateway reported success.",
          "Support is especially useful for payment mismatches, duplicate pending attempts, or wallet states that remain locked longer than expected.",
        ],
      },
    ],
  },
  {
    slug: "how-reviews-are-earned-and-shown",
    categorySlug: "account-and-safety",
    title: "How reviews are earned and shown",
    summary:
      "Who can review a course, how ratings appear, and why SkillSphere restricts review submission.",
    audience: ["students", "tutors", "all"],
    updatedAt: "May 10, 2026",
    keywords: ["reviews", "ratings", "eligibility", "trust"],
    sections: [
      {
        id: "eligibility",
        title: "Review eligibility",
        body: [
          "A learner can review a course only after holding an accepted or completed enrollment relationship for that course. This protects course pages from random ratings by non-participants.",
          "Tutors can read the feedback on their own course but cannot submit self-reviews from the owner preview.",
        ],
      },
      {
        id: "display",
        title: "How ratings display",
        body: [
          "Course pages show the average rating, total number of ratings, and written review cards. SkillSphere stores review data separately from the course summary so ratings can scale cleanly without bloating the course record.",
          "If a review is removed or changed, the summary values update from the underlying review records instead of relying on stale embedded fields.",
        ],
      },
    ],
  },
  {
    slug: "manage-profile-security-and-support",
    categorySlug: "account-and-safety",
    title: "Manage profile, security, and support",
    summary:
      "Where to edit your account, what to double-check before deleting it, and how to reach support.",
    audience: ["students", "tutors", "all"],
    updatedAt: "May 10, 2026",
    keywords: ["profile", "settings", "account", "delete", "support"],
    sections: [
      {
        id: "profile-and-settings",
        title: "Profile and settings",
        body: [
          "Use the profile page for your public-facing identity and the settings page for account-level actions. This separation helps learners control presentation without mixing it with destructive account changes.",
          "Deleting an account is a high-impact action, so SkillSphere requires multiple confirmations before it is allowed.",
        ],
      },
      {
        id: "contact-support",
        title: "When to contact support",
        body: [
          "Use support when the issue is account-sensitive, payment-related, or impossible to fix from the UI. Examples include a successful payment without wallet credit, chat not opening after an accepted session, or feedback that appears inconsistent.",
          "When contacting support, include the course title, session date, recharge amount, or screenshot that best identifies the issue so resolution can be faster.",
        ],
      },
    ],
  },
];

export const getHelpCategory = (slug?: string) =>
  helpCategories.find((category) => category.slug === slug);

export const getHelpArticle = (slug?: string) =>
  helpArticles.find((article) => article.slug === slug);
