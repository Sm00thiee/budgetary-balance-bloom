import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, ArrowLeft, DollarSign, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { borrowingService, Borrowing, BorrowingSummary } from "@/services/borrowing.service";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

// Status codes
enum BorrowingStatus {
  Active = 1,
  Completed = 2,
  Defaulted = 3
}

// Helper function to convert status number to string
const getStatusText = (status: number): string => {
  switch (status) {
    case BorrowingStatus.Active:
      return "Active";
    case BorrowingStatus.Completed:
      return "Completed";
    case BorrowingStatus.Defaulted:
      return "Defaulted";
    default:
      return "Unknown";
  }
};

// Helper function to get badge variant based on status
const getStatusBadgeVariant = (status: number): "default" | "secondary" | "destructive" => {
  switch (status) {
    case BorrowingStatus.Active:
      return "default";
    case BorrowingStatus.Completed:
      return "secondary";
    case BorrowingStatus.Defaulted:
      return "destructive";
    default:
      return "default";
  }
};

const ManageBorrowing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State for borrowing data
  const [entries, setEntries] = useState<Borrowing[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<Borrowing>>({});
  const [totalItems, setTotalItems] = useState(0);
  const [summary, setSummary] = useState<BorrowingSummary | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | "">("");
  const [paymentNote, setPaymentNote] = useState("");
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  
  // State for filtering and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | "">("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [minAmount, setMinAmount] = useState<number | "">("");
  const [maxAmount, setMaxAmount] = useState<number | "">("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchBorrowings = async () => {
    try {
      const response = await borrowingService.getAll({
        pageNumber: currentPage,
        itemsPerPage: itemsPerPage,
        lenderName: searchTerm || undefined,
        status: statusFilter !== "" ? Number(statusFilter) : undefined,
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
        minAmount: minAmount !== "" ? Number(minAmount) : undefined,
        maxAmount: maxAmount !== "" ? Number(maxAmount) : undefined,
        sortField: "dueDate",
        sortDirection: "asc"
      });
      
      setEntries(response.items || []);
      setTotalItems(response.total || 0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch borrowing data",
        variant: "destructive",
      });
    }
  };

  const fetchSummary = async () => {
    try {
      const summaryData = await borrowingService.getSummary();
      setSummary(summaryData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch borrowing summary",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBorrowings();
    fetchSummary();
  }, [currentPage, searchTerm, statusFilter, fromDate, toDate, minAmount, maxAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEntry.lenderName || !currentEntry.description || !currentEntry.amount || !currentEntry.dueDate || currentEntry.interestRate === undefined) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditing && currentEntry.id) {
        await borrowingService.update(currentEntry.id, currentEntry as Borrowing);
        toast({
          title: "Success",
          description: "Loan entry updated successfully",
        });
      } else {
        const newBorrowing = {
          ...currentEntry as Borrowing,
          date: new Date().toISOString().split('T')[0],
          status: BorrowingStatus.Active,
        };
        await borrowingService.create(newBorrowing);
        toast({
          title: "Success",
          description: "Loan entry added successfully",
        });
      }
      
      // Refresh data
      fetchBorrowings();
      fetchSummary();
      
      // Reset form
      setCurrentEntry({});
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save borrowing entry",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (entry: Borrowing) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await borrowingService.delete(id);
      fetchBorrowings();
      fetchSummary();
      toast({
        title: "Success",
        description: "Loan entry deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete borrowing entry",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, status: number) => {
    try {
      await borrowingService.updateStatus(id, status);
      fetchBorrowings();
      fetchSummary();
      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleRecordPayment = (id: string) => {
    setCurrentPaymentId(id);
    setPaymentAmount("");
    setPaymentNote("");
    setShowPaymentDialog(true);
  };

  const submitPayment = async () => {
    if (!currentPaymentId || paymentAmount === "" || Number(paymentAmount) <= 0) {
      toast({
        title: "Error", 
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      await borrowingService.recordPayment(currentPaymentId, {
        amount: Number(paymentAmount),
        note: paymentNote || undefined
      });
      
      setShowPaymentDialog(false);
      fetchBorrowings();
      fetchSummary();
      
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Manage Borrowings</h1>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Borrowings
                </CardTitle>
                <CardDescription>
                  Money you've borrowed that still needs to be repaid
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.totalActiveAmount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.activeCount} active borrowings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Overdue Borrowings
                </CardTitle>
                <CardDescription>
                  Money that's past the due date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.totalOverdueAmount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.overdueCount} overdue borrowings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Borrowings
                </CardTitle>
                <CardDescription>
                  Money that has been fully repaid
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.totalCompletedAmount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.completedCount} completed borrowings
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New/Edit Loan Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Borrowing" : "Add New Borrowing"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lenderName">Lender Name</Label>
                  <Input
                    id="lenderName"
                    placeholder="Who lent you the money"
                    value={currentEntry.lenderName || ''}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, lenderName: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="Loan amount"
                    value={currentEntry.amount || ''}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, amount: parseFloat(e.target.value) })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    placeholder="Annual interest rate"
                    value={currentEntry.interestRate ?? ''}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, interestRate: parseFloat(e.target.value) })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={currentEntry.dueDate || ''}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, dueDate: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Purpose of the loan"
                    value={currentEntry.description || ''}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, description: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                {isEditing && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mr-2"
                    onClick={() => {
                      setCurrentEntry({});
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit">
                  {isEditing ? "Update Borrowing" : "Add Borrowing"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Loans Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Borrowing Records</CardTitle>
            <div className="flex space-x-2">
              <div className="relative w-full md:w-64">
                <Input
                  placeholder="Search by lender name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-8"
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          {/* Filters Section */}
          {showFilters && (
            <CardContent className="border-b border-border pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={statusFilter.toString()} 
                    onValueChange={(value) => setStatusFilter(value ? Number(value) : "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="2">Completed</SelectItem>
                      <SelectItem value="3">Defaulted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Min Amount</Label>
                  <Input
                    type="number"
                    placeholder="Minimum amount"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value ? Number(e.target.value) : "")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Max Amount</Label>
                  <Input
                    type="number"
                    placeholder="Maximum amount"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value ? Number(e.target.value) : "")}
                  />
                </div>
                
                <div className="space-y-2 flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={resetFilters}
                    className="w-full"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
          
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Lender</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      No borrowing records found
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(new Date(entry.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{entry.lenderName}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>${entry.amount.toFixed(2)}</TableCell>
                      <TableCell>{entry.interestRate.toFixed(1)}%</TableCell>
                      <TableCell>{format(new Date(entry.dueDate), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(entry.status)}>
                          {getStatusText(entry.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {entry.status === BorrowingStatus.Active && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRecordPayment(entry.id)}
                              title="Record Payment"
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(entry)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(entry.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = currentPage > 3 
                    ? currentPage - 3 + i 
                    : i + 1;
                  
                  return pageNumber <= totalPages ? (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  ) : null;
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="mx-1">...</span>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Enter the payment details for this loan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value ? parseFloat(e.target.value) : "")}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentNote">Note (Optional)</Label>
              <Input
                id="paymentNote"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Add payment details"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageBorrowing; 