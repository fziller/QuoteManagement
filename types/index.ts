export interface Quote extends QuoteRequest {
  collectionId: string;
  collectionName: string;
  created: string;
  description: string;
  id: string;
  updated: string;
  valid_until: string;
}

export interface QuoteItem {
  price: number;
  product_name: string;
  quantity: number;
  subtotal: number;
}

export interface QuoteRequest {
  customer_info: {
    address?: string;
    city?: string;
    country?: string;
    email: string;
    name: string;
    phone?: string;
  };
  id: string;
  items: QuoteItem[];
  status: QuoteStatus;
  subtotal: number;
  total: number;
  total_tax: number;
}

export enum QuoteStatus {
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
  SENT = "SENT",
  DRAFT = "DRAFT",
  EXPIRED = "EXPIRED",
}

/*
Example:
{
    "attributes": null,
    "collectionId": "t4wz0elig5i32iq",
    "collectionName": "products",
    "created": "2025-01-13 16:14:18.867Z",
    "description": "Featuring Dubnium-enhanced technology, our Keyboard offers unparalleled queasy performance",
    "id": "ra1828ll43yhesf",
    "in_stock": false,
    "price": 932.99,
    "title": "Bespoke Frozen Table",
    "updated": "2025-01-13 16:14:18.867Z"
},
*/
export type Product = {
  attributes?: null;
  collectionId: string;
  collectionName: string;
  created: string;
  description: string;
  id: string;
  in_stock: boolean;
  price: number;
  title: string;
  updated: string;
};

export type ProductResponse = {
  pageParams: number[];
  pages: ProductResponsePage[];
};

export type ProductResponsePage = {
  items: Product[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

export type QuoteResponse = {
  items: Quote[];
  totalPages: number;
};
