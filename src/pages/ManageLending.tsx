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
import { Pencil, Trash2, ArrowLeft, DollarSign, Info, Calendar, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  lendingService, 
  Lending, 
  LendingSummary,
  CreateLendingRequestDto,
  UpdateLendingRequestDto 
} from "@/services/lending.service";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { format, isValid, parseISO } from "date-fns";
import { formatCurrency, formatDate, displayValue } from "@/lib/table-utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// Status codes
enum LendingStatus {
  Active = 1,
  Completed = 2,
  Defaulted = 3
}

// Helper function to check if a value is a valid LendingStatus
const isValidLendingStatus = (status: number | string | null | undefined): boolean => {
  const statusNum = Number(status);
  return !isNaN(statusNum) && 
         statusNum >= 1 && 
         statusNum <= Object.keys(LendingStatus).length / 2;
};

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
    case LendingStatus.Active:
      return "Active";
    case LendingStatus.Completed:
      return "Completed";
    case LendingStatus.Defaulted:
      return "Defaulted";
    default:
      console.warn(`Invalid status value received: ${status}`);
      return "Unknown";
  }
};

// Helper function to get badge variant based on status
const getStatusBadgeVariant = (status: number | null | undefined): "default" | "secondary" | "destructive" => {
  // Handle null/undefined status
  if (status === null || status === undefined) {
    return "default";
  }
  
  // Ensure status is a number
  const statusNum = Number(status);
  
  switch (statusNum) {
    case LendingStatus.Active:
      return "default";
    case LendingStatus.Completed:
      return "secondary";
    case LendingStatus.Defaulted:
      return "destructive";
    default:
      return "default";
  }
};

// Helper function to safely parse dates
const parseSafeDate = (dateString: string | undefined): Date | undefined => {
  if (!dateString) {
    console.log("parseSafeDate: No date string provided");
    return undefined;
  }
  
  console.log(`parseSafeDate: Parsing date string: "${dateString}"`);
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    console.log(`parseSafeDate: Invalid date: "${dateString}"`);
    return undefined;
  }
  
  console.log(`parseSafeDate: Successfully parsed date: ${date.toISOString()}`);
  return date;
};

// Helper function to safely format dates
const safeFormatDate = (dateString: string, formatPattern: string = "MMM d, yyyy"): string => {
  if (!dateString) return "N/A";
  
  const date = parseISO(dateString);
  return isValid(date) ? format(date, formatPattern) : "Invalid date";
};

