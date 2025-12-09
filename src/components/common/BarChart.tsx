import { cn } from "@/lib/utils";

interface BarChartProps {
  data: { name: string; value: number; percentage: number }[];
  colorClass?: string;
  maxBars?: number;
}

export function BarChart({ data, colorClass = "bg-primary", maxBars = 8 }: BarChartProps) {
  const displayData = data.slice(0, maxBars);
  const maxValue = Math.max(...displayData.map((d) => d.percentage));

  return (
    <div className="space-y-3">
      {displayData.map((item, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{item.name}</span>
            <span className="text-muted-foreground font-mono text-xs">
              {item.value.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", colorClass)}
              style={{ width: `${(item.percentage / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
