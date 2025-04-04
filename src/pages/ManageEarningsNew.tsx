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
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { earningsService } from "@/services/earnings.service";
import { formatCurrency, formatDate, displayValue } from "@/lib/table-utils";

interface EarningsEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface ApiResponse {
  items?: EarningsEntry[];
  [key: string]: any;
}

const CATEGORIES = [
  "Salary",
  "Investments",
  "Freelance",
  "Business",
  "Other",
];

const ManageEarningsNew = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<EarningsEntry>>({
    date: new Date().toISOString().split('T')[0]
  });
  const [earningsData, setEarningsData] = useState<EarningsEntry[]>([]);

  // Simplified data fetching
  const { isLoading } = useQuery({
    queryKey: ['earnings'],
    queryFn: async () => {
      try {
        const response = await earningsService.getAll();
        console.log('API response in ManageEarningsNew:', JSON.stringify(response));
        
        // Process the data safely
        let processedData: EarningsEntry[] = [];
        const data = response.data as ApiResponse; // Type assertion
        
        if (Array.isArray(data)) {
          processedData = data as EarningsEntry[];
        } else if (data?.items && Array.isArray(data.items)) {
          processedData = data.items;
        } else if (typeof data === 'object') {
          const arrayValues = Object.values(data).find(val => Array.isArray(val));
          if (arrayValues) {
            processedData = arrayValues as EarningsEntry[];
          }
        }
        
        console.log('Processed data in ManageEarningsNew:', processedData);
        
        // Log date information for the first few entries
        if (processedData.length > 0) {
          console.log('First processed item:', processedData[0]);
          console.log('Date field exists:', processedData[0].hasOwnProperty('date'));
          console.log('Date value:', processedData[0].date);
        }
        
        setEarningsData(processedData);
        return response;
      } catch (err) {
        console.error('Error fetching earnings:', err);
        setEarningsData([]);
        return null;
      }
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      description: string;
      amount: number;
      date: string;
      category: string;
    }) => {
      console.log('Creating earning with data:', data);
      console.log('Date being sent:', data.date);
      return earningsService.create(data);
    },
    onSuccess: (response) => {
      console.log('Create response:', response);
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
      toast({
        title: "Success",
        description: "Earnings entry added successfully",
      });
      setCurrentEntry({
        date: new Date().toISOString().split('T')[0]
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Create error:', error);
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
    }) => {
      console.log('Updating earning with id:', id);
      console.log('Update data:', data);
      console.log('Date being updated:', data.date);
      return earningsService.update(id, data);
    },
    onSuccess: (response) => {
      console.log('Update response:', response);
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
      toast({
        title: "Success",
        description: "Earnings entry updated successfully",
      });
      setCurrentEntry({
        date: new Date().toISOString().split('T')[0]
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Update error:', error);
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
    if (!currentEntry.description || !currentEntry.amount || !currentEntry.category || !currentEntry.date) {
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
        date: currentEntry.date || new Date().toISOString().split('T')[0]
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
            <CardTitle>{isEditing ? "Edit Earnings Entry" : "Add New Earnings Entry"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  type="date"
                  value={currentEntry.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, date: e.target.value })}
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
                {isLoading ? (
                  <TableLoading colSpan={5} />
                ) : earningsData.length > 0 ? (
                  earningsData.map((entry) => (
                    <TableRow key={entry.id || Math.random().toString()}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{displayValue(entry.description)}</TableCell>
                      <TableCell>{formatCurrency(entry.amount)}</TableCell>
                      <TableCell>{displayValue(entry.category)}</TableCell>
                      <TableCell>
                        <TableActions>
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
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableActions>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableEmpty colSpan={5} message="No earnings records found" />
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageEarningsNew; 