import { format } from "date-fns";

/**
 * Consistently format a currency value
 * @param amount The amount to format
 * @param currency The currency symbol to use (default: $)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string | undefined): string => {
  if (amount === undefined || amount === null) return "—";

  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * Consistently format a date value
 * @param date The date to format (string or Date)
 * @param formatString The date format to use (default: MMM dd, yyyy)
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date | undefined): string => {
  if (!date) {
    console.log("formatDate: No date provided");
    return "—";
  }

  try {
    console.log("formatDate: Processing date:", date);

    // Handle ISO date strings or date objects
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.error("formatDate: Invalid date:", date);
      return "Invalid date";
    }

    // Format date as MM/DD/YYYY
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");
    const year = dateObj.getFullYear();

    const formatted = `${month}/${day}/${year}`;
    console.log("formatDate: Formatted result:", formatted);

    return formatted;
  } catch (error) {
    console.error("formatDate: Error formatting date:", date, error);
    return "Error";
  }
};

/**
 * Safely handle potentially undefined or null values
 * @param value The value to check
 * @param defaultValue The default value to return if value is null/undefined
 * @returns The original value or default value
 */
export const safeValue = <T>(
  value: T | null | undefined,
  defaultValue: T
): T => {
  return value === null || value === undefined ? defaultValue : value;
};

/**
 * Get a display value with a fallback for null/undefined
 * @param value The value to check
 * @param fallback Fallback text to show if value is null/undefined/empty
 * @returns The original value or fallback text
 */
export const displayValue = (value: any): string => {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
};
