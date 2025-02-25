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
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { earningsService } from "@/services/earnings.service";

interface EarningsEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

const CATEGORIES = [
  "Salary",
  "Investments",
  "Freelance",
  "Business",
  "Other",
];

const ManageEarnings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<EarningsEntry>>({});

  // Fetch earnings data
  const { data: entries = [] } = useQuery({
    queryKey: ['earnings'],
    queryFn: earningsService.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      description: string;
      amount: number;
      date: string;
      category: string;
    }) => earningsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
      toast({
        title: "Success",
        description: "Earnings entry added successfully",
      });
      setCurrentEntry({});
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add earnings entry",
        variant: "destructive",
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        description?: string;
        amount?: number;
        date?: string;
        category?: string;
      }
    }) => earningsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
      toast({
        title: "Success",
        description: "Earnings entry updated successfully",
      });
      setCurrentEntry({});
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update earnings entry",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => earningsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
      toast({
        title: "Success",
        description: "Earnings entry deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete earnings entry",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEntry.description || !currentEntry.amount || !currentEntry.category) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && currentEntry.id) {
      updateMutation.mutate({ 
        id: currentEntry.id, 
        data: {
          description: currentEntry.description,
          amount: currentEntry.amount,
          category: currentEntry.category,
          date: currentEntry.date
        } 
      });
    } else {
      createMutation.mutate({
        description: currentEntry.description!,
        amount: currentEntry.amount!,
        category: currentEntry.category!,
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleEdit = (entry: EarningsEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
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
            <h1 className="text-3xl font-bold tracking-tight">Manage Earnings</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Earnings Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <Select
                  value={currentEntry.category}
                  onValueChange={(value) => setCurrentEntry({ ...currentEntry, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {isEditing ? "Update Entry" : "Add Entry"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry: any) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.createdDate).toLocaleDateString()}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>${entry.amount}</TableCell>
                    <TableCell>{entry.category}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit({
                            id: entry.id,
                            date: new Date(entry.createdDate).toISOString().split('T')[0],
                            description: entry.description,
                            amount: entry.amount,
                            category: entry.category
                          })}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                          disabled={deleteMutation.isPending}
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

export default ManageEarnings;
