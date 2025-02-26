import React, { useState, useEffect } from "react";
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
import {
  Pencil,
  Trash2,
  ArrowLeft,
  Plus,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCcw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { borrowingService } from "@/services/borrowing.service";
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
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate, calculateDaysOverdue } from "@/lib/utils";

interface BorrowingEntry {
  id: string;
  date: string;
  lenderName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: number; // 0=Active, 1=Completed, 2=Defaulted, 3=Renegotiated
  interestRate?: number;
  repayments?: {
    id: string;
    date: string;
    amount: number;
    note?: string;
  }[];
  remainingAmount?: number;
}

const ManageBorrowing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<BorrowingEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<BorrowingEntry>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState<number | null>(null);
  const [repaymentNote, setRepaymentNote] = useState("");
  const [summaryData, setSummaryData] = useState({
    totalBorrowed: 0,
    totalOutstanding: 0,
    totalInterestToPay: 0,
    totalRepaid: 0,
    activeCount: 0,
    overdueCount: 0,
  });

  const fetchBorrowings = async () => {
    try {
      const response = await borrowingService.getAll({
        pageNumber: currentPage,
        itemsPerPage: itemsPerPage,
        lenderName: searchTerm || undefined,
      });
      setEntries(response.data.items || response.data);
      setTotalItems(response.data.totalCount || response.data.length);
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
      const response = await borrowingService.getSummary();
      setSummaryData(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch summary data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBorrowings();
    fetchSummary();
  }, [currentPage, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEntry.lenderName || !currentEntry.amount || !currentEntry.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditing && currentEntry.id) {
        await borrowingService.update(currentEntry.id, {
          lenderName: currentEntry.lenderName,
          description: currentEntry.description,
          amount: currentEntry.amount,
          dueDate: currentEntry.dueDate,
          interestRate: currentEntry.interestRate,
        });
        toast({
          title: "Success",
          description: "Borrowing entry updated successfully",
        });
      } else {
        const newEntry = {
          lenderName: currentEntry.lenderName!,
          description: currentEntry.description || '',
          amount: currentEntry.amount!,
          dueDate: currentEntry.dueDate!,
          interestRate: currentEntry.interestRate,
          date: new Date().toISOString().split('T')[0],
        };
        await borrowingService.create(newEntry);
        toast({
          title: "Success",
          description: "Borrowing entry added successfully",
        });
      }
      fetchBorrowings();
      fetchSummary();
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

  const handleEdit = (entry: BorrowingEntry) => {
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
        description: "Borrowing entry deleted successfully",
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
        description: "Status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleRecordRepayment = (id: string) => {
    setSelectedEntryId(id);
    setShowRepaymentModal(true);
    setRepaymentAmount(null);
    setRepaymentNote("");
  };

  const submitRepayment = async () => {
    if (!selectedEntryId || !repaymentAmount || repaymentAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid repayment amount",
        variant: "destructive",
      });
      return;
    }

    try {
      await borrowingService.recordRepayment(selectedEntryId, {
        amount: repaymentAmount,
        note: repaymentNote,
      });
      fetchBorrowings();
      fetchSummary();
      setShowRepaymentModal(false);
      toast({
        title: "Success",
        description: "Repayment recorded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record repayment",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>;
      case 1:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 2:
        return <Badge variant="outline" className="bg-red-100 text-red-800">Defaulted</Badge>;
      case 3:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Renegotiated</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

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
            <h1 className="text-3xl font-bold tracking-tight">Manage Borrowing</h1>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Total Borrowed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                <div className="text-2xl font-bold">${summaryData.totalBorrowed.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Amount Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                <div className="text-2xl font-bold">${summaryData.totalOutstanding.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Total Repaid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                <div className="text-2xl font-bold">${summaryData.totalRepaid.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Active Borrowings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <div className="text-2xl font-bold">{summaryData.activeCount}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800">
                Overdue Borrowings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <div className="text-2xl font-bold">{summaryData.overdueCount}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Expected Interest to Pay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                <div className="text-2xl font-bold">${summaryData.totalInterestToPay.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Borrowing Entry</CardTitle>
            <CardDescription>Record money you've borrowed from others</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="lenderName" className="text-sm font-medium">Lender Name*</label>
                  <Input
                    id="lenderName"
                    placeholder="Lender Name"
                    value={currentEntry.lenderName || ''}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, lenderName: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="amount" className="text-sm font-medium">Amount*</label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Amount"
                    value={currentEntry.amount || ''}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, amount: parseFloat(e.target.value) })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="interestRate" className="text-sm font-medium">Interest Rate (%)</label>
                  <Input
                    id="interestRate"
                    type="number"
                    placeholder="Interest Rate"
                    value={currentEntry.interestRate || ''}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, interestRate: parseFloat(e.target.value) })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="dueDate" className="text-sm font-medium">Due Date*</label>
                  <Input
                    id="dueDate"
                    type="date"
                    placeholder="Due Date"
                    value={currentEntry.dueDate ? currentEntry.dueDate.split('T')[0] : ''}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, dueDate: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Input
                    id="description"
                    placeholder="Description"
                    value={currentEntry.description || ''}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, description: e.target.value })}
                  />
                </div>
                
                <div className="flex items-end">
                  <Button type="submit" className="w-full">
                    {isEditing ? "Update Entry" : "Add Entry"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Borrowing Records</CardTitle>
            <div className="w-1/3">
              <Input
                placeholder="Search by lender name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Lender</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No borrowing records found
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.lenderName}</TableCell>
                      <TableCell>${entry.amount.toFixed(2)}</TableCell>
                      <TableCell>{entry.interestRate ? `${entry.interestRate}%` : 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{entry.dueDate}</span>
                          {entry.status === 0 && new Date(entry.dueDate) < new Date() && (
                            <span className="text-xs text-red-600 font-medium">
                              {calculateDaysOverdue(entry.dueDate)} days overdue
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>${entry.remainingAmount?.toFixed(2) || entry.amount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRecordRepayment(entry.id)}
                            disabled={entry.status !== 0}
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(entry)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Select
                            value={entry.status.toString()}
                            onValueChange={(value) => handleStatusChange(entry.id, parseInt(value))}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Active</SelectItem>
                              <SelectItem value="1">Completed</SelectItem>
                              <SelectItem value="2">Defaulted</SelectItem>
                              <SelectItem value="3">Renegotiated</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === totalPages || 
                      Math.abs(page - currentPage) <= 1
                    )
                    .map((page, i, arr) => {
                      if (i > 0 && arr[i - 1] !== page - 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={page === currentPage}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        );
                      }
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Repayment Modal */}
      <Dialog open={showRepaymentModal} onOpenChange={setShowRepaymentModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Repayment</DialogTitle>
            <DialogDescription>
              Enter the amount you're repaying to the lender
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="repaymentAmount" className="text-right text-sm font-medium col-span-1">
                Amount
              </label>
              <Input
                id="repaymentAmount"
                type="number"
                value={repaymentAmount || ''}
                onChange={(e) => setRepaymentAmount(parseFloat(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="repaymentNote" className="text-right text-sm font-medium col-span-1">
                Note
              </label>
              <Input
                id="repaymentNote"
                value={repaymentNote}
                onChange={(e) => setRepaymentNote(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRepaymentModal(false)}>
              Cancel
            </Button>
            <Button onClick={submitRepayment}>Save Repayment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageBorrowing; 