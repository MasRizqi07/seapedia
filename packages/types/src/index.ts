// ═══════════════════════════════════════════════════
// @seapedia/types — Shared enums, DTOs, and interfaces
// ═══════════════════════════════════════════════════

// ── Enums ────────────────────────────────────────────

export const Role = {
  BUYER: 'BUYER',
  SELLER: 'SELLER',
  DRIVER: 'DRIVER',
  ADMIN: 'ADMIN',
} as const;
export type Role = typeof Role[keyof typeof Role];

export const OrderStatus = {
  PACKING: 'PACKING',
  WAITING_DRIVER: 'WAITING_DRIVER',
  SHIPPING: 'SHIPPING',
  COMPLETED: 'COMPLETED',
  RETURNED: 'RETURNED',
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const DeliveryMethod = {
  INSTANT: 'INSTANT',
  NEXT_DAY: 'NEXT_DAY',
  REGULAR: 'REGULAR',
} as const;
export type DeliveryMethod = typeof DeliveryMethod[keyof typeof DeliveryMethod];

export const JobStatus = {
  AVAILABLE: 'AVAILABLE',
  TAKEN: 'TAKEN',
  COMPLETED: 'COMPLETED',
} as const;
export type JobStatus = typeof JobStatus[keyof typeof JobStatus];

export const DiscountType = {
  PERCENT: 'PERCENT',
  FIXED: 'FIXED',
} as const;
export type DiscountType = typeof DiscountType[keyof typeof DiscountType];

export const WalletTxType = {
  TOPUP: 'TOPUP',
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND',
} as const;
export type WalletTxType = typeof WalletTxType[keyof typeof WalletTxType];

export const ApplicationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

// ── User ─────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

// ── Auth DTOs ────────────────────────────────────────

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

// ── Role metadata (for UI) ───────────────────────────

export const ROLE_META: Record<Role, { label: string; color: string; icon: string }> = {
  [Role.BUYER]: { label: 'Buyer', color: 'ocean', icon: '🛒' },
  [Role.SELLER]: { label: 'Seller', color: 'amber', icon: '🏪' },
  [Role.DRIVER]: { label: 'Driver', color: 'sky', icon: '🚚' },
  [Role.ADMIN]: { label: 'Admin', color: 'rose', icon: '🛡️' },
};

// ── Store ────────────────────────────────────────

export interface StoreResponse {
  id: string;
  sellerId: string;
  name: string;
  _count?: { products: number };
}

// ── Product ──────────────────────────────────────

export interface ProductResponse {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  createdAt: string;
  store?: { id: string; name: string };
}

// ── Pagination ───────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ── Wallet ───────────────────────────────────────

export interface WalletTransactionResponse {
  id: string;
  walletId: string;
  type: WalletTxType;
  amount: number;
  referenceOrderId: string | null;
  createdAt: string;
}

export interface WalletResponse {
  id: string;
  buyerId: string;
  balance: number;
  transactions?: WalletTransactionResponse[];
}

// ── Address ──────────────────────────────────────

export interface AddressResponse {
  id: string;
  buyerId: string;
  label: string;
  recipientName: string;
  phone: string;
  fullAddress: string;
  isDefault: boolean;
}

// ── Cart ─────────────────────────────────────────

export interface CartItemResponse {
  cartId: string;
  productId: string;
  quantity: number;
  product?: ProductResponse;
}

export interface CartResponse {
  id: string;
  buyerId: string;
  storeId: string | null;
  items: CartItemResponse[];
  subtotal: number;
}

// ── Discounts ──────────────────────────────────────

export interface VoucherResponse {
  id: string;
  code: string;
  discountType: DiscountType;
  value: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
}

export interface PromoResponse {
  id: string;
  code: string;
  discountType: DiscountType;
  value: number;
  expiryDate: string;
}

// ── Order ────────────────────────────────────────

export interface OrderStatusHistoryResponse {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  changedAt: string;
}

export interface CreateOrderRequest {
  deliveryMethod: DeliveryMethod;
  addressId: string;
  discountCode?: string;
}

export interface OrderItemResponse {
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  product?: ProductResponse;
}

export interface OrderResponse {
  id: string;
  buyerId: string;
  storeId: string;
  deliveryMethod: DeliveryMethod;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  ppnAmount: number;
  totalAmount: number;
  voucherId: string | null;
  promoId: string | null;
  status: OrderStatus;
  slaDueAt: string | null;
  createdAt: string;
  store?: StoreResponse;
  items?: OrderItemResponse[];
  history?: OrderStatusHistoryResponse[];
}

// ── Delivery Job ─────────────────────────────────

export interface DeliveryJobResponse {
  id: string;
  orderId: string;
  driverId: string | null;
  status: JobStatus;
  earnings: number;
  takenAt: string | null;
  completedAt: string | null;
  order?: OrderResponse;
}

// ── Admin Stats ──────────────────────────────────

export interface AdminStatsResponse {
  users: {
    total: number;
    byRole: Record<Role, number>;
  };
  stores: number;
  products: number;
  orders: {
    total: number;
    byStatus: Record<OrderStatus, number>;
    overdueCount: number;
  };
  vouchers: {
    active: number;
    expired: number;
  };
  promos: {
    active: number;
    expired: number;
  };
  jobs: {
    total: number;
    byStatus: Record<JobStatus, number>;
  };
}


