import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function getApiUrl(): string {
  return String(`${process.env.NEXT_PUBLIC_API_URL}/api`);
}

export function getMainAppUrl(): string {
  return String(`${process.env.NEXT_PUBLIC_MAIN_APP_URL}/dashboard`);
}
