import { cn } from "@/lib/utils";

interface ReactionBadgeProps {
  reactionId: string;
  onClick?: () => void;
  className?: string;
}

export function ReactionBadge({ reactionId, onClick, className }: ReactionBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-md text-xs font-mono",
        "bg-reaction text-reaction-foreground",
        "hover:bg-reaction/90 transition-colors cursor-pointer",
        className
      )}
    >
      [{reactionId}]
    </button>
  );
}
