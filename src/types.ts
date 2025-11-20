export enum ReceiptStatus {
  PROCESSING = 'Procesando',
  VERIFIED = 'Verificado',
  REVIEW_NEEDED = 'Revisión Necesaria',
}

export interface ExtractedItem {
  description: string;
  price: number;
}

export interface ReceiptData {
  id: string;
  merchantName: string;
  totalAmount: number;
  currency: string;
  date: string; // ISO Date string
  category: string;
  customerDocument?: string; // Nuevo campo para Cédula/NIT
  items: ExtractedItem[];
  imageUrl: string;
  status: ReceiptStatus;
  uploadTimestamp: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export enum UserRole {
  ADMIN = 'Admin',
  ACCOUNTANT = 'Contador',
  VIEWER = 'Visualizador'
}