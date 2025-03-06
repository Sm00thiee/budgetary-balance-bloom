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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface EarningsEntry {
  id: number | string;
  date?: string;
  description: string;
  amount: number;
  category: string;
  createdDate?: string;
  lastUpdatedDate?: string;
  userId?: number;
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | number | null>(null);

  // Simplified data fetching
  const { isLoading } = useQuery({
    queryKey: ['earnings'],
    queryFn: async () => {
      try {
        const response = await earningsService.getAll();
        console.log('API response in ManageEarningsNew:', response);
        
        // Process the data safely
        let processedData: EarningsEntry[] = [];

        // Direct array from API
        if (Array.isArray(response)) {
          console.log('Response is a direct array:', response);
          processedData = response;
        }
        // Response has a data property that contains the array
        else if (response && response.data && Array.isArray(response.data)) {
          console.log('Found array in response.data:', response.data);
          processedData = response.data;
        }
        // Response has items property that contains the array
        else if (response && response.items && Array.isArray(response.items)) {
          console.log('Found array in response.items:', response.items);
          processedData = response.items;
        }
        // Look for any array in the response
        else if (response && typeof response === 'object') {
          console.log('Looking for arrays in response object');
          const arrayValues = Object.values(response).find(val => Array.isArray(val));
          if (arrayValues) {
            console.log('Found array in response object:', arrayValues);
            processedData = arrayValues;
          }
        }
        
        console.log('Processed data in ManageEarningsNew:', processedData);
        
        // Ensure each entry has a date field (use createdDate if date is missing)
        processedData = processedData.map(entry => ({
          ...entry,
          date: entry.date || (entry.createdDate ? entry.createdDate.split('T')[0] : undefined)
        }));
        
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
      
      // Ensure amount is a number
      const updatedData = {
        ...data,
        amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
      };
      
      // Format date if needed - API might expect ISO format
      if (updatedData.date && !updatedData.date.includes('T')) {
        // Append time part to make it a full ISO date
        updatedData.date = `${updatedData.date}T00:00:00`;
      }
      
      console.log('Formatted update data:', updatedData);
      return earningsService.update(id, updatedData);
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
        description: "Failed to update earnings entry. Please check your input and try again.",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      console.log('Deleting earning with id:', id);
      return earningsService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
      toast({
        title: "Success",
        description: "Earnings entry deleted successfully",
      });
      setEntryToDelete(null);
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete earnings entry",
        variant: "destructive",
      });
      setEntryToDelete(null);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentEntry.description || !currentEntry.amount || !currentEntry.date || !currentEntry.category) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (isEditing && currentEntry.id) {
      // Log what we're about to send for debugging
      console.log('Submitting update for entry:', currentEntry);
      
      updateMutation.mutate({ 
        id: String(currentEntry.id), 
        data: {
          description: currentEntry.description,
          amount: currentEntry.amount,
          date: currentEntry.date,
          category: currentEntry.category
        }
      });
    } else {
      createMutation.mutate({
        description: currentEntry.description || '',
        amount: currentEntry.amount || 0,
        date: currentEntry.date || new Date().toISOString().split('T')[0],
        category: currentEntry.category || ''
      });
    }
  };

  const handleEdit = (entry: EarningsEntry) => {
    console.log('Editing entry:', entry);
    // Format date for the form input
    let formattedDate = '';
    if (entry.date) {
      if (entry.date.includes('T')) {
        formattedDate = entry.date.split('T')[0];
      } else {
        formattedDate = entry.date;
      }
    } else if (entry.createdDate) {
      formattedDate = entry.createdDate.split('T')[0];
    } else {
      formattedDate = new Date().toISOString().split('T')[0];
    }
    
    setCurrentEntry({
      ...entry,
      date: formattedDate
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string | number) => {
    // Instead of immediately deleting, set the entry to delete and open the confirmation dialog
    setEntryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      deleteMutation.mutate(String(entryToDelete));
    }
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
                  earningsData.map((entry) => {
                    console.log('Rendering entry:', entry);
                    // Use date if available, otherwise use createdDate for display
                    const displayDate = entry.date || (entry.createdDate ? entry.createdDate.split('T')[0] : '');
                    
                    return (
                      <TableRow key={entry.id || Math.random().toString()}>
                        <TableCell>{formatDate(displayDate)}</TableCell>
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
                    );
                  })
                ) : (
                  <TableEmpty colSpan={5} message="No earnings records found" />
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add the confirmation dialog */}
      <ConfirmDialog 
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this earnings entry? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
      />
    </div>
  );
};

export default ManageEarningsNew; 