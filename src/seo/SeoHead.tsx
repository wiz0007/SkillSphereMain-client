import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  analyticsId,
  buildOrganizationSchema,
  buildWebsiteSchema,
  createSeoMetadata,
  searchConsoleVerification,
  type SeoMetadata,
} from "./seoConfig";

interface SeoHeadProps {
  metadata?: Partial<SeoMetadata>;
}

const setMeta = (selector: string, attribute: "name" | "property", value: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

const setCanonical = (href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
};

const setStructuredData = (items: Record<string, unknown>[]) => {
  document
    .querySelectorAll('script[data-skill-sphere-seo="jsonld"]')
    .forEach((node) => node.remove());

  items.forEach((item) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.skillSphereSeo = "jsonld";
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
  });
};

const ensureSearchConsoleVerification = () => {
  if (!searchConsoleVerification) return;
  setMeta(
    'meta[name="google-site-verification"]',
    "name",
    "google-site-verification",
    searchConsoleVerification
  );
};

const ensureAnalytics = () => {
  if (!analyticsId || document.querySelector(`script[data-analytics-id="${analyticsId}"]`)) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`;
  script.dataset.analyticsId = analyticsId;
  document.head.appendChild(script);

  const inlineScript = document.createElement("script");
  inlineScript.dataset.analyticsId = analyticsId;
  inlineScript.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${analyticsId}', { anonymize_ip: true });
  `;
  document.head.appendChild(inlineScript);
};

const SeoHead = ({ metadata }: SeoHeadProps) => {
  const location = useLocation();

  useEffect(() => {
    const seo = createSeoMetadata(`${location.pathname}${location.search}`, metadata);
    const schemas = [
      buildOrganizationSchema(),
      buildWebsiteSchema(),
      ...(seo.structuredData || []),
    ];

    document.title = seo.title;
    setMeta('meta[name="description"]', "name", "description", seo.description);
    setMeta('meta[name="robots"]', "name", "robots", seo.robots);
    setCanonical(seo.canonicalUrl);

    setMeta('meta[property="og:site_name"]', "property", "og:site_name", "SkillSphere");
    setMeta('meta[property="og:title"]', "property", "og:title", seo.title);
    setMeta('meta[property="og:description"]', "property", "og:description", seo.description);
    setMeta('meta[property="og:url"]', "property", "og:url", seo.canonicalUrl);
    setMeta('meta[property="og:type"]', "property", "og:type", seo.type || "website");
    setMeta('meta[property="og:image"]', "property", "og:image", seo.image || "");
    setMeta('meta[property="og:image:alt"]', "property", "og:image:alt", seo.imageAlt || "");

    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", seo.title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", seo.description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", seo.image || "");

    setStructuredData(schemas);
    ensureSearchConsoleVerification();
    ensureAnalytics();
  }, [location.pathname, location.search, metadata]);

  return null;
};

export default SeoHead;
