
import { SummaryCard } from "@/components/SummaryCard";
import { TransactionHistory } from "@/components/TransactionHistory";
import { FinanceChart } from "@/components/FinanceChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, Wallet, BanknoteIcon, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  {
    name: "Jan",
    earnings: 5000,
    savings: 1200,
    loans: 800,
    spending: 2400,
  },
  {
    name: "Feb",
    earnings: 5200,
    savings: 1800,
    loans: 700,
    spending: 2100,
  },
  {
    name: "Mar",
    earnings: 5500,
    savings: 2400,
    loans: 600,
    spending: 1900,
  },
  {
    name: "Apr",
    earnings: 5800,
    savings: 2800,
    loans: 500,
    spending: 1800,
  },
  {
    name: "May",
    earnings: 6000,
    savings: 3200,
    loans: 400,
    spending: 1700,
  },
  {
    name: "Jun",
    earnings: 6200,
    savings: 3800,
    loans: 300,
    spending: 1600,
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/manage-savings")}
            >
              <PiggyBank className="mr-2 h-4 w-4" />
              Manage Savings
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/manage-spending")}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Manage Spending
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/manage-lending")}
            >
              <BanknoteIcon className="mr-2 h-4 w-4" />
              Manage Lending
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <SummaryCard
            title="Monthly Earnings"
            amount="$6,200"
            description="+5.2% from last month"
            className="bg-finance-earnings hover:bg-finance-earnings-dark transition-colors"
          >
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </SummaryCard>
          <SummaryCard
            title="Total Savings"
            amount="$3,800"
            description="+20.1% from last month"
            className="bg-finance-savings hover:bg-finance-savings-dark transition-colors"
          >
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </SummaryCard>
          <SummaryCard
            title="Active Loans"
            amount="$12,000"
            description="Next payment: $500 due Apr 1"
            className="bg-finance-lending hover:bg-finance-lending-dark transition-colors"
          >
            <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
          </SummaryCard>
          <SummaryCard
            title="Monthly Spending"
            amount="$2,450"
            description="75% of monthly budget"
            className="bg-finance-spending hover:bg-finance-spending-dark transition-colors"
          >
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </SummaryCard>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="md:col-span-4">
            <FinanceChart
              title="Financial Flow Overview"
              data={mockChartData}
              lines={[
                { key: "earnings", color: "#94A3B8" },
                { key: "savings", color: "#D1E6B8" },
                { key: "loans", color: "#FFB4B4" },
                { key: "spending", color: "#FFE4B8" }
              ]}
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
