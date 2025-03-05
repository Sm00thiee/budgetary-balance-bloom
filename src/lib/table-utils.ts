import { format } from "date-fns";

/**
 * Consistently format a currency value
 * @param amount The amount to format
 * @param currency The currency symbol to use (default: $)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | null | undefined, currency: string = "$"): string => {
  if (amount === null || amount === undefined) return `${currency}0.00`;
  return `${currency}${amount.toFixed(2)}`;
};

/**
 * Consistently format a date value
 * @param date The date to format (string or Date)
 * @param formatString The date format to use (default: MMM dd, yyyy)
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date | null | undefined, formatString: string = "MMM dd, yyyy"): string => {
  if (!date) return "N/A";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid date";
    return format(dateObj, formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Error";
  }
};

/**
 * Safely handle potentially undefined or null values
 * @param value The value to check
 * @param defaultValue The default value to return if value is null/undefined
 * @returns The original value or default value
 */
export const safeValue = <T>(value: T | null | undefined, defaultValue: T): T => {
  return value === null || value === undefined ? defaultValue : value;
};

/**
 * Get a display value with a fallback for null/undefined
 * @param value The value to check
 * @param fallback Fallback text to show if value is null/undefined/empty
 * @returns The original value or fallback text
 */
export const displayValue = (value: string | number | null | undefined, fallback: string = "N/A"): string => {
  if (value === null || value === undefined) return fallback;
  if (value === "") return fallback;
  return String(value);
}; 