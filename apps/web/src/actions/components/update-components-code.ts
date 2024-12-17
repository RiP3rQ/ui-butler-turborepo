"use server";

import { cookies } from "next/headers";
import { type CodeType, type ComponentType } from "@repo/types";
import { getErrorMessage } from "@/lib/get-error-message";

interface UpdateComponentCodeParams {
  componentId: number;
  codeType: CodeType;
  content: string;
}

export async function updateComponentCode({
  componentId,
  codeType,
  content,
}: UpdateComponentCodeParams): Promise<ComponentType> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/components/${String(componentId)}/${codeType}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify({ content }),
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to update ${codeType}`);
    }

    return (await res.json()) as ComponentType;
  } catch (error) {
    console.error(error);
    throw new Error(getErrorMessage(error));
  }
}
