import RoomDetails from "./RoomDetails";

export async function generateMetadata({ params }) {
  return {
    title: params.roomId.replaceAll("-", " "),
    description: "Explore room details, amenities, policies, and availability."
  };
}

export default function RoomDetailsPage({ params }) {
  return <RoomDetails roomId={params.roomId} />;
}
