import { SummaryCard } from "@/components/SummaryCard";
import { TransactionHistory } from "@/components/TransactionHistory";
import { FinanceChart } from "@/components/FinanceChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, Wallet, BanknoteIcon, DollarSign, UserCircle, HandCoins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "@/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";

const Index = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { data: summaryData } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: dashboardService.getSummary,
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: dashboardService.getTransactions,
  });

  const { data: chartData } = useQuery({
    queryKey: ['chartData', startDate, endDate],
    queryFn: () => dashboardService.getChartData({ 
      startDate, 
      endDate 
    }),
  });

  const processedChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    
    const sorted = [...chartData].sort((a, b) => 
      new Date(a.yearMonth).getTime() - new Date(b.yearMonth).getTime()
    );
    
    return sorted.map(item => ({
      name: item.name || '',
      earnings: Number(item.earnings) || 0,
      savings: Number(item.savings) || 0,
      loans: Number(item.loans) || 0,
      borrowings: Number(item.borrowings) || 0,
      spending: Number(item.spending) || 0,
      yearMonth: item.yearMonth
    }));
  }, [chartData]);

  console.log('Processed Chart Data:', processedChartData);

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
              onClick={() => navigate("/manage-borrowing")}
            >
              <HandCoins className="mr-2 h-4 w-4" />
              Manage Borrowing
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

        <div className="grid gap-4 md:grid-cols-5">
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
            title="Active Loans Given"
            amount={`$${summaryData?.activeLoans || 0}`}
            description="Next payment: $500 due Apr 1"
            className="bg-finance-lending hover:bg-finance-lending-dark transition-colors"
          >
            <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
          </SummaryCard>
          <SummaryCard
            title="Active Borrowings"
            amount={`$${summaryData?.activeBorrowings || 0}`}
            description={`${summaryData?.borrowingCount || 0} active borrowings`}
            className="bg-finance-borrowing hover:bg-finance-borrowing-dark transition-colors"
          >
            <HandCoins className="h-4 w-4 text-muted-foreground" />
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Financial Flow Overview</CardTitle>
                <div className="flex gap-4 items-center">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="startDate">From</Label>
                    <DatePicker
                      id="startDate"
                      date={startDate}
                      onSelect={setStartDate}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="endDate">To</Label>
                    <DatePicker
                      id="endDate"
                      date={endDate}
                      onSelect={setEndDate}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {processedChartData && processedChartData.length > 0 ? (
                  <FinanceChart
                    title="Financial Overview"
                    data={processedChartData}
                    lines={[
                      { key: "earnings", color: "#94A3B8" },
                      { key: "savings", color: "#D1E6B8" },
                      { key: "loans", color: "#FFB4B4" },
                      { key: "borrowings", color: "#FFD1B8" },
                      { key: "spending", color: "#FFE4B8" }
                    ]}
                  />
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    No data available for the selected period
                  </div>
                )}
              </CardContent>
            </Card>
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
