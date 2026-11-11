import Link from "next/link";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(price);
}

export default function TourCard({ tour }) {
  return (
    <article className="editorial-card tour-card" id={tour.id}>
      <Link className="editorial-card-image" href={`/tours#${tour.id}`} aria-label={`Explore ${tour.title}`}>
        <img src={tour.image} alt="" loading="lazy" />
        <span className="editorial-image-tag">{tour.category}</span>
      </Link>
      <div className="editorial-card-content">
        <p className="editorial-meta">{tour.destination} <span>·</span> {tour.duration}</p>
        <h3><Link href={`/tours#${tour.id}`}>{tour.title}</Link></h3>
        <p className="editorial-description">{tour.description}</p>
        <div className="editorial-card-bottom">
          <p>From <strong>{formatPrice(tour.price)}</strong> <span>/ person</span></p>
          <Link className="editorial-arrow-link" href={`/tours#${tour.id}`} aria-label={`View ${tour.title}`}>↗</Link>
        </div>
      </div>
    </article>
  );
}
