import { redirect } from "next/navigation";
import { setupUser } from "@/actions/billing/server-actions";

export default async function SetupPage(): Promise<void> {
  try {
    await setupUser();
  } catch (e) {
    console.error(e);
    throw new Error("Failed to setup user");
  }
  redirect("/dashboard");
}
