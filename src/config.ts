/**
 * Global Configuration for the Grocery Application
 * Maintainability requirement: Update settings here to automatically reflect
 * across all headers, document titles, footers, checkout receipts, and messages.
 */
export interface AppConfig {
  appName: string;
  currency: string;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  tagline: string;
  supportPhone: string;
  whatsappNumber: string;
  adminPassword: string;
  supportEmail: string;
  defaultDeliveryArea: string;
  estimatedDeliveryMinutes: number;
}

export const APP_CONFIG: AppConfig = {
  appName: "My Grocery",
  currency: "৳",
  deliveryCharge: 30,
  freeDeliveryThreshold: 500,
  tagline: "Farm-Fresh Groceries & Daily Kitchen Essentials",
  supportPhone: "+880 1712-345678",
  whatsappNumber: "8801712345678",
  adminPassword: "admin123",
  supportEmail: "care@mygrocery.com",
  defaultDeliveryArea: "Banani, Dhaka",
  estimatedDeliveryMinutes: 30,
};
