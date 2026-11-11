import RoomAdminForm from "../../../components/RoomAdminForm";

export const metadata = {
  title: "Add a room",
  robots: { index: false, follow: false }
};

export default function NewRoomPage() {
  return <RoomAdminForm />;
}
