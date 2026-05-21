import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/expert-lab/lib/utils";


interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  trend = "neutral",
  variant = "default",
  className
}: StatsCardProps) {
  const variantStyles = {
    default: "border-border",
    success: "border-ai-emerald/30 bg-ai-emerald/5",
    warning: "border-ai-amber/30 bg-ai-amber/5",
    danger: "border-ai-red/30 bg-ai-red/5"
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-card hover:border-primary/30",
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-ai-blue">
          <Icon className="w-5 h-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change &&
        <p className={cn(
          "text-xs",
          trend === "up" ? "text-ai-emerald" :
          trend === "down" ? "text-ai-red" : "text-muted-foreground"
        )}>
            {trend === "up" ? "+" : trend === "down" ? "" : ""}{change}
          </p>
        }
      </CardContent>
    </Card>);

}