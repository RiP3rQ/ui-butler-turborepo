import { setupUser } from "@/actions/billing/setup-user";

const SetupPage = async () => {
  await setupUser();
};
export default SetupPage;
