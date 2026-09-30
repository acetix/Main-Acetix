export default function SkeletonCard() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="aspect-[16/10] w-full rounded-3xl bg-sand" />
      <div className="mt-5 h-3 w-24 rounded-full bg-sand" />
      <div className="mt-3 h-5 w-2/3 rounded-full bg-sand" />
      <div className="mt-2 h-4 w-full rounded-full bg-sand" />
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-sand" />
        <div className="h-6 w-20 rounded-full bg-sand" />
      </div>
    </div>
  );
}
