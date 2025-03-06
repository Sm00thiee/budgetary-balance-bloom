import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CircleOff, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface InsightCardProps {
  title: string;
  value: number;
  target?: number;
  period?: string;
  status: 'positive' | 'negative' | 'neutral' | 'warning';
  insights: string[];
  className?: string;
  onClick?: () => void;
}

export const InsightCard = ({
  title,
  value,
  target,
  period = "This Month",
  status,
  insights,
  className,
  onClick,
}: InsightCardProps) => {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

  const formattedTarget = target ? new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(target) : null;

  const progressValue = target ? Math.min(Math.round((value / target) * 100), 100) : 0;

  const statusIcons = {
    positive: <TrendingUp className="h-5 w-5 text-green-500" />,
    negative: <TrendingDown className="h-5 w-5 text-red-500" />,
    neutral: <CircleOff className="h-5 w-5 text-gray-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  };

  const statusColors = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-gray-500",
    warning: "text-yellow-500",
  };

  return (
    <Card 
      className={cn("animate-fade-in overflow-hidden", 
        onClick ? "cursor-pointer transition-all hover:shadow-md" : "",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-5 w-5">{statusIcons[status]}</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{formattedValue}</div>
          <div className="text-xs text-muted-foreground">{period}</div>
          
          {target && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span>Progress to Target</span>
                <span className={cn(statusColors[status], "font-medium")}>
                  {progressValue}%
                </span>
              </div>
              <Progress value={progressValue} className="h-1.5" />
              <div className="text-xs text-muted-foreground">
                Target: {formattedTarget}
              </div>
            </div>
          )}
          
          {insights.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs font-medium mb-2">Key Insights:</p>
              <ul className="space-y-1">
                {insights.map((insight, index) => (
                  <li key={index} className="text-xs flex items-start">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 