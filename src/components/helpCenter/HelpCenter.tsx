import {
  ArrowRight,
  ChevronRight,
  LifeBuoy,
  Mail,
  Search,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getHelpArticle,
  getHelpCategory,
  helpArticles,
  helpCategories,
} from "../../data/helpCenterData";
import styles from "./HelpCenter.module.scss";

const HelpCenter = () => {
  const { categorySlug, articleSlug } = useParams();
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  const selectedCategory = getHelpCategory(categorySlug);
  const selectedArticle = getHelpArticle(articleSlug);

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return helpArticles.filter((article) => {
      const matchesCategory = selectedCategory
        ? article.categorySlug === selectedCategory.slug
        : true;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        article.title,
        article.summary,
        ...article.keywords,
        ...article.sections.flatMap((section) => [
          section.title,
          ...section.body,
          ...(section.checklist || []),
        ]),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [query, selectedCategory]);

  const popularArticles = useMemo(
    () => helpArticles.filter((article) => article.popular).slice(0, 4),
    []
  );

  const relatedArticles = useMemo(() => {
    if (!selectedArticle) {
      return [];
    }

    return helpArticles
      .filter(
        (article) =>
          article.slug !== selectedArticle.slug &&
          article.categorySlug === selectedArticle.categorySlug
      )
      .slice(0, 3);
  }, [selectedArticle]);

  const supportLink = selectedArticle
    ? `/support?topic=Other&subject=${encodeURIComponent(
        selectedArticle.title
      )}`
    : "/support";

  if (selectedArticle) {
    const articleCategory = getHelpCategory(selectedArticle.categorySlug);

    return (
      <section className={styles.page}>
        <div className={styles.articleShell}>
          <div className={styles.articleMain}>
            <div className={styles.breadcrumbs}>
              <Link to="/help-center">Help Center</Link>
              <ChevronRight size={14} />
              {articleCategory ? (
                <>
                  <Link to={`/help-center/category/${articleCategory.slug}`}>
                    {articleCategory.title}
                  </Link>
                  <ChevronRight size={14} />
                </>
              ) : null}
              <span>{selectedArticle.title}</span>
            </div>

            <div className={styles.articleHero}>
              <span className={styles.articleKicker}>
                {articleCategory?.title || "Support Article"}
              </span>
              <h1>{selectedArticle.title}</h1>
              <p>{selectedArticle.summary}</p>
              <div className={styles.articleMeta}>
                <span>Updated {selectedArticle.updatedAt}</span>
                <span>
                  Audience: {selectedArticle.audience.join(", ")}
                </span>
              </div>
            </div>

            <div className={styles.articleSections}>
              {selectedArticle.sections.map((section) => (
                <article key={section.id} id={section.id}>
                  <h2>{section.title}</h2>
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.checklist?.length ? (
                    <ul>
                      {section.checklist.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>

            <div className={styles.feedbackCard}>
              <div>
                <span className={styles.feedbackKicker}>Article feedback</span>
                <h3>Was this article helpful?</h3>
                <p>
                  Your feedback helps us improve support for future
                  learners and tutors.
                </p>
              </div>
              <div className={styles.feedbackActions}>
                <button
                  type="button"
                  className={
                    feedback === "yes" ? styles.feedbackActive : ""
                  }
                  onClick={() => setFeedback("yes")}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={
                    feedback === "no" ? styles.feedbackActive : ""
                  }
                  onClick={() => setFeedback("no")}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          <aside className={styles.articleAside}>
            <div className={styles.tocCard}>
              <span className={styles.cardKicker}>On this page</span>
              <div className={styles.tocLinks}>
                {selectedArticle.sections.map((section) => (
                  <a key={section.id} href={`#${section.id}`}>
                    {section.title}
                  </a>
                ))}
              </div>
            </div>

            <div className={styles.supportCard}>
              <div className={styles.supportIcon}>
                <LifeBuoy size={20} />
              </div>
              <span className={styles.cardKicker}>Need a human?</span>
              <h3>Contact Support</h3>
              <p>
                Use support for payment issues, session mismatches, or
                anything you cannot fix from the app.
              </p>
              <Link to={supportLink} className={styles.supportButton}>
                <Mail size={16} />
                Contact Support
              </Link>
              <span className={styles.supportHint}>
                Include the course title, session date, or recharge
                amount for faster help.
              </span>
            </div>

            {relatedArticles.length ? (
              <div className={styles.relatedCard}>
                <span className={styles.cardKicker}>Related articles</span>
                <div className={styles.relatedLinks}>
                  {relatedArticles.map((article) => (
                    <Link
                      key={article.slug}
                      to={`/help-center/article/${article.slug}`}
                    >
                      {article.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.heroKicker}>SkillSphere Help Center</span>
          <h1>Support that feels built into the product</h1>
          <p>
            Find quick answers about sessions, SkillCoin, tutor tools,
            messages, reviews, and account safety without leaving your
            workflow.
          </p>
        </div>

        <div className={styles.searchCard}>
          <div className={styles.searchInput}>
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search help topics, booking rules, SkillCoin, or support articles"
            />
          </div>
          <div className={styles.quickTags}>
            {["Session request", "SkillCoin lock", "Reviews", "Messages"].map(
              (term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                >
                  {term}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className={styles.bodyGrid}>
        <div className={styles.mainColumn}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionKicker}>Browse by category</span>
              <h2>Start with the part of the product you’re using</h2>
            </div>
          </div>

          <div className={styles.categoryGrid}>
            {helpCategories.map((category) => {
              const Icon = category.icon;
              const count = helpArticles.filter(
                (article) => article.categorySlug === category.slug
              ).length;

              return (
                <Link
                  key={category.slug}
                  to={`/help-center/category/${category.slug}`}
                  className={`${styles.categoryCard} ${styles[category.accent]}`}
                >
                  <div className={styles.categoryIcon}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <strong>{category.title}</strong>
                    <p>{category.description}</p>
                  </div>
                  <span>{count} articles</span>
                </Link>
              );
            })}
          </div>

          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionKicker}>
                {selectedCategory ? selectedCategory.title : "Search results"}
              </span>
              <h2>
                {selectedCategory
                  ? selectedCategory.description
                  : query
                    ? `Results for “${query}”`
                    : "Most helpful articles"}
              </h2>
            </div>
          </div>

          <div className={styles.articleList}>
            {(selectedCategory || query ? filteredArticles : popularArticles).map(
              (article) => (
                <Link
                  key={article.slug}
                  to={`/help-center/article/${article.slug}`}
                  className={styles.articleCard}
                >
                  <div>
                    <div className={styles.articleCardMeta}>
                      <span>
                        {getHelpCategory(article.categorySlug)?.title}
                      </span>
                      <span>Updated {article.updatedAt}</span>
                    </div>
                    <strong>{article.title}</strong>
                    <p>{article.summary}</p>
                  </div>
                  <ArrowRight size={18} />
                </Link>
              )
            )}

            {(selectedCategory || query) && filteredArticles.length === 0 ? (
              <div className={styles.emptyState}>
                <Sparkles size={20} />
                <strong>No direct matches yet</strong>
                <p>
                  Try searching for broader product terms like
                  sessions, messages, SkillCoin, wallet, tutor, or
                  reviews.
                </p>
                <Link to="/support" className={styles.inlineSupportLink}>
                  Contact Support instead
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <aside className={styles.sideColumn}>
          <div className={styles.supportCard}>
            <div className={styles.supportIcon}>
              <LifeBuoy size={20} />
            </div>
            <span className={styles.cardKicker}>Support CTA</span>
            <h3>Still stuck?</h3>
            <p>
              Reach out when the issue involves a payment, a broken
              session state, or anything account-specific.
            </p>
            <Link to="/support" className={styles.supportButton}>
              <Mail size={16} />
              Contact Support
            </Link>
          </div>

          <div className={styles.miniCard}>
            <span className={styles.cardKicker}>Popular right now</span>
            <div className={styles.miniLinks}>
              {popularArticles.map((article) => (
                <Link
                  key={article.slug}
                  to={`/help-center/article/${article.slug}`}
                >
                  {article.title}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default HelpCenter;
