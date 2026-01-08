
import { FunctionCall } from '@google/genai';

// --- UI & UX Models ---
export type Theme = 'light' | 'dark' | 'system';
export type Page = 
  | 'login' | 'dashboard' | 'sales' | 'add-sale' | 'purchases' | 'add-purchase' 
  | 'customers' | 'add-customer' | 'suppliers' | 'add-supplier' | 'categories' 
  | 'add-category' | 'vouchers' | 'add-voucher' | 'voucher-details' | 'ai-advisor' 
  | 'notifications' | 'expenses' | 'add-expense' | 'debts' | 'add-opening-balance' 
  | 'reports' | 'settings' | 'scanner' | 'invoice-view' | 'purchase-invoice-view' 
  | 'waste' | 'add-waste' | 'activity-log' | 'returns' | 'account-statement';

// --- Finance & Offline Models ---
// Added missing ExchangeRates interface
export interface ExchangeRates {
  SAR_TO_YER: number;
  OMR_TO_YER: number;
}

// Added missing OfflineOperation interface
export interface OfflineOperation {
  id: string;
  userId: string;
  action: 'saveSale' | 'savePurchase' | 'saveCustomer' | 'saveSupplier' | 'saveVoucher' | 'saveExpense' | 'saveCategory' | 'deleteRecord' | 'updateSettings' | 'saveWaste' | 'saveExpenseTemplate' | 'saveOpeningBalance' | 'returnSale' | 'returnPurchase';
  payload: any;
  timestamp: number;
  tempId?: string;
  originalId?: string;
}

// --- Core Data Models ---
export type Currency = 'YER' | 'SAR' | 'OMR';
export type TransactionStatus = 'نقدي' | 'آجل';

export interface User {
  id: string;
  email: string;
  full_name: string;
  agency_name: string;
  whatsapp_number?: string;
  enable_voice_ai?: boolean;
  appearance_settings?: {
    theme: Theme;
    accent_color: string;
  };
  accounting_settings?: {
    allow_negative_stock: boolean;
    auto_share_whatsapp: boolean;
    decimal_precision: number;
    backup_frequency?: 'daily' | '12h';
    show_debt_alerts?: boolean;
  };
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  region?: string;
}

// --- Financial Transactions ---
interface BaseTransaction {
  id: string;
  user_id?: string;
  qat_type: string;
  quantity: number;
  unit_price: number;
  total: number;
  status: TransactionStatus;
  currency: Currency;
  notes?: string;
  date: string;
  is_returned?: boolean;
  returned_at?: string;
  image_url?: string;
}

export interface Sale extends BaseTransaction {
  customer_id: string;
  customer_name: string;
}

export interface Purchase extends BaseTransaction {
  supplier_id: string;
  supplier_name: string;
}

export interface Voucher {
  id: string;
  user_id?: string;
  type: 'قبض' | 'دفع';
  person_id: string;
  person_name: string;
  person_type: 'عميل' | 'مورد';
  amount: number;
  currency: Currency;
  notes: string;
  date: string;
  balance_type?: 'مدين' | 'دائن';
}

// --- Inventory & Expenses ---
export interface QatCategory {
  id: string;
  name: string;
  stock: number;
  price: number;
  currency: Currency;
  low_stock_threshold: number;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  currency: Currency;
  date: string;
  image_url?: string;
  notes?: string;
}

// Added missing ExpenseTemplate interface
export interface ExpenseTemplate {
  id: string;
  user_id?: string;
  title: string;
  category: string;
  amount: number;
  currency: Currency;
  frequency: string;
  created_at?: string;
}

export interface Waste {
  id: string;
  qat_type: string;
  quantity: number;
  estimated_loss: number;
  reason: string;
  date: string;
  updated_at?: string;
}

// --- System Operations ---
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'ai_alert';
  date: string;
  read: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'sale' | 'purchase' | 'voucher' | 'waste' | 'general' | 'auth' | 'settings' | 'expense' | 'data';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export class AppError extends Error {
  constructor(public message: string, public code?: string, public status?: number) {
    super(message);
    this.name = 'AppError';
  }
}