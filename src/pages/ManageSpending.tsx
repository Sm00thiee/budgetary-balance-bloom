import { useState, useEffect, useCallback, useMemo } from "react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { Pencil, Trash2, ArrowLeft, Plus, Filter, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { spendingService, Spending, SpendingCategory, CreateSpendingRequest, UpdateSpendingRequest, GetSpendingsRequest } from "@/services/spending.service";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryCombobox, MultiCategoryCombobox } from "@/components/CategoryCombobox";
import { Badge } from "@/components/ui/badge";

// Form validation schemas
const spendingFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  categoryId: z.number().min(1, "Category is required"),
  issueDate: z.date()
});

type SpendingFormValues = z.infer<typeof spendingFormSchema>;

// Filter form schema
const filterFormSchema = z.object({
  fromDate: z.date().optional().nullable(),
  toDate: z.date().optional().nullable(),
  categoryIds: z.array(z.number()).optional().default([])
});

type FilterFormValues = z.infer<typeof filterFormSchema>;

// Utility for debouncing
/**
 * Custom hook for debouncing values
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
const useDebounce = <T,>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ManageSpending = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [currentSpending, setCurrentSpending] = useState<Spending | null>(null);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<FilterFormValues>({
    fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    toDate: new Date(),
    categoryIds: []
  });
  
  // Debounce the filters to avoid too many API calls
  const debouncedFilters = useDebounce(filters, 500);
  
  // Forms
  const spendingForm = useForm<SpendingFormValues>({
    resolver: zodResolver(spendingFormSchema),
    defaultValues: {
      description: "",
      amount: 0,
      categoryId: 0,
      issueDate: new Date()
    }
  });
  
  const filterForm = useForm<FilterFormValues>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: filters
  });
  
  // Fetch categories with optimized fetching strategy
  const { 
    data: categoriesData, 
    isLoading: isCategoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ['spendingCategories'],
    queryFn: spendingService.getCategories
  });
  
  // Process categories data safely
  const categories = useMemo<SpendingCategory[]>(() => {
    try {
      if (!categoriesData) return [];
      
      // Handle different response formats
      if (Array.isArray(categoriesData)) {
        return [...categoriesData];
      }
      
      // Handle Axios response format
      const dataAny = categoriesData as any;
      
      if (dataAny.data !== undefined) {
        if (Array.isArray(dataAny.data)) {
          return [...dataAny.data];
        } else if (dataAny.data && typeof dataAny.data === 'object') {
          // Check for items in the data object
          if (dataAny.data.items && Array.isArray(dataAny.data.items)) {
            return [...dataAny.data.items];
          } else {
            // Look for any array in the data object
            const arrayInData = Object.values(dataAny.data).find(val => Array.isArray(val));
            if (arrayInData) {
              return [...arrayInData];
            }
          }
        }
      }
      // Check for items directly in the response
      else if (dataAny.items && Array.isArray(dataAny.items)) {
        return [...dataAny.items];
      }
      // Last resort - look for any array in the object
      else if (typeof dataAny === 'object') {
        const arrayValues = Object.values(dataAny).find(val => Array.isArray(val));
        if (arrayValues) {
          return [...arrayValues];
        }
      }
      
      return [];
    } catch (err) {
      console.error('Error processing categories data:', err);
      return [];
    }
  }, [categoriesData]);
  
  // Add global error handler for category errors
  useEffect(() => {
    if (categoriesError) {
      toast({
        title: "Error loading categories",
        description: categoriesError instanceof Error 
          ? categoriesError.message 
          : "Failed to load categories. Using cached data if available.",
        variant: "destructive",
      });
    }
  }, [categoriesError, toast]);
  
  /**
   * This effect is responsible for:
   * 1. Reading filter parameters from the URL when the page loads or URL changes
   * 2. Updating the local filter state
   * 3. Updating the form values to match
   * This enables URL sharing and bookmarking of filtered views
   */
  useEffect(() => {
    // Skip if we've just cleared the filters to avoid reapplying them
    if (location.search === '') {
      return;
    }
    
    const fromDateParam = searchParams.get('fromDate');
    const toDateParam = searchParams.get('toDate');
    const categoryIdsParam = searchParams.get('categoryIds');
    
    const newFilters: FilterFormValues = {
      fromDate: fromDateParam ? new Date(fromDateParam) : null,
      toDate: toDateParam ? new Date(toDateParam) : null,
      categoryIds: categoryIdsParam ? JSON.parse(categoryIdsParam) : []
    };
    
    // Only update if there are actual changes to avoid infinite loops
    if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
      setFilters(newFilters);
      filterForm.reset(newFilters);
      
      // Update filter applied state
      const hasActiveFilters = !!newFilters.fromDate || !!newFilters.toDate || newFilters.categoryIds.length > 0;
      setIsFilterApplied(hasActiveFilters);
      
      // Log for debugging
      console.log('Filters updated from URL:', newFilters, 'Is filter applied:', hasActiveFilters);
    }
  }, [location.search]);
  
  /**
   * This effect runs when the debounced filters change
   * It updates the URL query parameters to reflect the current filter state
   * This provides a way to share or bookmark filtered views
   */
  useEffect(() => {
    // Skip URL updates during filter clearing operation
    if (debouncedFilters.fromDate === null && 
        debouncedFilters.toDate === null && 
        debouncedFilters.categoryIds.length === 0) {
      // If all filters are null, ensure URL is cleared
      if (searchParams.toString() !== '') {
        setSearchParams(new URLSearchParams(), { replace: true });
      }
      return;
    }
    
    const newParams = new URLSearchParams();
    
    // Add optional filters only if they exist
    if (debouncedFilters.fromDate) {
      newParams.set('fromDate', debouncedFilters.fromDate.toISOString().split('T')[0]);
    }
    
    if (debouncedFilters.toDate) {
      newParams.set('toDate', debouncedFilters.toDate.toISOString().split('T')[0]);
    }
    
    if (debouncedFilters.categoryIds.length > 0) {
      newParams.set('categoryIds', JSON.stringify(debouncedFilters.categoryIds));
    }
    
    // Only update if parameters have changed
    if (newParams.toString() !== searchParams.toString()) {
      // Update URL without triggering a navigation
      setSearchParams(newParams, { replace: true });
    }
  }, [debouncedFilters, setSearchParams, searchParams]);
  
  /**
   * Format filters for the API request
   * Converts the UI date objects into the format expected by the API
   * Handles optional parameters by only including them when they have values
   */
  const getFormattedFilters = useCallback(() => {
    const formattedFilters: GetSpendingsRequest = {};
    
    if (debouncedFilters.fromDate) {
      formattedFilters.fromDate = spendingService.formatDateForApi(format(debouncedFilters.fromDate, 'yyyy-MM-dd'));
    }
    
    if (debouncedFilters.toDate) {
      formattedFilters.toDate = spendingService.formatDateForApi(format(debouncedFilters.toDate, 'yyyy-MM-dd'));
    }
    
    if (debouncedFilters.categoryIds.length > 0) {
      formattedFilters.categoryIds = debouncedFilters.categoryIds;
    }
    
    return formattedFilters;
  }, [debouncedFilters]);
  
  // Fetch spending records
  const { 
    data,
    isLoading: isSpendingsLoading,
    error: spendingsError,
    refetch: refetchSpendings
  } = useQuery({
    queryKey: ['spendings', debouncedFilters],
    queryFn: () => {
      setIsFilterLoading(true);
      
      // Get formatted filters for API
      const formattedFilters = getFormattedFilters();
      
      // Log the actual request being made
      console.log('Fetching spendings with formatted filters:', formattedFilters);
      
      return spendingService.getRecords(formattedFilters)
        .finally(() => {
          setIsFilterLoading(false);
          
          // Update filter applied state based on current filters
          const hasActiveFilters = !!debouncedFilters.fromDate || 
                                   !!debouncedFilters.toDate || 
                                   debouncedFilters.categoryIds.length > 0;
          setIsFilterApplied(hasActiveFilters);
          
          console.log('Filter loading complete. Is filter applied:', hasActiveFilters);
        });
    }
  });
  
  // Process spending data safely to ensure we always have an array
  const spendings = useMemo(() => {
    try {
      if (!data) return [];
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return [...data];
      }
      
      // Handle Axios response format
      const dataAny = data as any;
      
      if (dataAny.data !== undefined) {
        if (Array.isArray(dataAny.data)) {
          return [...dataAny.data];
        } else if (dataAny.data && typeof dataAny.data === 'object') {
          // Check for items in the data object
          if (dataAny.data.items && Array.isArray(dataAny.data.items)) {
            return [...dataAny.data.items];
          } else {
            // Look for any array in the data object
            const arrayInData = Object.values(dataAny.data).find(val => Array.isArray(val));
            if (arrayInData) {
              return [...arrayInData];
            }
          }
        }
      }
      // Check for items directly in the response
      else if (dataAny.items && Array.isArray(dataAny.items)) {
        return [...dataAny.items];
      }
      // Last resort - look for any array in the object
      else if (typeof dataAny === 'object') {
        const arrayValues = Object.values(dataAny).find(val => Array.isArray(val));
        if (arrayValues) {
          return [...arrayValues];
        }
      }
      
      // Return empty array as fallback
      console.warn('Could not extract spendings array from response data:', data);
      return [];
    } catch (err) {
      console.error('Error processing spendings data:', err);
      return [];
    }
  }, [data]);
  
  // Mutations
  const createSpendingMutation = useMutation({
    mutationFn: (data: SpendingFormValues) => {
      const request: CreateSpendingRequest = {
        description: data.description,
        amount: data.amount,
        categoryId: data.categoryId,
        issueDate: format(data.issueDate, 'yyyy-MM-dd\'T\'HH:mm:ss')
      };
      return spendingService.create(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spendings'] });
      setIsAddDialogOpen(false);
      spendingForm.reset();
      toast({
        title: "Success",
        description: "Spending entry created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create spending entry",
        variant: "destructive",
      });
    },
  });
  
  const updateSpendingMutation = useMutation({
    mutationFn: (data: SpendingFormValues) => {
      if (!currentSpending) throw new Error("No spending selected");
      const request: UpdateSpendingRequest = {
        id: currentSpending.id,
        description: data.description,
        amount: data.amount,
        categoryId: data.categoryId,
        issueDate: format(data.issueDate, 'yyyy-MM-dd\'T\'HH:mm:ss')
      };
      return spendingService.update(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spendings'] });
      setIsEditDialogOpen(false);
      setCurrentSpending(null);
      spendingForm.reset();
      toast({
        title: "Success",
        description: "Spending entry updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update spending entry",
        variant: "destructive",
      });
    },
  });
  
  const deleteSpendingMutation = useMutation({
    mutationFn: (id: number) => spendingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spendings'] });
      toast({
        title: "Success",
        description: "Spending entry deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete spending entry",
        variant: "destructive",
      });
    },
  });
  
  // Event handlers
  const handleCreateSpending = (values: SpendingFormValues) => {
    createSpendingMutation.mutate(values);
  };
  
  const handleUpdateSpending = (values: SpendingFormValues) => {
    updateSpendingMutation.mutate(values);
  };
  
  const handleDeleteSpending = (id: number) => {
    deleteSpendingMutation.mutate(id);
  };
  
  const handleOpenEditDialog = (spending: Spending) => {
    setCurrentSpending(spending);
    // Parse the date string from the API
    const issueDate = new Date(spending.issueDate);
    spendingForm.reset({
      description: spending.description,
      amount: spending.amount,
      categoryId: spending.categoryId,
      issueDate: issueDate
    });
    setIsEditDialogOpen(true);
  };
  
  /**
   * Apply user-selected filters
   * Called when the user submits the filter form
   */
  const handleApplyFilters = (values: FilterFormValues) => {
    setFilters(values);
    setIsFilterDialogOpen(false);
  };
  
  /**
   * Clear all filters to reset the view
   */
  const handleClearFilters = () => {
    // Create cleared filters object with explicitly empty values
    const clearedFilters: FilterFormValues = {
      fromDate: null,
      toDate: null,
      categoryIds: []
    };
    
    // Update state with cleared filters
    setFilters(clearedFilters);
    
    // Reset form with cleared values
    filterForm.reset(clearedFilters);
    
    // Mark filters as not applied
    setIsFilterApplied(false);
    
    // Important: Clear URL parameters completely
    if (searchParams.toString() !== '') {
      setSearchParams(new URLSearchParams(), { replace: true });
    }
    
    // Force a refetch of data with cleared filters
    queryClient.invalidateQueries({ queryKey: ['spendings'] });
    
    // Close filter dialog if open
    if (isFilterDialogOpen) {
      setIsFilterDialogOpen(false);
    }
    
    // Show confirmation toast
    toast({
      title: "Filters cleared",
      description: "All filters have been reset."
    });
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Get category name by ID
  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  };
  
  // Get formatted category names for an array of IDs
  const getCategoryNames = (categoryIds: number[]): string => {
    return categoryIds.map(id => getCategoryName(id)).join(', ');
  };
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="space-y-8 max-w-6xl mx-auto">
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
            <h1 className="text-3xl font-bold tracking-tight">Manage Spending</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsFilterDialogOpen(true)} 
              variant="outline"
              className={isFilterApplied ? "border-primary text-primary" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isFilterApplied ? "Filters Applied" : "Filter"}
              {isFilterLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
            {isFilterApplied && (
              <Button 
                onClick={handleClearFilters} 
                variant="outline" 
                size="icon"
                title="Clear all filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button onClick={() => {
              spendingForm.reset({
                description: '',
                amount: 0,
                categoryId: 0,
                issueDate: new Date()
              });
              setIsAddDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>

        {/* Loading and Error States */}
        {isSpendingsLoading ? (
          <Card>
            <CardContent className="flex justify-center items-center py-6">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p>Loading spending records...</p>
            </CardContent>
          </Card>
        ) : spendingsError ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">
                {spendingsError instanceof Error 
                  ? spendingsError.message 
                  : 'Failed to load spending records. Please try again.'}
              </p>
              <Button onClick={() => refetchSpendings()} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Spending History</CardTitle>
              <CardDescription>
                Showing {spendings.length} records
                {filters.fromDate && filters.toDate && 
                  ` from ${format(filters.fromDate, 'PPP')} to ${format(filters.toDate, 'PPP')}`
                }
                {filters.fromDate && !filters.toDate && 
                  ` from ${format(filters.fromDate, 'PPP')}`
                }
                {!filters.fromDate && filters.toDate && 
                  ` until ${format(filters.toDate, 'PPP')}`
                }
                {filters.categoryIds.length > 0 && 
                  ` in categories: ${getCategoryNames(filters.categoryIds)}`
                }
              </CardDescription>
              {isFilterApplied && (
                <div className="flex items-center mt-2">
                  <span className="text-xs text-muted-foreground mr-2">Active filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {filters.fromDate && (
                      <Badge variant="outline" className="text-xs">
                        From: {format(filters.fromDate, 'PP')}
                      </Badge>
                    )}
                    {filters.toDate && (
                      <Badge variant="outline" className="text-xs">
                        To: {format(filters.toDate, 'PP')}
                      </Badge>
                    )}
                    {filters.categoryIds.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Categories: {getCategoryNames(filters.categoryIds)}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-2 text-xs"
                      onClick={handleClearFilters}
                    >
                      Clear all
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {spendings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No records found. Try adjusting your filters or add a new entry.</p>
                  <Button 
                    onClick={() => {
                      spendingForm.reset({
                        description: '',
                        amount: 0,
                        categoryId: 0,
                        issueDate: new Date()
                      });
                      setIsAddDialogOpen(true);
                    }} 
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Entry
                  </Button>
                </div>
              ) : (
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
                    {spendings.map((spending) => (
                      <TableRow key={spending.id}>
                        <TableCell>{format(new Date(spending.issueDate), 'PP')}</TableCell>
                        <TableCell>{spending.description}</TableCell>
                        <TableCell>{formatCurrency(spending.amount)}</TableCell>
                        <TableCell>{spending.categoryName || getCategoryName(spending.categoryId)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenEditDialog(spending)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Spending Entry</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this spending entry? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteSpending(spending.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    {deleteSpendingMutation.isPending ? 'Deleting...' : 'Delete'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Add Spending Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Spending Entry</DialogTitle>
              <DialogDescription>
                Enter the details for your new spending entry.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...spendingForm}>
              <form onSubmit={spendingForm.handleSubmit(handleCreateSpending)} className="space-y-4">
                <FormField
                  control={spendingForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Grocery shopping" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={spendingForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0.01" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={spendingForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <CategoryCombobox
                          categories={categories}
                          isLoading={isCategoriesLoading}
                          hasError={!!categoriesError}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={spendingForm.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <DatePicker date={field.value} onSelect={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={createSpendingMutation.isPending}>
                    {createSpendingMutation.isPending ? "Creating..." : "Create Entry"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Spending Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Spending Entry</DialogTitle>
              <DialogDescription>
                Update the details for your spending entry.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...spendingForm}>
              <form onSubmit={spendingForm.handleSubmit(handleUpdateSpending)} className="space-y-4">
                <FormField
                  control={spendingForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Grocery shopping" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={spendingForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0.01" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={spendingForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <CategoryCombobox
                          categories={categories}
                          isLoading={isCategoriesLoading}
                          hasError={!!categoriesError}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={spendingForm.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <DatePicker date={field.value} onSelect={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={updateSpendingMutation.isPending}>
                    {updateSpendingMutation.isPending ? "Updating..." : "Update Entry"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Filter Dialog */}
        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Spending Records</DialogTitle>
              <DialogDescription>
                Set filters to narrow down your spending records. All filters are optional.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...filterForm}>
              <form onSubmit={filterForm.handleSubmit(handleApplyFilters)} className="space-y-4">
                <FormField
                  control={filterForm.control}
                  name="categoryIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categories (Optional)</FormLabel>
                      <div className="flex-grow">
                        <FormControl>
                          <MultiCategoryCombobox
                            categories={categories}
                            isLoading={isCategoriesLoading}
                            hasError={!!categoriesError}
                            selectedValues={field.value || []}
                            onChange={(values) => {
                              field.onChange(values);
                            }}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={filterForm.control}
                  name="fromDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>From Date (Optional)</FormLabel>
                      <div className="flex space-x-2">
                        <div className="flex-grow">
                          <DatePicker 
                            date={field.value} 
                            onSelect={field.onChange} 
                          />
                        </div>
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => field.onChange(null)}
                            title="Clear from date"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={filterForm.control}
                  name="toDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>To Date (Optional)</FormLabel>
                      <div className="flex space-x-2">
                        <div className="flex-grow">
                          <DatePicker 
                            date={field.value} 
                            onSelect={field.onChange}
                          />
                        </div>
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => field.onChange(null)}
                            title="Clear to date"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      handleClearFilters();
                      setIsFilterDialogOpen(false);
                    }}
                  >
                    Clear All Filters
                  </Button>
                  <Button type="submit">
                    Apply Filters
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ManageSpending;
