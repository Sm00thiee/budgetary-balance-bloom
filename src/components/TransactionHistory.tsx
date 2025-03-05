import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO, isValid } from "date-fns";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  category?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

// Helper function to safely format dates
const safeFormatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "N/A";
  
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "MMM d, yyyy") : "N/A";
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

export const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No recent transactions
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {transaction.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {safeFormatDate(transaction.date)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">
                  ${transaction.amount.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {transaction.type}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};
