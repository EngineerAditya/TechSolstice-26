import { cn } from "@/lib/utils";

type PassCardProps = {
  name: string;
  mahe: boolean;
  eventId: string | null;
  className?: string;
};

export function PassCard({ name, mahe, eventId, className }: PassCardProps) {
  // Derive styling based on the 'mahe' boolean
  const isMahe = mahe === true;
  
  const gradientClasses = cn(
    "h-32 bg-gradient-to-r p-6 flex items-end",
    isMahe 
      ? "from-purple-900 to-purple-600" // MAHE theme
      : "from-blue-900 to-blue-600"     // General theme
  );

  const badgeLabel = isMahe ? "MAHE EXCLUSIVE" : "GENERAL ACCESS";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/80 text-white backdrop-blur",
        className
      )}
    >
      <div className={gradientClasses}>
        <span className="rounded bg-black/30 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm">
          {badgeLabel}
        </span>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <h4 className="text-xl font-bold">{name}</h4>
          {eventId && (
            <p className="mt-2 text-xs font-mono text-gray-500 truncate">
              Event ID: {eventId}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {isMahe ? "University ID Required" : "Open to All"}
          </span>
          <button
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black transition active:scale-95 hover:bg-gray-200"
            type="button"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}