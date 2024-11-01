import { cookies } from "next/headers";

export const isUserLoggerIn = async (): Promise<boolean> => {
  const cookieStore = await cookies();
  const isUserLoggedIn = cookieStore.get("Authentication");

  if (!isUserLoggedIn) {
    return false;
  }
  return true;
};
