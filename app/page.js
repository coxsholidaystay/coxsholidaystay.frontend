import HotelFinder from "./components/HotelFinder";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import TourCard from "./components/TourCard";
import { hotels } from "../lib/hotels";
import { tours } from "../lib/tours";

const destinations = [
  {
    name: "Maldives",
    description: "Island days, a world away",
    stays: "48 stays",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Amalfi Coast",
    description: "A little Italian dolce vita",
    stays: "32 stays",
    image:
      "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Bali",
    description: "Find your own kind of calm",
    stays: "64 stays",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80"
  }
];

export default function HomePage() {
  return (
    <main>
      <SiteHeader />

      <section className="hero" aria-labelledby="hero-title">
        <img
          className="hero-image"
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2200&q=85"
          alt="A private island villa overlooking a calm turquoise sea"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">
            <span /> YOUR NEXT CHAPTER STARTS HERE
          </p>
          <h1 id="hero-title">
            Find your place
            <br />
            in the <em>beautiful.</em>
          </h1>
          <p className="hero-copy">
            Extraordinary stays for the moments
            <br className="desktop-break" /> you&apos;ll remember forever.
          </p>
          <a className="hero-link" href="#stays">
            Explore stays <span aria-hidden="true">↓</span>
          </a>
        </div>
        <p className="image-caption">The private island collection · Maldives</p>
      </section>

      <section className="search-wrap" id="stays" aria-label="Find a stay">
        <HotelFinder initialHotels={hotels} />
      </section>

      <section className="intro-section content-width" id="our-way">
        <p className="eyebrow">A MORE PERSONAL WAY TO GET AWAY</p>
        <div className="intro-row">
          <h2>
            Not just anywhere.
            <br />
            <em>Somewhere special.</em>
          </h2>
          <p className="intro-copy">
            The best trips begin with the right place to stay. We bring
            together distinctive hotels and characterful hideaways, so you can
            spend less time searching and more time looking forward.
          </p>
        </div>
      </section>

      <section
        className="destinations-section content-width"
        id="destinations"
        aria-labelledby="destinations-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">PLACES TO FALL FOR</p>
            <h2 id="destinations-title">Where to next?</h2>
          </div>
          <a href="#stays" className="text-link">
            Find your destination <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="destination-grid">
          {destinations.map((destination, index) => (
            <a
              className={`destination-card destination-card-${index + 1}`}
              href="#stays"
              key={destination.name}
              aria-label={`Explore ${destination.name}, ${destination.stays}`}
            >
              <img src={destination.image} alt="" loading="lazy" />
              <span className="destination-shade" />
              <span className="destination-info">
                <span className="destination-count">{destination.stays}</span>
                <span className="destination-name">{destination.name}</span>
                <span className="destination-description">
                  {destination.description}
                </span>
              </span>
              <span className="destination-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="tour-feature-section" id="tour-packages" aria-labelledby="tour-feature-title">
        <div className="content-width">
          <div className="section-heading">
            <div>
              <p className="eyebrow">GO A LITTLE FURTHER</p>
              <h2 id="tour-feature-title">A trip with a little more thought</h2>
            </div>
            <Link href="/tours" className="text-link">Explore all tour packages <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="editorial-grid tour-feature-grid">
            {tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
          </div>
        </div>
      </section>

      <section className="promise-section" aria-label="The Cox's difference">
        <div className="content-width promise-grid">
          <div className="promise-intro">
            <p className="eyebrow">THE COX&apos;S DIFFERENCE</p>
            <h2>Considered stays.<br /><em>Carefree days.</em></h2>
          </div>
          <article className="promise-item">
            <span className="promise-number">01</span>
            <h3>Chosen with care</h3>
            <p>Distinctive places with a sense of place, not just a place to sleep.</p>
          </article>
          <article className="promise-item">
            <span className="promise-number">02</span>
            <h3>Room to be you</h3>
            <p>From slow mornings to big adventures, find a stay that feels like yours.</p>
          </article>
          <article className="promise-item">
            <span className="promise-number">03</span>
            <h3>Here when you need us</h3>
            <p>A thoughtful team to help make planning feel a little more effortless.</p>
          </article>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
