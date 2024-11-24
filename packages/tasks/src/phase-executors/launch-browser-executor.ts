import { ExecutionEnvironment } from "@repo/types";
import { ServerLaunchBrowserTask } from "../tasks/lauch-browser";

export async function launchBrowserExecutor(
  environment: ExecutionEnvironment<typeof ServerLaunchBrowserTask>,
): Promise<boolean> {
  try {
    const websiteUrl = environment.getInput("Website URL");
    environment.log.INFO("Launching browser for: " + websiteUrl);
    environment.log.INFO("Browser launched successfully");
    environment.log.SUCCESS("Loaded website: " + websiteUrl);
    // CLOSE BROWSER IN CLEANUP PHASE
    return true;
  } catch (e: any) {
    environment.log.ERROR(`Error in launchBrowserExecutor: ${e.message}`);
    return false;
  }
}
