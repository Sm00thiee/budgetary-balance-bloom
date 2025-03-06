import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, formatDate, displayValue } from "@/lib/table-utils";
import { ArrowUpCircle, ArrowDownCircle, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  // Log transactions to help debug
  console.log("Transactions in history component:", transactions);

  // State for transaction filtering
  const [filter, setFilter] = useState<string>("all");
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);
  
  // Transaction summary statistics
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    totalSpending: 0,
    earningsCount: 0,
    spendingCount: 0
  });
  
  // Update filtered transactions when filter or transactions change
  useEffect(() => {
    let filtered = [...transactions];
    
    if (filter === "spending") {
      filtered = transactions.filter(t => t.type === "Spending");
    } else if (filter === "earnings") {
      filtered = transactions.filter(t => t.type === "Earning");
    }
    
    setFilteredTransactions(filtered);
    
    // Calculate summary statistics
    const earningsTransactions = transactions.filter(t => t.type === "Earning");
    const spendingTransactions = transactions.filter(t => t.type === "Spending");
    
    setSummary({
      totalEarnings: earningsTransactions.reduce((sum, t) => sum + t.amount, 0),
      totalSpending: spendingTransactions.reduce((sum, t) => sum + t.amount, 0),
      earningsCount: earningsTransactions.length,
      spendingCount: spendingTransactions.length
    });
  }, [transactions, filter]);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <Select
            value={filter}
            onValueChange={setFilter}
          >
            <SelectTrigger className="w-[150px] h-8">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="spending">Spending Only</SelectItem>
              <SelectItem value="earnings">Earnings Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs p-2 rounded-md bg-muted/30">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Earnings ({summary.earningsCount})</span>
            <span className="font-medium text-green-600">{formatCurrency(summary.totalEarnings)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Spending ({summary.spendingCount})</span>
            <span className="font-medium text-red-600">{formatCurrency(summary.totalSpending)}</span>
          </div>
        </div>
      </div>
      
      <ScrollArea className="h-[250px]">
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No {filter !== "all" ? filter : ""} transactions found
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-2 rounded-lg hover:bg-accent ${
                  transaction.type === "Spending" ? "border-l-2 border-red-400" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {transaction.type === "Earning" ? (
                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 text-red-500" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {displayValue(transaction.description)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.date)} • {transaction.category || transaction.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-sm font-medium ${transaction.type === "Earning" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "Earning" ? "+" : "-"}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
