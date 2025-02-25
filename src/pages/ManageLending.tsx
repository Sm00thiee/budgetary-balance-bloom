import { useState } from "react";
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

interface LendingEntry {
  id: string;
  date: string;
  borrowerName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
}

const ManageLending = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LendingEntry[]>([
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<LendingEntry>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEntry.borrowerName || !currentEntry.description || !currentEntry.amount || !currentEntry.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && currentEntry.id) {
      setEntries(entries.map(entry => 
        entry.id === currentEntry.id ? { ...entry, ...currentEntry } : entry
      ));
      toast({
        title: "Success",
        description: "Loan entry updated successfully",
      });
    } else {
      setEntries([...entries, {
        ...currentEntry as LendingEntry,
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        status: "pending",
      }]);
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

  const handleDelete = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
    toast({
      title: "Success",
      description: "Loan entry deleted successfully",
    });
  };

  const handleStatusChange = (id: string, status: LendingEntry["status"]) => {
    setEntries(entries.map(entry =>
      entry.id === id ? { ...entry, status } : entry
    ));
    toast({
      title: "Success",
      description: "Payment status updated successfully",
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

        <Card>
          <CardHeader>
            <CardTitle>Add New Loan Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input
                  placeholder="Borrower Name"
                  value={currentEntry.borrowerName || ''}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, borrowerName: e.target.value })}
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
          <CardHeader>
            <CardTitle>Active Loans</CardTitle>
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
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.borrowerName}</TableCell>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageLending;
