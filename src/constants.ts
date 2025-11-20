import { ReceiptData, ReceiptStatus } from "./types";

export const MOCK_RECEIPTS: ReceiptData[] = [
  {
    id: 'r-101',
    merchantName: 'Uber Technologies',
    totalAmount: 24.50,
    currency: 'USD',
    date: '2023-10-25',
    category: 'Transporte',
    customerDocument: '1020304050',
    items: [{ description: 'Viaje al Aeropuerto', price: 24.50 }],
    imageUrl: 'https://picsum.photos/200/300',
    status: ReceiptStatus.VERIFIED,
    uploadTimestamp: 1698220000000
  },
  {
    id: 'r-102',
    merchantName: 'Starbucks Coffee',
    totalAmount: 12.75,
    currency: 'USD',
    date: '2023-10-26',
    category: 'Alimentación',
    customerDocument: '987654321',
    items: [{ description: 'Latte', price: 5.50 }, { description: 'Sandwich', price: 7.25 }],
    imageUrl: 'https://picsum.photos/200/301',
    status: ReceiptStatus.VERIFIED,
    uploadTimestamp: 1698306400000
  },
  {
    id: 'r-103',
    merchantName: 'AWS Services',
    totalAmount: 145.00,
    currency: 'USD',
    date: '2023-10-27',
    category: 'Software',
    customerDocument: '800123456',
    items: [{ description: 'Monthly Hosting', price: 145.00 }],
    imageUrl: 'https://picsum.photos/200/302',
    status: ReceiptStatus.REVIEW_NEEDED,
    uploadTimestamp: 1698392800000
  }
];

export const CATEGORIES = ['Alimentación', 'Transporte', 'Servicios', 'Software', 'Oficina', 'Otros'];