import { PageShell } from "../components/SiteChrome";
import TourCard from "../components/TourCard";
import { tours } from "../../lib/tours";

export const metadata = {
  title: "Tour packages",
  description: "Explore thoughtfully paced escapes, from island days to coastal journeys."
};

export default function ToursPage() {
  return (
    <PageShell>
      <section className="page-hero tours-page-hero">
        <div className="page-hero-content">
          <p className="eyebrow hero-eyebrow"><span /> A LITTLE MORE THAN A GETAWAY</p>
          <h1>Journeys with room <em>to feel.</em></h1>
          <p>Thoughtful escapes that leave space for the places, people, and moments along the way.</p>
          <a className="hero-link" href="#tour-collection">Explore the journeys <span aria-hidden="true">↓</span></a>
        </div>
      </section>
      <section className="listing-section content-width" id="tour-collection">
        <div className="section-heading">
          <div><p className="eyebrow">A FEW WAYS TO GET AWAY</p><h2>Choose your kind of escape</h2></div>
          <span className="listing-count">Made for going your own way</span>
        </div>
        <div className="editorial-grid tour-grid">
          {tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
        </div>
      </section>
      <section className="tour-note-band">
        <p className="eyebrow">GOOD TRIPS BEGIN WITH A CONVERSATION</p>
        <h2>Have somewhere in mind?</h2>
        <p>These are just a few ideas. We can help you find the right pace and place for your next trip.</p>
        <a className="text-link" href="mailto:hello@coxsholidaystay.com">Tell us what you’re dreaming of <span aria-hidden="true">↗</span></a>
      </section>
    </PageShell>
  );
}
