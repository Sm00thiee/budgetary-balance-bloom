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

interface SavingsEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  goal: string;
  type: "deposit" | "withdrawal";
}

const ManageSavings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<SavingsEntry[]>([
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<SavingsEntry>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEntry.description || !currentEntry.amount || !currentEntry.goal || !currentEntry.type) {
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
        description: `${currentEntry.type === 'deposit' ? 'Deposit' : 'Withdrawal'} added successfully`,
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Manage Savings</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Savings Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <Select
                  value={currentEntry.type}
                  onValueChange={(value: "deposit" | "withdrawal") => setCurrentEntry({ ...currentEntry, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit">
                  {isEditing ? "Update Entry" : "Add Entry"}
                </Button>
              </div>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className={entry.type === 'withdrawal' ? 'text-red-500' : 'text-green-500'}>
                      {entry.type === 'withdrawal' ? '-' : '+'}${entry.amount}
                    </TableCell>
                    <TableCell>{entry.type}</TableCell>
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
