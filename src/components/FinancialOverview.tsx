import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, DollarSign, TrendingUp, TrendingDown, Landmark } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { financialOverviewService } from "@/services/financial-overview.service";
import { formatCurrency } from "@/lib/utils";

const FinancialOverview = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['financialOverview'],
    queryFn: financialOverviewService.getOverview,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-52">
            <p>Loading financial overview...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-52">
            <p>Error loading financial overview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { lendingSummary, borrowingSummary, netPosition } = data;

  // Prepare data for the comparison chart
  const comparisonData = [
    {
      name: "Total",
      Lending: lendingSummary.totalLent,
      Borrowing: borrowingSummary.totalBorrowed,
    },
    {
      name: "Outstanding",
      Lending: lendingSummary.totalOutstanding,
      Borrowing: borrowingSummary.totalOutstanding,
    },
    {
      name: "Interest",
      Lending: lendingSummary.totalInterestToReceive,
      Borrowing: borrowingSummary.totalInterestToPay,
    },
    {
      name: "Repaid",
      Lending: lendingSummary.totalRepaid,
      Borrowing: borrowingSummary.totalRepaid,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Financial Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={netPosition.netFinancialAmount >= 0 ? "bg-green-50" : "bg-blue-50"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Net Financial Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Landmark className={`h-5 w-5 mr-2 ${netPosition.netFinancialAmount >= 0 ? "text-green-600" : "text-blue-600"}`} />
              <div className="text-2xl font-bold">{formatCurrency(netPosition.netFinancialAmount)}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {netPosition.netFinancialAmount >= 0 ? "Net Lender" : "Net Borrower"}
            </p>
          </CardContent>
        </Card>

        <Card className={netPosition.netInterestAmount >= 0 ? "bg-green-50" : "bg-blue-50"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Net Interest Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className={`h-5 w-5 mr-2 ${netPosition.netInterestAmount >= 0 ? "text-green-600" : "text-blue-600"}`} />
              <div className="text-2xl font-bold">{formatCurrency(netPosition.netInterestAmount)}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {netPosition.netInterestAmount >= 0 ? "Net Interest Income" : "Net Interest Expense"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Lending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowUp className="h-5 w-5 text-green-600 mr-2" />
              <div className="text-2xl font-bold">{formatCurrency(lendingSummary.totalLent)}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {lendingSummary.activeCount} active lendings
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Borrowing Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowDown className="h-5 w-5 text-blue-600 mr-2" />
              <div className="text-2xl font-bold">{formatCurrency(borrowingSummary.totalBorrowed)}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {borrowingSummary.activeCount} active borrowings
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lending vs Borrowing Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${formatCurrency(value as number)}`, undefined]}
                />
                <Legend />
                <Bar dataKey="Lending" fill="#10b981" name="Lending" />
                <Bar dataKey="Borrowing" fill="#3b82f6" name="Borrowing" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Lending Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Lent:</span>
                <span className="font-medium">{formatCurrency(lendingSummary.totalLent)}</span>
              </div>
              <div className="flex justify-between">
                <span>Outstanding Amount:</span>
                <span className="font-medium">{formatCurrency(lendingSummary.totalOutstanding)}</span>
              </div>
              <div className="flex justify-between">
                <span>Interest to Receive:</span>
                <span className="font-medium">{formatCurrency(lendingSummary.totalInterestToReceive)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Repaid:</span>
                <span className="font-medium">{formatCurrency(lendingSummary.totalRepaid)}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Loans:</span>
                <span className="font-medium">{lendingSummary.activeCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Overdue Loans:</span>
                <span className="font-medium text-red-600">{lendingSummary.overdueCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Borrowing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Borrowed:</span>
                <span className="font-medium">{formatCurrency(borrowingSummary.totalBorrowed)}</span>
              </div>
              <div className="flex justify-between">
                <span>Outstanding Amount:</span>
                <span className="font-medium">{formatCurrency(borrowingSummary.totalOutstanding)}</span>
              </div>
              <div className="flex justify-between">
                <span>Interest to Pay:</span>
                <span className="font-medium">{formatCurrency(borrowingSummary.totalInterestToPay)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Repaid:</span>
                <span className="font-medium">{formatCurrency(borrowingSummary.totalRepaid)}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Borrowings:</span>
                <span className="font-medium">{borrowingSummary.activeCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Overdue Borrowings:</span>
                <span className="font-medium text-red-600">{borrowingSummary.overdueCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialOverview; 