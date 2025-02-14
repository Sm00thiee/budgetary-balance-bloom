
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
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LendingEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
}

const ManageLending = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<LendingEntry[]>([
    {
      id: "1",
      date: "2024-03-20",
      description: "Personal Loan",
      amount: 5000,
      dueDate: "2024-04-20",
      status: "Active",
    },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<LendingEntry>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEntry.description || !currentEntry.amount || !currentEntry.dueDate) {
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
        status: "Active",
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Manage Lending</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Loan Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
              <Button type="submit">
                {isEditing ? "Update Entry" : "Add Entry"}
              </Button>
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
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>${entry.amount}</TableCell>
                    <TableCell>{entry.dueDate}</TableCell>
                    <TableCell>{entry.status}</TableCell>
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
