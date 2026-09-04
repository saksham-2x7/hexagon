import { redirect } from "next/navigation";

export default function RootPage() {
  // Directly redirect to home for now until auth is wired
  redirect("/home");
}
