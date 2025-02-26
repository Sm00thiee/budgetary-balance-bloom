import { SummaryCard } from "@/components/SummaryCard";
import { TransactionHistory } from "@/components/TransactionHistory";
import { FinanceChart } from "@/components/FinanceChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, Wallet, BanknoteIcon, DollarSign, UserCircle, ArrowUp, ArrowDown, Landmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "@/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import FinancialOverview from "@/components/FinancialOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("dashboard");

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

  // First, sort and process the data for the chart
  const processedChartData = useMemo(() => {
    if (!chartData) return [];
    
    // Sort data chronologically
    return [...chartData].sort((a, b) => 
      new Date(a.yearMonth).getTime() - new Date(b.yearMonth).getTime()
    );
  }, [chartData]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Button onClick={() => navigate("/profile")}>
            <UserCircle className="h-4 w-4 mr-2" />
            Profile
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Main Dashboard</TabsTrigger>
            <TabsTrigger value="financial-overview">Financial Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SummaryCard 
                title="Total Earnings"
                value={summaryData?.totalEarnings ?? 0}
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                description="Total earnings recorded"
                action={
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0" 
                    onClick={() => navigate("/manage-earnings")}
                  >
                    <BanknoteIcon className="h-4 w-4" />
                  </Button>
                }
              />
              <SummaryCard 
                title="Total Savings"
                value={summaryData?.totalSavings ?? 0}
                icon={<PiggyBank className="h-4 w-4 text-muted-foreground" />}
                description="Total savings recorded"
                action={
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0" 
                    onClick={() => navigate("/manage-savings")}
                  >
                    <PiggyBank className="h-4 w-4" />
                  </Button>
                }
              />
              <SummaryCard 
                title="Total Spending"
                value={summaryData?.totalSpendings ?? 0}
                icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
                description="Total spending recorded"
                action={
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0" 
                    onClick={() => navigate("/manage-spending")}
                  >
                    <Wallet className="h-4 w-4" />
                  </Button>
                }
              />
              <SummaryCard 
                title="Net Financial"
                value={(summaryData?.totalLending ?? 0) - (summaryData?.totalBorrowing ?? 0)}
                icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
                description="Net lending/borrowing position"
                action={
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0" 
                      onClick={() => navigate("/manage-lending")}
                    >
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0" 
                      onClick={() => navigate("/manage-borrowing")}
                    >
                      <ArrowDown className="h-4 w-4 text-blue-600" />
                    </Button>
                  </div>
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Finance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 mb-4">
                    <div className="grid gap-2">
                      <Label htmlFor="from">From</Label>
                      <DatePicker
                        id="from"
                        selected={startDate}
                        onSelect={setStartDate}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="to">To</Label>
                      <DatePicker
                        id="to"
                        selected={endDate}
                        onSelect={setEndDate}
                      />
                    </div>
                  </div>
                  <FinanceChart data={processedChartData} />
                </CardContent>
              </Card>
              <TransactionHistory transactions={transactions || []} />
            </div>

            <div className="grid gap-4 md:grid-cols-4 mt-4">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Manage Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate("/manage-earnings")}
                  >
                    <BanknoteIcon className="h-4 w-4 mr-2" />
                    Go to Earnings
                  </Button>
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Manage Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate("/manage-savings")}
                  >
                    <PiggyBank className="h-4 w-4 mr-2" />
                    Go to Savings
                  </Button>
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Manage Spending</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate("/manage-spending")}
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Go to Spending
                  </Button>
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Debt Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => navigate("/manage-lending")}
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Lending
                  </Button>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate("/manage-borrowing")}
                  >
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Borrowing
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="financial-overview">
            <FinancialOverview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
