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
  TableEmpty,
  TableLoading,
  TableActions
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
import { borrowingService, Borrowing, BorrowingSummary, UpdateBorrowingRequestDto } from "@/services/borrowing.service";
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
import { format, isValid, parseISO } from "date-fns";
import { formatCurrency, formatDate, displayValue } from "@/lib/table-utils";

// Status codes
enum BorrowingStatus {
  Active = 0,
  Completed = 1,
  Defaulted = 2,
  Renegotiated = 3,
  Overdue = 4
}

// Helper function to convert status number to string
const getStatusText = (status: number | null | undefined): string => {
  // Handle null/undefined status
  if (status === null || status === undefined) {
    return "Unknown";
  }
  
  // Ensure status is a number
  const statusNum = Number(status);
  
  // Check if status is in valid range
  switch (statusNum) {
    case BorrowingStatus.Active:
      return "Active";
    case BorrowingStatus.Completed:
      return "Completed";
    case BorrowingStatus.Defaulted:
      return "Defaulted";
    case BorrowingStatus.Renegotiated:
      return "Renegotiated";
    case BorrowingStatus.Overdue:
      return "Overdue";
    default:
      console.warn(`Invalid status value received: ${status}`);
      return "Unknown";
  }
};

// Helper function to get badge variant based on status
const getStatusBadgeVariant = (status: number | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
  // Handle null/undefined status
  if (status === null || status === undefined) {
    return "default";
  }
  
  // Ensure status is a number
  const statusNum = Number(status);
  
  switch (statusNum) {
    case BorrowingStatus.Active:
      return "default";
    case BorrowingStatus.Completed:
      return "secondary";
    case BorrowingStatus.Defaulted:
      return "destructive";
    case BorrowingStatus.Renegotiated:
      return "outline";
    case BorrowingStatus.Overdue:
      return "destructive";
    default:
      return "default";
  }
};

// Helper function to safely format dates
const safeFormatDate = (dateString: string, formatPattern: string = "MMM d, yyyy"): string => {
  if (!dateString) return "N/A";
  
  const date = parseISO(dateString);
  return isValid(date) ? format(date, formatPattern) : "Invalid date";
};

// Helper function to check if a value is a valid BorrowingStatus
const isValidBorrowingStatus = (status: any): boolean => {
  const statusNum = Number(status);
  return !isNaN(statusNum) && 
         statusNum >= 0 && 
         statusNum <= Object.keys(BorrowingStatus).length / 2;
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
      
      console.log("API Response:", response);
      
      // Process the entries to ensure status is correctly handled
      const processedItems = response.items?.map(item => ({
        ...item,
        // Convert status to a number and ensure it's a valid enum value
        status: isValidBorrowingStatus(item.status) ? Number(item.status) : BorrowingStatus.Active
      })) || [];
      
      console.log("Processed items:", processedItems);
      
      setEntries(processedItems);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error("Fetch borrowings error:", error);
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
    
    if (!currentEntry.lenderName) {
      toast({
        title: "Error",
        description: "Lender name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentEntry.amount || isNaN(Number(currentEntry.amount)) || Number(currentEntry.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isEditing && currentEntry.id) {
        // Update existing borrowing
        await borrowingService.update(currentEntry.id, {
          lenderName: currentEntry.lenderName,
          description: currentEntry.description || '',
          amount: Number(currentEntry.amount),
          interestRate: Number(currentEntry.interestRate) || 0,
          status: currentEntry.status !== undefined ? String(currentEntry.status) : '0',
          dueDate: currentEntry.dueDate || '',
          date: currentEntry.date || format(new Date(), 'yyyy-MM-dd'),
        });
        
        toast({
          title: "Success",
          description: "Borrowing updated successfully",
        });
      } else {
        // Create new borrowing
        await borrowingService.create({
          lenderName: currentEntry.lenderName!,
          description: currentEntry.description || '',
          amount: Number(currentEntry.amount),
          interestRate: Number(currentEntry.interestRate) || 0,
          dueDate: currentEntry.dueDate || '',
          date: format(new Date(), 'yyyy-MM-dd'),
        });
        
        toast({
          title: "Success",
          description: "New borrowing created successfully",
        });
      }
      
      // Refresh data
      fetchBorrowings();
      fetchSummary();
      
      // Reset form
      setCurrentEntry({});
      setIsEditing(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to save borrowing data",
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
      const remainingAmount = await borrowingService.recordPayment(currentPaymentId, {
        amount: Number(paymentAmount),
        note: paymentNote || undefined
      });
      
      setShowPaymentDialog(false);
      fetchBorrowings();
      fetchSummary();
      
      toast({
        title: "Success",
        description: `Payment recorded successfully. Remaining amount: $${remainingAmount.toFixed(2)}`,
      });
    } catch (error) {
      console.error("Payment recording error:", error);
      
      // Only show error toast if there's an actual error
      if (error) {
        toast({
          title: "Error",
          description: "Failed to record payment",
          variant: "destructive",
        });
      }
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
                <div className="text-2xl font-bold">${(summary?.totalActiveAmount ?? 0).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {summary?.activeCount ?? 0} active borrowings
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
                <div className="text-2xl font-bold">${(summary?.totalOverdueAmount ?? 0).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {summary?.overdueCount ?? 0} overdue borrowings
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
                <div className="text-2xl font-bold">${(summary?.totalCompletedAmount ?? 0).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {summary?.completedCount ?? 0} completed borrowings
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
                      <SelectItem value="0">Active</SelectItem>
                      <SelectItem value="1">Completed</SelectItem>
                      <SelectItem value="2">Defaulted</SelectItem>
                      <SelectItem value="3">Renegotiated</SelectItem>
                      <SelectItem value="4">Overdue</SelectItem>
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
                  <TableHead>Repaid</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableEmpty colSpan={9} message="No borrowing records found" />
                ) :
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{displayValue(entry.lenderName)}</TableCell>
                      <TableCell>{displayValue(entry.description)}</TableCell>
                      <TableCell>{formatCurrency(entry.amount)}</TableCell>
                      <TableCell>{entry.interestRate.toFixed(1)}%</TableCell>
                      <TableCell>{formatDate(entry.dueDate)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(entry.status)}
                          className={entry.isOverdue ? "bg-red-500" : ""}
                        >
                          {isValidBorrowingStatus(entry.status) 
                            ? getStatusText(entry.status) 
                            : `Unknown (${entry.status})`}
                          {entry.isOverdue && " (Overdue)"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <div className="text-sm">
                            Repaid: {formatCurrency(entry.amountRepaid || 0)}
                          </div>
                          <div className="text-sm">
                            Remaining: {formatCurrency(entry.remainingAmount || entry.amount)}
                          </div>
                          {entry.lastRepaymentDate && (
                            <div className="text-xs text-muted-foreground">
                              Last payment: {formatDate(entry.lastRepaymentDate)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <TableActions>
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
                        </TableActions>
                      </TableCell>
                    </TableRow>
                  ))
                }
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