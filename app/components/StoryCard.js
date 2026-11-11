import Link from "next/link";

export default function StoryCard({ story, featured = false }) {
  return (
    <article className={`editorial-card story-card${featured ? " story-card-featured" : ""}`}>
      <Link className="editorial-card-image" href={`/blog/${story.slug}`} aria-label={`Read ${story.title}`}>
        <img src={story.image} alt="" loading="lazy" />
        <span className="editorial-image-tag">{story.category}</span>
      </Link>
      <div className="editorial-card-content">
        <p className="editorial-meta">{story.date} <span>·</span> {story.readTime}</p>
        <h3><Link href={`/blog/${story.slug}`}>{story.title}</Link></h3>
        <p className="editorial-description">{story.excerpt}</p>
        <Link className="editorial-text-link" href={`/blog/${story.slug}`}>Read the story <span aria-hidden="true">↗</span></Link>
      </div>
    </article>
  );
}
