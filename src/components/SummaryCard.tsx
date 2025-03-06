import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SummaryCardProps {
  title: string;
  amount: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: React.ReactNode;
}

export const SummaryCard = ({
  title,
  amount,
  description,
  trend,
  action,
  className,
  children,
}: SummaryCardProps) => {
  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {children && <div className="h-4 w-4">{children}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">{amount}</div>
          {trend && (
            <div className={cn("flex items-center text-xs font-medium", 
              trend.isPositive ? "text-green-500" : "text-red-500")}>
              {trend.isPositive ? (
                <ArrowUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 mr-1" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {action && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={action.onClick}
            className="mt-2 w-full text-xs p-1 h-8"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