const ManageLending = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State for lending data
  const [entries, setEntries] = useState<Lending[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<Lending>>({});
  const [totalItems, setTotalItems] = useState(0);
  const [summary, setSummary] = useState<LendingSummary | null>(null);
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

  // Editing or adding a new entry
  const [isAddingNew, setIsAddingNew] = useState(true);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const fetchLendings = async () => {
    try {
      console.log("Fetching lendings with params:", {
        pageNumber: currentPage,
        itemsPerPage,
        borrowName: searchTerm || undefined,
        status: statusFilter !== "" ? Number(statusFilter) : undefined,
        fromDate: parseSafeDate(fromDate),
        toDate: parseSafeDate(toDate),
        minAmount: minAmount !== "" ? Number(minAmount) : undefined,
        maxAmount: maxAmount !== "" ? Number(maxAmount) : undefined
      });

      const response = await lendingService.getAll({
        pageNumber: currentPage,
        itemsPerPage: itemsPerPage,
        borrowName: searchTerm || undefined,
        status: statusFilter !== "" ? Number(statusFilter) : undefined,
        fromDate: parseSafeDate(fromDate),
        toDate: parseSafeDate(toDate),
        minAmount: minAmount !== "" ? Number(minAmount) : undefined,
        maxAmount: maxAmount !== "" ? Number(maxAmount) : undefined,
        sortField: "dueDate",
        sortDirection: "asc"
      });
      
      console.log("API Response:", response);
      console.log("Response items:", response.items);
      console.log("Response total:", response.total);
      
      // Check if we have a valid response structure
      if (!response || typeof response !== 'object') {
        console.error("Invalid response structure:", response);
        toast({
          title: "Error",
          description: "Received invalid data format from the server",
          variant: "destructive",
        });
        return;
      }
      
      // Check if response.items exists and is an array
      if (!Array.isArray(response.items)) {
        console.error("Response.items is not an array:", response.items);
        
        // Try to determine what happened
        if (response.items === undefined) {
          console.error("Response.items is undefined");
        } else if (response.items === null) {
          console.error("Response.items is null");
        } else {
          console.error("Response.items is of type:", typeof response.items);
        }
        
        // Create an empty array to prevent errors
        setEntries([]);
        setTotalItems(0);
        return;
      }
      
      // Process the entries to ensure status is correctly handled
      const processedItems = response.items?.map(item => ({
        ...item,
        // Convert status to a number and ensure it's a valid enum value
        status: isValidLendingStatus(item.status) ? Number(item.status) : LendingStatus.Active
      })) || [];
      
      console.log("Processed items:", processedItems);
      
      setEntries(processedItems);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error("Fetch lendings error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch lending data",
        variant: "destructive",
      });
    }
  };

  const fetchSummary = async () => {
    try {
      const summaryData = await lendingService.getSummary();
      setSummary(summaryData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch lending summary",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLendings();
    fetchSummary();
  }, [currentPage, searchTerm, statusFilter, fromDate, toDate, minAmount, maxAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentEntry.borrowName) {
      toast({
        title: "Error",
        description: "Borrower name is required",
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
      if (isAddingNew) {
        // Create new lending
        await lendingService.create({
          borrowName: currentEntry.borrowName!,
          description: currentEntry.description || '',
          amount: Number(currentEntry.amount),
          interestRate: Number(currentEntry.interestRate) || 0,
          dueDate: currentEntry.dueDate || '',
          date: format(new Date(), 'yyyy-MM-dd'),
        });
        
        toast({
          title: "Success",
          description: "New lending created successfully",
        });
      } else {
        // Update existing lending
        await lendingService.update(currentEntry.id!, {
          borrowName: currentEntry.borrowName,
          description: currentEntry.description || '',
          amount: Number(currentEntry.amount),
          interestRate: Number(currentEntry.interestRate) || 0,
          status: currentEntry.status !== undefined ? String(currentEntry.status) : '0',
          dueDate: currentEntry.dueDate || '',
          date: currentEntry.date || format(new Date(), 'yyyy-MM-dd'),
        });
        
        toast({
          title: "Success",
          description: "Lending updated successfully",
        });
      }
      
      setIsAddingNew(false);
      setIsEditing(false);
      fetchLendings();
      fetchSummary();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to save lending data",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (entry: Lending) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    // Instead of immediately deleting, set the entry to delete and open the confirmation dialog
    setEntryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (entryToDelete) {
      try {
        await lendingService.delete(entryToDelete);
        fetchLendings();
        fetchSummary();
        toast({
          title: "Success",
          description: "Loan entry deleted successfully",
        });
        setDeleteConfirmOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete loan entry",
          variant: "destructive",
        });
      }
    }
  };

  const handleStatusChange = async (id: string, status: number) => {
    try {
      await lendingService.updateStatus(id, { status });
      fetchLendings();
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
      const remainingAmount = await lendingService.recordPayment(currentPaymentId, {
        amount: Number(paymentAmount),
        note: paymentNote || undefined
      });
      
      setShowPaymentDialog(false);
      fetchLendings();
      fetchSummary();
      
      toast({
        title: "Success",
        description: `Payment recorded successfully. Remaining amount: $${remainingAmount.toFixed(2)}`,
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

  // Editing or adding a new entry
  const handleAddNew = () => {
    setIsAddingNew(true);
    setIsEditing(true);
    setCurrentEntry({
      borrowName: "",
      description: "",
      amount: 0,
      interestRate: 0,
      dueDate: "",
    });
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
            <h1 className="text-3xl font-bold tracking-tight">Manage Lending</h1>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Loans
                </CardTitle>
                <CardDescription>
                  Money you've lent that's still being repaid
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(summary?.totalActiveAmount ?? 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.activeCount ?? 0} active loans
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Overdue Loans
                </CardTitle>
                <CardDescription>
                  Money that's past the due date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(summary?.totalOverdueAmount ?? 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.overdueCount ?? 0} overdue loans
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Loans
                </CardTitle>
                <CardDescription>
                  Money that has been fully repaid
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(summary?.totalCompletedAmount ?? 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.completedCount ?? 0} completed loans
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New/Edit Loan Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Loan Entry" : "Add New Loan Entry"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="borrowName">Borrower Name</Label>
                    <Input
                      id="borrowName"
                      placeholder="Enter borrower name"
                      value={currentEntry.borrowName || ""}
                      onChange={(e) => setCurrentEntry({...currentEntry, borrowName: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={currentEntry.amount || ""}
                      onChange={(e) => setCurrentEntry({...currentEntry, amount: parseFloat(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      placeholder="Enter interest rate"
                      value={currentEntry.interestRate || ""}
                      onChange={(e) => setCurrentEntry({...currentEntry, interestRate: parseFloat(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={currentEntry.dueDate ? format(new Date(currentEntry.dueDate), "yyyy-MM-dd") : ""}
                      onChange={(e) => setCurrentEntry({...currentEntry, dueDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Enter description"
                      value={currentEntry.description || ""}
                      onChange={(e) => setCurrentEntry({...currentEntry, description: e.target.value})}
                    />
                  </div>
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
                  {isEditing ? "Update Loan" : "Add Loan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Loans Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Loan Records</CardTitle>
            <div className="flex space-x-2">
              <div className="relative w-full md:w-64">
                <Input
                  placeholder="Search by borrower name..."
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
                  <TableHead>Borrower</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Repaid</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableEmpty colSpan={8} message="No lending records found" />
                ) :
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{displayValue(entry.borrowName)}</TableCell>
                      <TableCell>{formatDate(entry.date || entry.createdDate)}</TableCell>
                      <TableCell>{formatDate(entry.dueDate)}</TableCell>
                      <TableCell>{formatCurrency(entry.amount)}</TableCell>
                      <TableCell>{entry.interestRate.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(entry.status)}
                          className={entry.isOverdue ? "bg-red-500" : ""}
                        >
                          {isValidLendingStatus(entry.status) 
                            ? getStatusText(entry.status) 
                            : `Unknown (${entry.status})`}
                          {entry.isOverdue && " (Overdue)"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <div className="text-sm">
                            Repaid: {formatCurrency(entry.amountRepaid)}
                          </div>
                          <div className="text-sm">
                            Remaining: {formatCurrency(entry.remainingAmount)}
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
                          {entry.status === LendingStatus.Active && (
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

      {/* Add the confirmation dialog */}
      <ConfirmDialog 
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this lending record? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
      />
    </div>
  );
};

export default ManageLending;
