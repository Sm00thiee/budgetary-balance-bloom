import { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";
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
import axios, { AxiosResponse } from "axios";
import { formatCurrency, formatDate, displayValue } from "@/lib/table-utils";

// Error boundary component to catch rendering errors
class ErrorBoundary extends Component<
  { children: ReactNode, fallback?: ReactNode },
  { hasError: boolean, error: Error | null }
> {
  constructor(props: { children: ReactNode, fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong.</h2>
          <p className="mb-4">Error: {this.state.error?.message || "Unknown error"}</p>
          <Button 
            onClick={() => this.setState({ hasError: false, error: null })}
            variant="outline"
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple fallback component for when the page fails to load
const EarningsFallback = () => {
  const navigate = useNavigate();
  
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
        
        <Card className="p-8">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">There was an error loading the earnings data. Please try again later.</p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface EarningsEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

// Define the structure of API response to resolve typing issues
interface ApiResponse {
  items?: EarningsEntry[];
  data?: EarningsEntry[] | { items?: EarningsEntry[] };
  [key: string]: any;
}

const CATEGORIES = [
  "Salary",
  "Investments",
  "Freelance",
  "Business",
  "Other",
];

const ManageEarningsPage = () => {
  return (
    <ErrorBoundary fallback={<EarningsFallback />}>
      <ManageEarnings />
    </ErrorBoundary>
  );
};

const ManageEarnings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<EarningsEntry>>({
    date: new Date().toISOString().split('T')[0]
  });
  const [safeEntries, setSafeEntries] = useState<any[]>([]);

  // Fetch earnings data
  const { data, isLoading, error } = useQuery({
    queryKey: ['earnings'],
    queryFn: async () => {
      try {
        const response = await earningsService.getAll();
        console.log('Raw API response:', JSON.stringify(response));
        
        // Log the first item to inspect its structure
        if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
          console.log('First earning item:', response.data[0]);
          console.log('Date field exists:', response.data[0].hasOwnProperty('date'));
          console.log('Date value:', response.data[0].date);
        }
        
        return response;
      } catch (err) {
        console.error('Error fetching earnings:', err);
        return { items: [] };
      }
    },
  });

  // Process data safely when it changes
  useEffect(() => {
    console.log('Processing data:', data);
    try {
      // Default to empty array
      let processedData: any[] = [];
      
      // Process data based on its type and structure
      if (!data) {
        processedData = [];
      } else if (Array.isArray(data)) {
        processedData = [...data];
      } else {
        // Use type guards to safely check properties
        const dataAny = data as any;
        
        // Check if it's an Axios response with data property
        if (dataAny.data !== undefined) {
          if (Array.isArray(dataAny.data)) {
            processedData = [...dataAny.data];
          } else if (dataAny.data && typeof dataAny.data === 'object') {
            // Check for items in the data object
            if (dataAny.data.items && Array.isArray(dataAny.data.items)) {
              processedData = [...dataAny.data.items];
            } else {
              // Look for any array in the data object
              const arrayInData = Object.values(dataAny.data).find(val => Array.isArray(val));
              if (arrayInData) {
                processedData = [...arrayInData];
              }
            }
          }
        } 
        // Check for items directly in the response
        else if (dataAny.items && Array.isArray(dataAny.items)) {
          processedData = [...dataAny.items];
        } 
        // Last resort - look for any array in the object
        else if (typeof dataAny === 'object') {
          const arrayValues = Object.values(dataAny).find(val => Array.isArray(val));
          if (arrayValues) {
            processedData = [...arrayValues];
          }
        }
      }
      
      console.log('Processed data:', processedData);
      
      // Log date information for the first few entries
      if (processedData.length > 0) {
        console.log('First processed item:', processedData[0]);
        console.log('Date field exists in processed item:', processedData[0].hasOwnProperty('date'));
        console.log('Date value in processed item:', processedData[0].date);
        
        // Check if date is being properly formatted
        if (processedData[0].date) {
          console.log('Formatted date:', new Date(processedData[0].date).toLocaleDateString());
        }
      }
      
      setSafeEntries(processedData);
    } catch (error) {
      console.error('Error processing data:', error);
      setSafeEntries([]);
    }
  }, [data]);

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
      setCurrentEntry({
        date: new Date().toISOString().split('T')[0]
      });
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
      setCurrentEntry({
        date: new Date().toISOString().split('T')[0]
      });
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

  // Render helper function to safely display data
  const renderTableContent = () => {
    if (isLoading) {
      return <TableLoading colSpan={5} />;
    }
    
    if (!Array.isArray(safeEntries) || safeEntries.length === 0) {
      return <TableEmpty colSpan={5} message="No earnings records found" />;
    }
    
    return safeEntries.map((entry: any) => (
      <TableRow key={entry?.id || Math.random().toString()}>
        <TableCell>{formatDate(entry?.date)}</TableCell>
        <TableCell>{displayValue(entry?.description)}</TableCell>
        <TableCell>{formatCurrency(entry?.amount)}</TableCell>
        <TableCell>{displayValue(entry?.category)}</TableCell>
        <TableCell>
          <TableActions>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEdit({
                id: entry?.id,
                date: entry?.date ? entry.date : new Date().toISOString().split('T')[0],
                description: entry?.description || '',
                amount: typeof entry?.amount === 'number' ? entry.amount : 0,
                category: entry?.category || ''
              })}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(entry?.id)}
              disabled={deleteMutation.isPending || !entry?.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TableActions>
        </TableCell>
      </TableRow>
    ));
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
                {renderTableContent()}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageEarningsPage;
