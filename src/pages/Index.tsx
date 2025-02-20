
import { SummaryCard } from "@/components/SummaryCard";
import { TransactionHistory } from "@/components/TransactionHistory";
import { FinanceChart } from "@/components/FinanceChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, Wallet, BanknoteIcon, DollarSign, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "@/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const navigate = useNavigate();

  const { data: summaryData } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: dashboardService.getSummary,
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: dashboardService.getTransactions,
  });

  const { data: chartData } = useQuery({
    queryKey: ['chartData'],
    queryFn: dashboardService.getChartData,
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/manage-earnings")}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Manage Earnings
            </Button>
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
            <Button
              variant="outline"
              onClick={() => navigate("/profile")}
            >
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <SummaryCard
            title="Monthly Earnings"
            amount={`$${summaryData?.monthlyEarnings || 0}`}
            description="+5.2% from last month"
            className="bg-finance-earnings hover:bg-finance-earnings-dark transition-colors"
          >
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </SummaryCard>
          <SummaryCard
            title="Total Savings"
            amount={`$${summaryData?.totalSavings || 0}`}
            description="+20.1% from last month"
            className="bg-finance-savings hover:bg-finance-savings-dark transition-colors"
          >
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </SummaryCard>
          <SummaryCard
            title="Active Loans"
            amount={`$${summaryData?.activeLoans || 0}`}
            description="Next payment: $500 due Apr 1"
            className="bg-finance-lending hover:bg-finance-lending-dark transition-colors"
          >
            <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
          </SummaryCard>
          <SummaryCard
            title="Monthly Spending"
            amount={`$${summaryData?.monthlySpending || 0}`}
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
              data={chartData || []}
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
                <TransactionHistory transactions={transactions || []} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
