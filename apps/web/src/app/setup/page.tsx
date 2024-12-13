import { redirect } from "next/navigation";
import { setupUser } from "@/actions/billing/setup-user";

export default async function SetupPage(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    const user = await setupUser();
  } catch (e) {
    console.error(e);
    throw new Error("Failed to setup user");
  }
  redirect("/dashboard");
}
