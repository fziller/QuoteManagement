export type Quote = {
  collectionId: string;
  collectionName: string;
  created: string;
  customer_info: {
    address: string;
    city: string;
    country: string;
    email: string;
    name: string;
    phone: string;
  };
  description: string;
  id: string;
  items: QuoteItem[];
  status: QuoteStatus;
  subtotal: number;
  total: number;
  total_tax: number;
  updated: string;
  valid_until: string;
};

export type QuoteItem = {
  price: number;
  product_name: string;
  quantity: number;
  subtotal: number;
};

export type QuoteResponse = {
  items: Quote[];
  totalPages: number;
};

export type QuoteRequest = {
  customer_info: {
    address?: string;
    city?: string;
    country?: string;
    email: string;
    name: string;
    phone?: string;
  };
  items: QuoteItem[];
  status: QuoteStatus;
  subtotal: number;
  total: number;
  total_tax: number;
};

export enum QuoteStatus {
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
  SENT = "SENT",
  DRAFT = "DRAFT",
  EXPIRED = "EXPIRED",
}
