
import { SummaryCard } from "@/components/SummaryCard";
import { TransactionHistory } from "@/components/TransactionHistory";
import { FinanceChart } from "@/components/FinanceChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

const mockTransactions = [
  {
    id: "1",
    date: "2024-03-20",
    description: "Savings deposit",
    amount: 1000,
    category: "Savings",
  },
  {
    id: "2",
    date: "2024-03-19",
    description: "Loan payment",
    amount: -500,
    category: "Lending",
  },
  {
    id: "3",
    date: "2024-03-18",
    description: "Grocery shopping",
    amount: -150,
    category: "Spending",
  },
];

const mockChartData = [
  { name: "Jan", amount: 1200 },
  { name: "Feb", amount: 1800 },
  { name: "Mar", amount: 2400 },
  { name: "Apr", amount: 2800 },
  { name: "May", amount: 3200 },
  { name: "Jun", amount: 3800 },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            title="Total Savings"
            amount="$3,800"
            description="+20.1% from last month"
            className="bg-finance-savings hover:bg-finance-savings-dark transition-colors"
          />
          <SummaryCard
            title="Active Loans"
            amount="$12,000"
            description="Next payment: $500 due Apr 1"
            className="bg-finance-lending hover:bg-finance-lending-dark transition-colors"
          />
          <SummaryCard
            title="Monthly Spending"
            amount="$2,450"
            description="75% of monthly budget"
            className="bg-finance-spending hover:bg-finance-spending-dark transition-colors"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="md:col-span-4">
            <FinanceChart
              title="Savings Growth"
              data={mockChartData}
              color="#D1E6B8"
            />
          </div>
          <div className="md:col-span-3">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionHistory transactions={mockTransactions} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
