import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "../../components/SiteChrome";
import { stories } from "../../../lib/stories";

export function generateStaticParams() {
  return stories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }) {
  const story = stories.find((item) => item.slug === params.slug);
  return story ? { title: story.title, description: story.excerpt } : {};
}

export default function StoryPage({ params }) {
  const story = stories.find((item) => item.slug === params.slug);
  if (!story) notFound();

  return (
    <PageShell>
      <article className="story-detail content-width">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/blog">Journal</Link><span>/</span><span>{story.category}</span></nav>
        <header className="story-detail-heading">
          <p className="eyebrow">{story.category}</p>
          <h1>{story.title}</h1>
          <p className="story-detail-meta">{story.date} <span>·</span> {story.readTime}</p>
          <p className="story-detail-excerpt">{story.excerpt}</p>
        </header>
        <img className="story-detail-image" src={story.image} alt="" />
        <div className="story-body">
          {story.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <Link className="editorial-text-link" href="/blog">← Back to the journal</Link>
        </div>
      </article>
    </PageShell>
  );
}
