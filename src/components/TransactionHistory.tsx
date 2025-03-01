import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

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
                  {format(new Date(transaction.date), "MMM d, yyyy")}
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
