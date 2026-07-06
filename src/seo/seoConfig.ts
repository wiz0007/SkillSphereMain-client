export type SeoRoutePolicy = "index" | "conditional-index" | "noindex" | "private";

export type RobotsDirective = "index,follow" | "noindex,nofollow" | "noindex,follow";

export interface SeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: RobotsDirective;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "profile";
  structuredData?: Record<string, unknown>[];
}

export const siteName = "SkillSphere";

export const productionSiteUrl =
  (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined) ||
  "https://skillsphere.space";

export const seoIndexingEnabled =
  String(import.meta.env.VITE_SEO_INDEXING_ENABLED || "").toLowerCase() ===
  "true";

export const defaultSeoImage = `${productionSiteUrl}/skillsphere-icon.svg`;

export const analyticsId =
  (import.meta.env.VITE_ANALYTICS_ID as string | undefined) || "";

export const searchConsoleVerification =
  (import.meta.env.VITE_SEARCH_CONSOLE_VERIFICATION as string | undefined) || "";

export const privateRoutePrefixes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/messages",
  "/notifications",
  "/sessions",
  "/your-courses",
  "/saved-courses",
  "/wallet",
  "/support",
  "/add-course",
  "/admin",
  "/userDetails",
  "/social-auth",
];

export const noindexRoutePrefixes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export const seoRoutePolicies: Record<string, SeoRoutePolicy> = {
  "/": "index",
  "/explore": "index",
  "/courses": "index",
  "/tutors": "conditional-index",
  "/become-a-tutor": "index",
  "/how-it-works": "index",
  "/live-learning": "index",
  "/recorded-courses": "index",
  "/online-tuition": "index",
  "/tutor-verification": "index",
  "/skillcoin": "index",
  "/trust-and-safety": "index",
  "/refunds-and-cancellations": "index",
  "/transaction-audit": "index",
  "/about": "index",
  "/contact": "index",
  "/help-center": "index",
};

const trimToWord = (value: string, maxLength: number) => {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const sliced = normalized.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, lastSpace > 40 ? lastSpace : sliced.length).trim()}…`;
};

export const sanitizeSeoText = (value: unknown) =>
  String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const normalizePath = (path: string) => {
  const withoutQuery = path.split("?")[0] || "/";
  const normalized = withoutQuery.replace(/\/+$/, "") || "/";
  return normalized.toLowerCase();
};

export const buildCanonicalUrl = (path: string) => {
  const canonicalPath = normalizePath(path);
  return `${productionSiteUrl}${canonicalPath === "/" ? "" : canonicalPath}`;
};

export const getRoutePolicy = (path: string): SeoRoutePolicy => {
  const normalizedPath = normalizePath(path);

  if (privateRoutePrefixes.some((prefix) => normalizedPath.startsWith(prefix))) {
    return "private";
  }

  if (noindexRoutePrefixes.some((prefix) => normalizedPath.startsWith(prefix))) {
    return "noindex";
  }

  if (
    normalizedPath.startsWith("/course/") ||
    normalizedPath.startsWith("/courses/") ||
    normalizedPath.startsWith("/public-profile/") ||
    normalizedPath.startsWith("/tutors/") ||
    normalizedPath.startsWith("/categories/") ||
    normalizedPath.startsWith("/help-center/article/") ||
    normalizedPath.startsWith("/help-center/category/")
  ) {
    return "conditional-index";
  }

  return seoRoutePolicies[normalizedPath] || "noindex";
};

export const robotsForPolicy = (policy: SeoRoutePolicy): RobotsDirective => {
  if (!seoIndexingEnabled) return "noindex,nofollow";
  return policy === "index" || policy === "conditional-index"
    ? "index,follow"
    : "noindex,nofollow";
};

export const createSeoMetadata = (
  path: string,
  metadata?: Partial<SeoMetadata>
): SeoMetadata => {
  const policy = getRoutePolicy(path);
  const title = trimToWord(
    sanitizeSeoText(metadata?.title) ||
      "Learn Skills with Live Tutors and Recorded Courses | SkillSphere",
    62
  );
  const description = trimToWord(
    sanitizeSeoText(metadata?.description) ||
      "Discover practical skill courses, compare verified tutors, book live one-to-one sessions, and learn through recorded content with secure SkillCoin booking.",
    155
  );

  return {
    title,
    description,
    canonicalUrl: metadata?.canonicalUrl || buildCanonicalUrl(path),
    robots: metadata?.robots || robotsForPolicy(policy),
    image: metadata?.image || defaultSeoImage,
    imageAlt: metadata?.imageAlt || "SkillSphere skill learning marketplace",
    type: metadata?.type || "website",
    structuredData: metadata?.structuredData || [],
  };
};

export const buildWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: productionSiteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${productionSiteUrl}/explore?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const buildOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: productionSiteUrl,
  logo: defaultSeoImage,
});
