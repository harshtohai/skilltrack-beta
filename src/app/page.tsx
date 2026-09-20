import Link from "next/link";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1A1C1E] to-[#2d2f31] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          OutcomeTrack
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl text-center">
          Longitudinal skilling outcomes and impact measurement system.
          Track employment outcomes, validate employer data, and measure programme impact.
        </p>
        <div className="flex flex-col items-center gap-4">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20 transition-colors"
            href="/dashboard"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">Dashboard →</h3>
            <div className="text-lg">View cohort outcomes and KPIs</div>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20 transition-colors"
            href="/simulator"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">WhatsApp Simulator →</h3>
            <div className="text-lg">Test the conversation flow</div>
          </Link>
        </div>
      </div>
    </main>
  );
}