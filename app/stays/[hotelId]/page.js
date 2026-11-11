import HotelDetailsClient from "./HotelDetailsClient";
import { hotels } from "../../../lib/hotels";

const hotelNotes = {
  "casa-del-mar": {
    intro: "A sun-washed hideaway on Italy’s storied coastline, where the sea is always in view and the days move at their own gentle pace.",
    highlights: ["Steps from the water", "Breakfast made with local produce", "Terrace overlooking the coast"]
  },
  "the-palm-house": {
    intro: "A private tropical retreat tucked among Ubud’s palms, designed for slow mornings, cool dips, and a little more breathing room.",
    highlights: ["Private pool", "Surrounded by tropical gardens", "Easy access to Ubud"]
  },
  "azure-bay": {
    intro: "An overwater escape surrounded by the clear blues of the North Malé Atoll, with island life just beyond your doorstep.",
    highlights: ["Overwater villa setting", "Direct ocean access", "Quiet island atmosphere"]
  },
  "cove-and-cliff": {
    intro: "A coastal hideaway in Cox’s Bazar for long beach walks, warm hospitality, and evenings that end with the sound of the sea.",
    highlights: ["Near the shoreline", "Relaxed coastal dining", "A thoughtful local welcome"]
  },
  "casa-luce": {
    intro: "Whitewashed calm and wide caldera views make this Santorini stay a lovely place to slow down and take in the Aegean light.",
    highlights: ["Caldera-facing views", "Private terrace", "Sunset-facing setting"]
  },
  "the-wildwood": {
    intro: "A quiet lodge framed by northern Thailand’s greenery, made for restorative mornings and days spent close to nature.",
    highlights: ["Forest-fringed setting", "Peaceful outdoor spaces", "A restful base near Chiang Mai"]
  }
};

export function generateStaticParams() {
  return hotels.map((hotel) => ({ hotelId: hotel.id }));
}

export async function generateMetadata({ params }) {
  const hotel = hotels.find((item) => item.id === params.hotelId);
  return hotel ? { title: hotel.name, description: hotel.imageAlt } : {};
}

export default function HotelDetailsPage({ params }) {
  return (
    <HotelDetailsClient
      hotelId={params.hotelId}
      initialHotel={hotels.find((item) => item.id === params.hotelId) || null}
      initialHotels={hotels}
      hotelNotes={hotelNotes}
    />
  );
}
