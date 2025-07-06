export interface User {
  _id: string;
  id?: string; // For compatibility with some server responses
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin' | 'company-admin';
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethods?: {
    type: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
  }[];
  company?: string | { _id: string; name?: string; subdomain?: string };
}

export interface BounceHouse {
  _id: string;
  id?: string; // For compatibility
  name: string;
  description: string;
  theme: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  capacity: {
    minAge: number;
    maxAge: number;
    maxWeight: number;
    maxOccupants: number;
  };
  price: {
    daily: number;
    weekly: number;
    weekend: number;
  };
  images: string[];
  features: string[];
  availability: {
    startDate: string;
    endDate: string;
  }[];
  rating: number;
  reviews: {
    userId: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  isActive: boolean;
  company?: string;
}

export interface Booking {
  _id: string;
  id?: string; // For compatibility
  user: string;
  bounceHouse: BounceHouse;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  deliveryInstructions?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: {
    type: string;
    last4: string;
  };
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface BounceHouseState {
  items: BounceHouse[];
  selectedItem: BounceHouse | null;
  loading: boolean;
  error: string | null;
}

export interface BookingState {
  items: Booking[];
  selectedItem: Booking | null;
  loading: boolean;
  error: string | null;
} 