import { describe, expect, it } from "vitest";
import { ARTICLE_TITLES, getRouteMetadata, SITE_ORIGIN } from "./routeMetadata";
import { POSTS } from "../pages/BlogPage";

/**
 * Metadata/content drift guard.
 *
 * `POSTS` is the rendered article list (authored RAW_POSTS with the
 * EDITORIAL_REVISIONS compliance overlay applied) and ARTICLE_TITLES drives the
 * indexed <title>, meta description, and Article JSON-LD name. A merge once let
 * these disagree for nine slugs, so the compliance-softened headline shipped in
 * search results while the page itself still showed the original claim.
 *
 * Any future title change must move both sides together or these tests fail.
 */
describe("article metadata matches rendered article content", () => {
  const renderedTitles = new Map(POSTS.map((post) => [post.slug, post.title]));
  const sharedSlugs = Object.keys(ARTICLE_TITLES).filter((slug) => renderedTitles.has(slug));

  it("covers slugs that actually exist on the blog", () => {
    expect(sharedSlugs.length).toBeGreaterThan(0);
    expect(sharedSlugs.length).toBe(Object.keys(ARTICLE_TITLES).length);
  });

  it.each(sharedSlugs)("indexes the displayed title for %s", (slug) => {
    expect(ARTICLE_TITLES[slug]).toBe(renderedTitles.get(slug));
  });

  it.each(sharedSlugs)("builds the route <title> from the displayed title for %s", (slug) => {
    const metadata = getRouteMetadata({ pathname: `/blog/${slug}`, view: "blog-post" });
    const displayed = renderedTitles.get(slug)!;

    expect(metadata.title).toBe(`${displayed} | Greenstreet Finance`);
    expect(metadata.description).toContain(displayed);
    expect(metadata.canonical).toBe(`${SITE_ORIGIN}/blog/${slug}`);
    expect(metadata.robots).toBe("index,follow");
  });

  it("never indexes an article title the blog does not render", () => {
    const orphans = Object.keys(ARTICLE_TITLES).filter((slug) => !renderedTitles.has(slug));
    expect(orphans).toEqual([]);
  });
});
