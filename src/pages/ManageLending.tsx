import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { lendingService } from "@/services/lending.service";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface LendingEntry {
  id: string;
  date: string;
  borrowName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  interestRate?: number;
}

const ManageLending = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LendingEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<LendingEntry>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);

  const fetchLendings = async () => {
    try {
      const response = await lendingService.getAll({
        pageNumber: currentPage,
        itemsPerPage: itemsPerPage,
        borrowName: searchTerm || undefined,
      });
      setEntries(response.data.items || response.data);
      setTotalItems(response.data.totalCount || response.data.length);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch lending data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLendings();
  }, [currentPage, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEntry.borrowName || !currentEntry.description || !currentEntry.amount || !currentEntry.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && currentEntry.id) {
      await lendingService.update(currentEntry.id, currentEntry as LendingEntry);
      setEntries(entries.map(entry => 
        entry.id === currentEntry.id ? { ...entry, ...currentEntry } : entry
      ));
      toast({
        title: "Success",
        description: "Loan entry updated successfully",
      });
    } else {
      const newEntry = {
        ...currentEntry as LendingEntry,
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        status: "pending",
      };
      await lendingService.create(newEntry);
      setEntries([...entries, newEntry]);
      toast({
        title: "Success",
        description: "Loan entry added successfully",
      });
    }

    setCurrentEntry({});
    setIsEditing(false);
  };

  const handleEdit = (entry: LendingEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    await lendingService.delete(id);
    setEntries(entries.filter(entry => entry.id !== id));
    toast({
      title: "Success",
      description: "Loan entry deleted successfully",
    });
  };

  const handleStatusChange = async (id: string, status: LendingEntry["status"]) => {
    await lendingService.updateStatus(id, status);
    setEntries(entries.map(entry =>
      entry.id === id ? { ...entry, status } : entry
    ));
    toast({
      title: "Success",
      description: "Payment status updated successfully",
    });
  };

  const indexOfLastEntry = currentPage * itemsPerPage;
  const indexOfFirstEntry = indexOfLastEntry - itemsPerPage;
  const currentEntries = entries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
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
            <h1 className="text-3xl font-bold tracking-tight">Manage Lending</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Loan Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input
                  placeholder="Borrower Name"
                  value={currentEntry.borrowName || ''}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, borrowName: e.target.value })}
                />
                <Input
                  placeholder="Description"
                  value={currentEntry.description || ''}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, description: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={currentEntry.amount || ''}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, amount: parseFloat(e.target.value) })}
                />
                <Input
                  type="date"
                  placeholder="Due Date"
                  value={currentEntry.dueDate || ''}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, dueDate: e.target.value })}
                />
                <Button type="submit">
                  {isEditing ? "Update Entry" : "Add Entry"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Loans</CardTitle>
            <div className="w-1/3">
              <Input
                placeholder="Search by borrower name..."
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
                  <TableHead>Borrower</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.borrowName}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>${entry.amount}</TableCell>
                    <TableCell>{entry.dueDate}</TableCell>
                    <TableCell>
                      <Select
                        value={entry.status}
                        onValueChange={(value: LendingEntry["status"]) => handleStatusChange(entry.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(entry)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = currentPage > 3 
                    ? currentPage - 3 + i 
                    : i + 1;
                  
                  return pageNumber <= totalPages ? (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={pageNumber === currentPage}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ) : null;
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageLending;
