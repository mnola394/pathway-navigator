import { cn } from "@/lib/utils";

interface SmilesBadgeProps {
  smiles: string;
  label?: string;
  variant?: "default" | "reactant" | "product" | "solvent" | "catalyst";
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: "bg-muted text-foreground",
  reactant: "bg-reaction/10 text-reaction border-reaction/20",
  product: "bg-compound/10 text-compound border-compound/20",
  solvent: "bg-solvent/10 text-solvent border-solvent/20",
  catalyst: "bg-catalyst/10 text-catalyst border-catalyst/20",
};

export function SmilesBadge({
  smiles,
  label,
  variant = "default",
  className,
  onClick,
}: SmilesBadgeProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono border",
        variantStyles[variant],
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
    >
      {label ? (
        <>
          <span className="font-sans font-medium">{label}</span>
          <span className="text-muted-foreground">({smiles})</span>
        </>
      ) : (
        smiles
      )}
    </span>
  );
}
