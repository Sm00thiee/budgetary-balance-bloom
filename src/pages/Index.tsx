import { SummaryCard } from "@/components/SummaryCard";
import { InsightCard } from "@/components/InsightCard";
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

  // Calculate monthly budget based on earnings
  const monthlyBudget = useMemo(() => {
    if (!summaryData) return 0;
    return summaryData.monthlyEarnings * 0.75; // 75% of monthly earnings
  }, [summaryData]);

  // Calculate budget percentage
  const budgetPercentage = useMemo(() => {
    if (!summaryData || !monthlyBudget || monthlyBudget === 0) return 0;
    return Math.round((summaryData.monthlySpending / monthlyBudget) * 100);
  }, [summaryData, monthlyBudget]);

  // Format currency values
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "$0.00";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  // Calculate spending percentages by category
  const spendingBreakdown = useMemo(() => {
    if (!transactions) return [];
    
    const spendingTransactions = transactions.filter(t => t.type === 'Spending');
    const totalSpending = spendingTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const categories: Record<string, number> = {};
    spendingTransactions.forEach(t => {
      const category = t.category || 'Other';
      categories[category] = (categories[category] || 0) + t.amount;
    });
    
    return Object.entries(categories)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [transactions]);

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
            amount={formatCurrency(summaryData?.monthlyEarnings)}
            description="Income from all sources this month"
            trend={{ value: 5.2, isPositive: true }}
            action={{ 
              label: "View Details", 
              onClick: () => navigate("/manage-earnings") 
            }}
            className="bg-finance-earnings hover:bg-finance-earnings-dark transition-colors"
          >
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </SummaryCard>
          <SummaryCard
            title="Total Savings"
            amount={formatCurrency(summaryData?.totalSavings)}
            description="Accumulated savings across all accounts"
            trend={{ value: 20.1, isPositive: true }}
            action={{ 
              label: "Manage Savings", 
              onClick: () => navigate("/manage-savings") 
            }}
            className="bg-finance-savings hover:bg-finance-savings-dark transition-colors"
          >
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </SummaryCard>
          <SummaryCard
            title="Active Loans Given"
            amount={formatCurrency(summaryData?.activeLoans)}
            description={`${summaryData?.lendingCount || 0} active loans`}
            trend={{ value: 12.3, isPositive: true }}
            action={{ 
              label: "View Loans", 
              onClick: () => navigate("/manage-lending") 
            }}
            className="bg-finance-lending hover:bg-finance-lending-dark transition-colors"
          >
            <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
          </SummaryCard>
          <SummaryCard
            title="Active Borrowings"
            amount={formatCurrency(summaryData?.activeBorrowings)}
            description={`${summaryData?.borrowingCount || 0} active borrowings`}
            trend={{ value: 3.7, isPositive: false }}
            action={{ 
              label: "View Borrowings", 
              onClick: () => navigate("/manage-borrowing") 
            }}
            className="bg-finance-borrowing hover:bg-finance-borrowing-dark transition-colors"
          >
            <HandCoins className="h-4 w-4 text-muted-foreground" />
          </SummaryCard>
          <SummaryCard
            title="Monthly Spending"
            amount={formatCurrency(summaryData?.monthlySpending)}
            description={`${budgetPercentage}% of monthly budget`}
            trend={{ value: 2.4, isPositive: false }}
            action={{ 
              label: "View Expenses", 
              onClick: () => navigate("/manage-spending") 
            }}
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
                      { key: "earnings", color: "#4ade80" },
                      { key: "savings", color: "#60a5fa" },
                      { key: "loans", color: "#f97316" },
                      { key: "borrowings", color: "#f43f5e" },
                      { key: "spending", color: "#a855f7" },
                    ]}
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available for the selected period
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-3 lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Transactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <TransactionHistory transactions={transactions} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No recent transactions to display
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
