export default function ProtectedLoading() {
  return (
    <div className="grid gap-4">
      <div className="h-24 animate-pulse rounded-[28px] border border-white/10 bg-white/5" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-[28px] border border-white/10 bg-white/5"
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-[28px] border border-white/10 bg-white/5" />
        <div className="h-72 animate-pulse rounded-[28px] border border-white/10 bg-white/5" />
      </div>
    </div>
  );
}
