export type UsageType = 'personal' | 'commercial';

export type OrderStatus = 'pending' | 'in_progress' | 'in_review' | 'completed' | 'cancelled';

export type PaymentMethod = 'mercadopago' | 'polar' | 'test';

export interface CustomerUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  discord?: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface CommissionOption {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Commission {
  id: string;
  title: string;
  slug: string;
  priceMin: number;
  priceMax?: number;
  slotsAvailable: number;
  deliveryDays: number;
  samples: string[];
  additionalInfo: string[];
  description: string;
  options: CommissionOption[];
  active: boolean;
  category?: string;
}

export interface CommissionOrderData {
  usageType: UsageType;
  brief: string;
  references: string;
  selectedOptions: string[]; // Option IDs
  customerEmail: string;
  customerName: string;
  customNotes?: string;
}

export interface CartItem {
  id: string;
  commissionId: string;
  title: string;
  unitPrice: number;
  quantity: number;
  commissionData: CommissionOrderData;
  sampleImage: string;
  selectedOptionNames: string[];
}

export type MessageType =
  | 'message'
  | 'sketch_submission'
  | 'sketch_approval'
  | 'revision_request'
  | 'final_delivery'
  | 'system';

export interface OrderMessage {
  id: string;
  orderId: string;
  sender: 'artist' | 'customer';
  senderName: string;
  text: string;
  attachmentUrl?: string;
  attachmentName?: string;
  type: MessageType;
  createdAt: string;
  isRead: boolean;
}

export interface DeliveredFile {
  name: string;
  url: string;
  size?: string;
  uploadedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  estimatedDelivery?: string;
  paymentUrl?: string;
  messages?: OrderMessage[];
  deliveredFiles?: DeliveredFile[];
}

export interface ArtistProfile {
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  bannerUrl?: string;
  rating: number;
  reviewsCount: number;
  totalCompletedCommissions: number;
  socialLinks: {
    platform: 'twitter' | 'instagram' | 'artstation' | 'discord' | 'website' | 'patreon';
    label: string;
    url: string;
  }[];
}
