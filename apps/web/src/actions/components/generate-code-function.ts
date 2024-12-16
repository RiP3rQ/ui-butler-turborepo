"use server";

import { cookies } from "next/headers";
import { type CodeType, type ComponentType } from "@repo/types";
import { getErrorMessage } from "@/lib/get-error-message";

export interface GenerateCodeFunctionProps {
  componentId: number;
  codeType: CodeType;
}

export async function generateCodeFunction({
  componentId,
  codeType,
}: Readonly<GenerateCodeFunctionProps>): Promise<ComponentType> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/components/generate-code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify({
          componentId,
          codeType,
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to generate ${codeType}`);
    }

    return (await res.json()) as ComponentType;
  } catch (error) {
    console.error(error);
    throw new Error(getErrorMessage(error));
  }
}
