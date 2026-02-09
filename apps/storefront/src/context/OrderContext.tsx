'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: string;
  transactionId?: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  customerEmail: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

interface OrderContextType {
  // State
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;

  // Methods
  fetchOrders: (userId?: string) => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<Order | null>;
  createOrder: (orderData: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<Order>;
  refundOrder: (orderId: string, reason: string) => Promise<boolean>;
  clearError: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

/**
 * Order Provider Component
 */
export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333/api/v1';

  /**
   * Get authorization token
   */
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  /**
   * Fetch all orders for user
   */
  const fetchOrders = useCallback(
    async (userId?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const query = userId ? `?userId=${userId}` : '';
        const response = await fetch(`${API_BASE_URL}/orders${query}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const { orders: fetchedOrders } = await response.json();
        setOrders(fetchedOrders);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch orders';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, getAuthToken]
  );

  /**
   * Fetch single order by ID
   */
  const fetchOrderById = useCallback(
    async (orderId: string): Promise<Order | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }

        const order: Order = await response.json();
        setCurrentOrder(order);
        return order;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch order';
        setError(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, getAuthToken]
  );

  /**
   * Create new order
   */
  const createOrder = useCallback(
    async (orderData: Partial<Order>): Promise<Order> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create order');
        }

        const newOrder: Order = await response.json();
        setOrders((prev) => [newOrder, ...prev]);
        setCurrentOrder(newOrder);

        // Track analytics
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', 'order_created', {
            order_id: newOrder.id,
            order_number: newOrder.orderNumber,
            value: newOrder.total,
            items: newOrder.items.length,
          });
        }

        return newOrder;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create order';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, getAuthToken]
  );

  /**
   * Update order status
   */
  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus): Promise<Order> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          throw new Error('Failed to update order status');
        }

        const updatedOrder: Order = await response.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
        if (currentOrder?.id === orderId) {
          setCurrentOrder(updatedOrder);
        }

        return updatedOrder;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update order';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, getAuthToken, currentOrder]
  );

  /**
   * Cancel order
   */
  const cancelOrder = useCallback(
    async (orderId: string): Promise<Order> => {
      return updateOrderStatus(orderId, OrderStatus.CANCELLED);
    },
    [updateOrderStatus]
  );

  /**
   * Refund order
   */
  const refundOrder = useCallback(
    async (orderId: string, reason: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/refund`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({ reason }),
        });

        if (!response.ok) {
          throw new Error('Failed to process refund');
        }

        // Update order status to returned
        await updateOrderStatus(orderId, OrderStatus.RETURNED);

        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to refund order';
        setError(errorMsg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, getAuthToken, updateOrderStatus]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: OrderContextType = {
    orders,
    currentOrder,
    isLoading,
    error,
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    refundOrder,
    clearError,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

/**
 * Hook to use Order context
 */
export function useOrder(): OrderContextType {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
}
