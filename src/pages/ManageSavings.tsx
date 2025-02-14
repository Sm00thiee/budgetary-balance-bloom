
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
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SavingsEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  goal: string;
}

const ManageSavings = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<SavingsEntry[]>([
    {
      id: "1",
      date: "2024-03-20",
      description: "Emergency Fund",
      amount: 1000,
      goal: "Emergency Savings",
    },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<SavingsEntry>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEntry.description || !currentEntry.amount || !currentEntry.goal) {
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
        description: "Savings entry updated successfully",
      });
    } else {
      setEntries([...entries, {
        ...currentEntry as SavingsEntry,
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
      }]);
      toast({
        title: "Success",
        description: "Savings entry added successfully",
      });
    }

    setCurrentEntry({});
    setIsEditing(false);
  };

  const handleEdit = (entry: SavingsEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
    toast({
      title: "Success",
      description: "Savings entry deleted successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Manage Savings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Savings Entry</CardTitle>
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
                  placeholder="Savings Goal"
                  value={currentEntry.goal || ''}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, goal: e.target.value })}
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
            <CardTitle>Savings Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>${entry.amount}</TableCell>
                    <TableCell>{entry.goal}</TableCell>
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

export default ManageSavings;
