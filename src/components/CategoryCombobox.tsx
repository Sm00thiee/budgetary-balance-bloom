import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SpendingCategory, spendingService } from "@/services/spending.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface CategoryComboboxProps {
  categories: SpendingCategory[];
  isLoading: boolean;
  hasError: boolean;
  value: number;
  onChange: (value: number) => void;
}

export function CategoryCombobox({
  categories,
  isLoading,
  hasError,
  value,
  onChange,
}: CategoryComboboxProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isCreatingMode, setIsCreatingMode] = useState(false);
  const [pendingValue, setPendingValue] = useState("");

  // Find the selected category
  const selectedCategory = categories.find(
    (category) => category.id === value
  );

  // Initialize input value with selected category name when component mounts or value changes
  React.useEffect(() => {
    if (selectedCategory && !inputValue) {
      setInputValue(selectedCategory.name);
    }
  }, [selectedCategory, value]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue && !isCreatingMode && !exactMatch) {
      e.preventDefault();
      handleCreateCategory();
    }
  };

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => {
      return spendingService.createCategory({
        name,
        description: `Created from spending form for '${name}'`,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["spendingCategories"] });
      onChange(data.id);
      setInputValue("");
      setIsCreatingMode(false);
      toast({
        title: "Category created",
        description: `Category '${data.name}' has been created successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });

  // Handle popover state changes
  React.useEffect(() => {
    // When popover closes, check if there's a pending value to create
    if (!open && pendingValue) {
      const exactMatch = categories.find(
        category => category.name.toLowerCase() === pendingValue.toLowerCase()
      );
      
      if (exactMatch) {
        // If there's an exact match, select it
        onChange(exactMatch.id);
      } else if (pendingValue.trim()) {
        // If there's a valid pending value with no match, create a new category
        createCategoryMutation.mutate(pendingValue.trim());
      }
      
      setPendingValue("");
    }
  }, [open, pendingValue, categories, onChange, createCategoryMutation]);

  // Filter categories based on input
  const filteredCategories = inputValue
    ? categories.filter((category) =>
        category.name.toLowerCase().includes(inputValue.toLowerCase())
      )
    : categories;

  // Check if the input matches any existing category exactly
  const exactMatch = categories.find(
    (category) => 
      category.name.toLowerCase() === inputValue.toLowerCase()
  );

  // Handle select, toggle the dropdown
  const handleSelect = (categoryId: number) => {
    onChange(categoryId);
    setOpen(false);
    setPendingValue("");
  };

  // Handle create new category
  const handleCreateCategory = () => {
    if (!inputValue.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    createCategoryMutation.mutate(inputValue.trim());
  };

  // Handle popover open/close
  const handleOpenChange = (newOpen: boolean) => {
    // If closing and there's a new category name entered
    if (!newOpen && inputValue && 
        !categories.some(c => c.name.toLowerCase() === inputValue.toLowerCase()) && 
        inputValue !== selectedCategory?.name) {
      setPendingValue(inputValue);
    }
    setOpen(newOpen);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading categories...</span>
            </div>
          ) : hasError ? (
            "Error loading categories"
          ) : value && selectedCategory ? (
            selectedCategory.name
          ) : (
            "Select or create a category"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]">
        <Command onKeyDown={handleKeyDown}>
          <CommandInput 
            placeholder="Search or create category..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading categories...</span>
              </div>
            ) : hasError ? (
              <CommandEmpty>Error loading categories</CommandEmpty>
            ) : (
              <>
                {filteredCategories.length === 0 && (
                  <CommandEmpty>
                    No categories found. Press enter to create "{inputValue}".
                  </CommandEmpty>
                )}
                <CommandGroup heading="Categories">
                  {filteredCategories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => handleSelect(category.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === category.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {category.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {inputValue && !exactMatch && !isLoading && !hasError && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Actions">
                  <CommandItem
                    onSelect={() => {
                      setIsCreatingMode(true);
                      handleCreateCategory();
                    }}
                  >
                    {createCategoryMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create "{inputValue}"
                      </>
                    )}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// New component for multi-selection
interface MultiCategoryComboboxProps {
  categories: SpendingCategory[];
  isLoading: boolean;
  hasError: boolean;
  selectedValues: number[];
  onChange: (values: number[]) => void;
}

export function MultiCategoryCombobox({
  categories,
  isLoading,
  hasError,
  selectedValues,
  onChange,
}: MultiCategoryComboboxProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isCreatingMode, setIsCreatingMode] = useState(false);

  // Selected categories
  const selectedCategories = categories.filter(
    (category) => selectedValues.includes(category.id)
  );

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue && !isCreatingMode && !exactMatch) {
      e.preventDefault();
      handleCreateCategory();
    }
  };

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => {
      return spendingService.createCategory({
        name,
        description: `Created from filter for '${name}'`,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["spendingCategories"] });
      // Add the new category to the selected values
      onChange([...selectedValues, data.id]);
      setInputValue("");
      setIsCreatingMode(false);
      toast({
        title: "Category created",
        description: `Category '${data.name}' has been created and selected.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });

  // Filter categories based on input
  const filteredCategories = inputValue
    ? categories.filter((category) =>
        category.name.toLowerCase().includes(inputValue.toLowerCase())
      )
    : categories;

  // Check if the input matches any existing category exactly
  const exactMatch = categories.find(
    (category) => 
      category.name.toLowerCase() === inputValue.toLowerCase()
  );

  // Handle toggle selection of a category
  const toggleCategorySelection = (categoryId: number) => {
    if (selectedValues.includes(categoryId)) {
      // Remove from selection
      onChange(selectedValues.filter(id => id !== categoryId));
    } else {
      // Add to selection
      onChange([...selectedValues, categoryId]);
    }
  };

  // Handle create new category
  const handleCreateCategory = () => {
    if (!inputValue.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // Check if category already exists
    const existingCategory = categories.find(
      c => c.name.toLowerCase() === inputValue.toLowerCase()
    );

    if (existingCategory) {
      // If it exists, just add it to the selection
      if (!selectedValues.includes(existingCategory.id)) {
        onChange([...selectedValues, existingCategory.id]);
      }
      setInputValue("");
    } else {
      // Create new category
      createCategoryMutation.mutate(inputValue.trim());
    }
  };

  // Remove a category from selection
  const removeCategory = (categoryId: number) => {
    onChange(selectedValues.filter(id => id !== categoryId));
  };

  return (
    <div className="space-y-2">
      {/* Display selected categories as badges */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedCategories.map(category => (
            <Badge 
              key={category.id} 
              variant="secondary" 
              className="text-xs px-2 py-1 flex items-center gap-1"
            >
              {category.name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => removeCategory(category.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {selectedCategories.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => onChange([])}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
      
      {/* Dropdown for selecting categories */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading categories...</span>
              </div>
            ) : hasError ? (
              "Error loading categories"
            ) : selectedValues.length > 0 ? (
              selectedValues.length === 1 
                ? `${selectedCategories[0]?.name || 'Unknown'}`
                : `${selectedValues.length} categories selected`
            ) : (
              "Select categories"
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[300px]">
          <Command onKeyDown={handleKeyDown}>
            <CommandInput 
              placeholder="Search or create category..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Loading categories...</span>
                </div>
              ) : hasError ? (
                <CommandEmpty>Error loading categories</CommandEmpty>
              ) : (
                <>
                  {filteredCategories.length === 0 && (
                    <CommandEmpty>
                      No categories found. Press enter to create "{inputValue}".
                    </CommandEmpty>
                  )}
                  <CommandGroup heading="Categories">
                    {filteredCategories.map((category) => (
                      <CommandItem
                        key={category.id}
                        value={category.name}
                        onSelect={() => toggleCategorySelection(category.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedValues.includes(category.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {category.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {inputValue && !exactMatch && !isLoading && !hasError && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Actions">
                    <CommandItem
                      onSelect={() => {
                        setIsCreatingMode(true);
                        handleCreateCategory();
                      }}
                    >
                      {createCategoryMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create "{inputValue}"
                        </>
                      )}
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 