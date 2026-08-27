export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-32">
      <div className="w-full max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-label text-fg-muted">
          {"// foundation"}
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-fg sm:text-5xl">
          Radosław Siek
        </h1>
        <p className="mt-4 max-w-md text-fg-muted">
          Frontend engineer and programming coach. The site is being rebuilt —
          theme, fonts and tokens are in place.
        </p>
        <div className="mt-10 rounded-card border border-border bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-label text-accent">
            tokens live
          </p>
          <p className="mt-2 text-sm text-fg-muted">
            base · surface · surface-raised · border · fg · fg-muted · accent
          </p>
        </div>
      </div>
    </main>
  );
}
