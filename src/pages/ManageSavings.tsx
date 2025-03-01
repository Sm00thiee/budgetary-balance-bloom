import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2, ArrowLeft, Plus, Coins, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { savingsService, Saving, CreateSavingsRequest, UpdateSavingsRequest } from "@/services/savings.service";
import { API_CONFIG } from "@/config/api.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form validation schemas
const savingsFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  amount: z.number().min(0, "Amount must be positive"),
  goal: z.number().min(1, "Goal must be greater than 0"),
});

const transactionFormSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
});

type SavingsFormValues = z.infer<typeof savingsFormSchema>;
type TransactionFormValues = z.infer<typeof transactionFormSchema>;

const ManageSavings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [currentSaving, setCurrentSaving] = useState<Saving | null>(null);
  
  // Forms
  const savingsForm = useForm<SavingsFormValues>({
    resolver: zodResolver(savingsFormSchema),
    defaultValues: {
      name: "",
      description: "",
      amount: 0,
      goal: 0,
    },
  });
  
  const depositForm = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: 0,
    },
  });
  
  const withdrawForm = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: 0,
    },
  });

  // Fetch savings data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['savings'],
    queryFn: async () => {
      try {
        const response = await savingsService.getAll();
        console.log('API response for savings:', response);
        return response;
      } catch (error) {
        console.error('Error in React Query fetch:', error);
        throw error; // Let React Query handle the error
      }
    },
    retry: 2, // Retry failed requests up to 2 times
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
  
  // Process data safely to ensure we always have an array
  const savings = useMemo(() => {
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
      console.warn('Could not extract savings array from response data:', data);
      return [];
    } catch (err) {
      console.error('Error processing savings data:', err);
      return [];
    }
  }, [data]);

  // Error state component to show more details
  const ErrorDisplay = ({ error }: { error: any }) => {
    const [showDebug, setShowDebug] = useState(false);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 mb-2">
            {error instanceof Error ? error.message : 'Error loading savings accounts. Please try again later.'}
          </p>
          <div className="flex gap-2 mt-2">
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => setShowDebug(!showDebug)}>
              {showDebug ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
          
          {showDebug && (
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-md text-xs overflow-auto max-h-60">
              <p className="font-semibold mb-1">API Configuration:</p>
              <p>Base URL: {API_CONFIG.baseUrl}</p>
              <p>Endpoint: {API_CONFIG.endpoints.savings.list}</p>
              <p className="font-semibold mt-2 mb-1">Error Details:</p>
              <pre>{JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Mutations
  const createSavingsMutation = useMutation({
    mutationFn: (data: SavingsFormValues) => 
      savingsService.create(data as CreateSavingsRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      setIsAddDialogOpen(false);
      savingsForm.reset();
      toast({
        title: "Success",
        description: "Savings account created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create savings account",
        variant: "destructive",
      });
    },
  });

  const updateSavingsMutation = useMutation({
    mutationFn: (data: { id: number; data: Partial<SavingsFormValues> }) => 
      savingsService.update(data.id, data.data as UpdateSavingsRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      setIsEditDialogOpen(false);
      setCurrentSaving(null);
      toast({
        title: "Success",
        description: "Savings account updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update savings account",
        variant: "destructive",
      });
    },
  });

  const deleteSavingsMutation = useMutation({
    mutationFn: (id: number) => savingsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      toast({
        title: "Success",
        description: "Savings account deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete savings account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const depositMutation = useMutation({
    mutationFn: savingsService.deposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      setIsDepositDialogOpen(false);
      depositForm.reset();
      setCurrentSaving(null);
      toast({
        title: "Success",
        description: "Deposit completed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete deposit",
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: savingsService.withdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      setIsWithdrawDialogOpen(false);
      withdrawForm.reset();
      setCurrentSaving(null);
      toast({
        title: "Success",
        description: "Withdrawal completed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete withdrawal. Check that you have sufficient funds.",
        variant: "destructive",
      });
    },
  });

  // Handle form submissions
  const handleCreateSavings = (values: SavingsFormValues) => {
    createSavingsMutation.mutate(values);
  };

  const handleUpdateSavings = (values: SavingsFormValues) => {
    if (currentSaving) {
      updateSavingsMutation.mutate({
        id: currentSaving.id,
        data: values,
      });
    }
  };

  const handleDeposit = (values: TransactionFormValues) => {
    if (currentSaving) {
      depositMutation.mutate({
        savingsId: currentSaving.id,
        amount: values.amount,
      });
    }
  };

  const handleWithdraw = (values: TransactionFormValues) => {
    if (currentSaving) {
      withdrawMutation.mutate({
        savingsId: currentSaving.id,
        amount: values.amount,
      });
    }
  };

  const handleDelete = (id: number) => {
    console.log(`Attempting to delete savings account with ID: ${id}`);
    toast({
      title: "Processing",
      description: "Deleting savings account...",
    });
    deleteSavingsMutation.mutate(id);
  };

  // Open edit dialog and set form values
  const openEditDialog = (saving: Saving) => {
    setCurrentSaving(saving);
    savingsForm.reset({
      name: saving.name || "",
      description: saving.description || "",
      amount: saving.amount,
      goal: saving.goal,
    });
    setIsEditDialogOpen(true);
  };

  // Open deposit dialog
  const openDepositDialog = (saving: Saving) => {
    setCurrentSaving(saving);
    depositForm.reset({ amount: 0 });
    setIsDepositDialogOpen(true);
  };

  // Open withdraw dialog
  const openWithdrawDialog = (saving: Saving) => {
    setCurrentSaving(saving);
    withdrawForm.reset({ amount: 0 });
    setIsWithdrawDialogOpen(true);
  };

  // Calculate progress percentage
  const calculateProgress = (amount: number, goal: number) => {
    return Math.min(Math.round((amount / goal) * 100), 100);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
            <h1 className="text-3xl font-bold tracking-tight">Manage Savings</h1>
          </div>
          <Button onClick={() => {
            savingsForm.reset();
            setIsAddDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Savings Account
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <p>Loading savings accounts...</p>
          </div>
        ) : error ? (
          <ErrorDisplay error={error} />
        ) : savings.length === 0 ? (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Coins className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Savings Accounts Yet</h3>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                Start saving for your future by creating your first savings account.
              </p>
              <Button onClick={() => {
                savingsForm.reset();
                setIsAddDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Savings Account
                </Button>
          </CardContent>
        </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savings.map((saving: Saving) => (
              <Card key={saving.id} className="overflow-hidden">
          <CardHeader>
                  <CardTitle>{saving.name || `Savings Account ${saving.id}`}</CardTitle>
                  {saving.description && (
                    <CardDescription>{saving.description}</CardDescription>
                  )}
          </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                    <p className="text-2xl font-bold">{formatCurrency(saving.amount)}</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm text-muted-foreground">Goal: {formatCurrency(saving.goal)}</p>
                      <p className="text-sm font-medium">{calculateProgress(saving.amount, saving.goal)}%</p>
                    </div>
                    <Progress value={calculateProgress(saving.amount, saving.goal)} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => openDepositDialog(saving)}
                    >
                      <ArrowUpCircle className="h-4 w-4 mr-1" />
                      Deposit
                    </Button>
                        <Button
                      size="sm" 
                          variant="outline"
                      onClick={() => openWithdrawDialog(saving)}
                    >
                      <ArrowDownCircle className="h-4 w-4 mr-1" />
                      Withdraw
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(saving)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Savings Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this savings account? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        
                        {deleteSavingsMutation.isError && (
                          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md text-xs overflow-auto max-h-40">
                            <p className="font-semibold mb-1">Error Details:</p>
                            <p>{deleteSavingsMutation.error instanceof Error ? deleteSavingsMutation.error.message : 'Unknown error'}</p>
                            <p className="font-semibold mt-2 mb-1">API Configuration:</p>
                            <p>Endpoint: {API_CONFIG.endpoints.savings.delete}</p>
                            <p>Payload: {JSON.stringify({ id: saving.id })}</p>
                          </div>
                        )}
                        
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(saving.id)}
                            className="bg-red-500 hover:bg-red-600"
                            disabled={deleteSavingsMutation.isPending}
                          >
                            {deleteSavingsMutation.isPending ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                      </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Add Savings Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Savings Account</DialogTitle>
              <DialogDescription>
                Enter the details for your new savings account.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...savingsForm}>
              <form onSubmit={savingsForm.handleSubmit(handleCreateSavings)} className="space-y-4">
                <FormField
                  control={savingsForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Vacation Fund, Emergency Fund" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={savingsForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="A brief description of this savings goal" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={savingsForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={savingsForm.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Savings Goal</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={createSavingsMutation.isPending}>
                    {createSavingsMutation.isPending ? "Creating..." : "Create Account"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Savings Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Savings Account</DialogTitle>
              <DialogDescription>
                Update the details for your savings account.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...savingsForm}>
              <form onSubmit={savingsForm.handleSubmit(handleUpdateSavings)} className="space-y-4">
                <FormField
                  control={savingsForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Vacation Fund, Emergency Fund" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={savingsForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="A brief description of this savings goal" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={savingsForm.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Savings Goal</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={updateSavingsMutation.isPending}>
                    {updateSavingsMutation.isPending ? "Updating..." : "Update Account"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Deposit Dialog */}
        <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit to Savings</DialogTitle>
              <DialogDescription>
                Enter the amount you want to deposit to {currentSaving?.name || "this account"}.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...depositForm}>
              <form onSubmit={depositForm.handleSubmit(handleDeposit)} className="space-y-4">
                <FormField
                  control={depositForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0.01" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Current balance: {currentSaving ? formatCurrency(currentSaving.amount) : '$0.00'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={depositMutation.isPending}>
                    {depositMutation.isPending ? "Processing..." : "Deposit"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Withdraw Dialog */}
        <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw from Savings</DialogTitle>
              <DialogDescription>
                Enter the amount you want to withdraw from {currentSaving?.name || "this account"}.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...withdrawForm}>
              <form onSubmit={withdrawForm.handleSubmit(handleWithdraw)} className="space-y-4">
                <FormField
                  control={withdrawForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Withdrawal Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0.01" 
                          max={currentSaving?.amount || 0}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Available balance: {currentSaving ? formatCurrency(currentSaving.amount) : '$0.00'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={withdrawMutation.isPending || withdrawForm.getValues().amount > (currentSaving?.amount || 0)}
                  >
                    {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
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

export default ManageSavings;
