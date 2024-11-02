import Image from "next/image";

export default function Home() {
  return (
    <main className="w-full">
      <h1>Welcome to the dashboard</h1>
      <Image alt="Next.js Logo" height={200} src="/nextjs.svg" width={200} />
    </main>
  );
}
