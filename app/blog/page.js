import { PageShell } from "../components/SiteChrome";
import StoryCard from "../components/StoryCard";
import { stories } from "../../lib/stories";

export const metadata = {
  title: "The journal",
  description: "Destination notes, travel inspiration, and considered ways to get away."
};

export default function BlogPage() {
  const [featured, ...moreStories] = stories;
  return (
    <PageShell>
      <section className="journal-intro content-width">
        <p className="eyebrow">NOTES FOR THE ROAD</p>
        <h1>A little inspiration <em>for somewhere new.</em></h1>
        <p>Destination notes, thoughtful ideas, and stories to help you look forward to getting away.</p>
      </section>
      <section className="listing-section content-width journal-section">
        <StoryCard story={featured} featured />
        <div className="journal-rest">
          <div className="section-heading"><div><p className="eyebrow">FROM OUR JOURNAL</p><h2>Stories to take with you</h2></div></div>
          <div className="editorial-grid story-grid">
            {moreStories.map((story) => <StoryCard key={story.slug} story={story} />)}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
