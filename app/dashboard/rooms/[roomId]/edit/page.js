import RoomAdminForm from "../../../../components/RoomAdminForm";

export const metadata = {
  title: "Edit room",
  robots: { index: false, follow: false }
};

export default function EditRoomPage({ params }) {
  return <RoomAdminForm roomId={params.roomId} />;
}
