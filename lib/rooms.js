import { hotels } from "./hotels";

const roomStyles = [
  { name: "Garden Suite", type: "King bed · Garden view", capacity: 2, extra: 0 },
  { name: "Private Pool Villa", type: "King bed · Private pool", capacity: 3, extra: 145 },
  { name: "Overwater Residence", type: "King bed · Ocean view", capacity: 2, extra: 220 },
  { name: "Coastal Deluxe", type: "King bed · Sea view", capacity: 2, extra: 55 },
  { name: "Terrace Suite", type: "Queen bed · Private terrace", capacity: 2, extra: 85 },
  { name: "Forest Hideaway", type: "King bed · Forest view", capacity: 3, extra: 35 }
];

export const rooms = hotels.map((hotel, index) => {
  const style = roomStyles[index];
  return {
    id: `${hotel.id}-${style.name.toLowerCase().replaceAll(" ", "-")}`,
    hotelId: hotel.id,
    hotelName: hotel.name,
    location: hotel.location,
    name: style.name,
    type: style.type,
    capacity: style.capacity,
    price: hotel.price + style.extra,
    image: hotel.image,
    imageAlt: hotel.imageAlt,
    rating: hotel.rating
  };
});
