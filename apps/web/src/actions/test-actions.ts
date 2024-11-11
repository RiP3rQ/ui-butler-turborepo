"use server";

export async function testServerAction(): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(() => {
      console.log("Server action executed");
    }, 5000);
  });
}
