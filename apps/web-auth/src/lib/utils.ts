import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function getApiUrl(): string {
  return String(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api");
}

export function getMainAppUrl(): string {
  return String(
    process.env.NEXT_PUBLIC_MAIN_APP_URL ?? "http://localhost:3001/dashboard",
  );
}
