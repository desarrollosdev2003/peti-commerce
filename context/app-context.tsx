'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ArtistProfile, Commission, Order, OrderStatus, OrderMessage, DeliveredFile, CustomerUser } from '@/lib/types';
import { INITIAL_ARTIST, INITIAL_COMMISSIONS } from '@/lib/initial-data';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface AppContextType {
  artist: ArtistProfile;
  updateArtist: (profile: Partial<ArtistProfile>) => void;
  commissions: Commission[];
  addCommission: (commission: Omit<Commission, 'id'>) => void;
  updateCommission: (id: string, updates: Partial<Commission>) => void;
  deleteCommission: (id: string) => void;
  toggleCommissionActive: (id: string) => void;
  updateCommissionSlots: (id: string, slots: number) => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  getOrder: (idOrNumber: string) => Order | undefined;
  addOrderMessage: (orderId: string, messageData: Omit<OrderMessage, 'id' | 'createdAt'>) => OrderMessage;
  addDeliveredFile: (orderId: string, file: DeliveredFile) => void;
  customers: CustomerUser[];
  addCustomer: (customer: CustomerUser) => void;
  updateCustomer: (id: string, updates: Partial<CustomerUser>) => void;
  currency: 'USD' | 'ARS';
  setCurrency: (c: 'USD' | 'ARS') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_COMMISSIONS = 'peti_commissions_v4';
const STORAGE_KEY_ORDERS = 'peti_orders_v4';
const STORAGE_KEY_ARTIST = 'peti_artist_v4';
const STORAGE_KEY_CUSTOMERS = 'peti_customers_v4';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [artist, setArtist] = useState<ArtistProfile>(INITIAL_ARTIST);
  const [commissions, setCommissions] = useState<Commission[]>(INITIAL_COMMISSIONS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'ARS'>('USD');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted data
  useEffect(() => {
    try {
      const storedArtist = localStorage.getItem(STORAGE_KEY_ARTIST);
      if (storedArtist) setArtist(JSON.parse(storedArtist));

      const storedCommissions = localStorage.getItem(STORAGE_KEY_COMMISSIONS);
      if (storedCommissions) setCommissions(JSON.parse(storedCommissions));

      const storedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (storedOrders) setOrders(JSON.parse(storedOrders));

      const storedCustomers = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
      if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Fetch real production orders from Supabase on mount
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from('orders')
      .select('*, order_messages(*)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mappedOrders: Order[] = data.map((d: any) => ({
            id: d.id,
            orderNumber: d.order_number,
            customerId: d.customer_id,
            customerName: d.customer_name,
            customerEmail: d.customer_email,
            total: Number(d.total),
            paymentMethod: d.payment_method,
            status: d.status,
            createdAt: d.created_at,
            estimatedDelivery: d.estimated_delivery,
            notes: d.notes,
            items: d.items || [],
            deliveredFiles: d.delivered_files || [],
            messages: (d.order_messages || []).map((m: any) => ({
              id: m.id,
              orderId: m.order_id,
              sender: m.sender,
              senderName: m.sender_name,
              text: m.text,
              attachmentUrl: m.attachment_url,
              attachmentName: m.attachment_name,
              type: m.type,
              createdAt: m.created_at,
              isRead: true,
            })),
          }));
          setOrders(mappedOrders);
        }
      });
  }, []);

  // Multi-tab cross communication sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_ORDERS && e.newValue) {
        try {
          setOrders(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
      if (e.key === STORAGE_KEY_CUSTOMERS && e.newValue) {
        try {
          setCustomers(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Global Realtime Supabase Subscription for orders table updates
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel('global-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updated = payload.new as any;
            setOrders((prev) =>
              prev.map((o) =>
                o.id === updated.id || o.orderNumber === updated.order_number
                  ? { ...o, status: updated.status || o.status, updatedAt: updated.updated_at || new Date().toISOString() }
                  : o
              )
            );
          } else if (payload.eventType === 'INSERT' && payload.new) {
            const newOrd = payload.new as any;
            const mappedOrder: Order = {
              id: newOrd.id,
              orderNumber: newOrd.order_number,
              customerId: newOrd.customer_id,
              customerName: newOrd.customer_name,
              customerEmail: newOrd.customer_email,
              total: Number(newOrd.total),
              paymentMethod: newOrd.payment_method,
              status: newOrd.status,
              createdAt: newOrd.created_at,
              estimatedDelivery: newOrd.estimated_delivery,
              notes: newOrd.notes,
              items: newOrd.items || [],
              deliveredFiles: newOrd.delivered_files || [],
              messages: [],
            };
            setOrders((prev) => {
              if (prev.some((o) => o.id === mappedOrder.id)) return prev;
              return [mappedOrder, ...prev];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_ARTIST, JSON.stringify(artist));
    } catch (e) {
      console.error('Failed to save artist to localStorage', e);
    }
  }, [artist, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_COMMISSIONS, JSON.stringify(commissions));
    } catch (e) {
      console.error('Failed to save commissions to localStorage', e);
    }
  }, [commissions, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }, [orders, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to save customers to localStorage', e);
    }
  }, [customers, isLoaded]);

  const updateArtist = (profile: Partial<ArtistProfile>) => {
    setArtist((prev) => ({ ...prev, ...profile }));
  };

  const addCommission = (commissionData: Omit<Commission, 'id'>) => {
    const newCommission: Commission = {
      ...commissionData,
      id: 'comm-' + Date.now(),
    };
    setCommissions((prev) => [newCommission, ...prev]);
  };

  const updateCommission = (id: string, updates: Partial<Commission>) => {
    setCommissions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCommission = (id: string) => {
    setCommissions((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleCommissionActive = (id: string) => {
    setCommissions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const updateCommissionSlots = (id: string, slots: number) => {
    setCommissions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, slotsAvailable: Math.max(0, slots) } : c))
    );
  };

  const addCustomer = (customer: CustomerUser) => {
    setCustomers((prev) => {
      const exists = prev.some((c) => c.email.toLowerCase() === customer.email.toLowerCase());
      if (exists) {
        return prev.map((c) => (c.email.toLowerCase() === customer.email.toLowerCase() ? { ...c, ...customer } : c));
      }
      return [customer, ...prev];
    });
  };

  const updateCustomer = (id: string, updates: Partial<CustomerUser>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const addOrder = (order: Order) => {
    const defaultWelcomeMessage: OrderMessage = {
      id: `msg-${Date.now()}-welcome`,
      orderId: order.id,
      sender: 'artist',
      senderName: 'Peti',
      text: `¡Hola ${order.customerName}! Gracias por tu encargo (${order.orderNumber}). Ya he recibido tu briefing y referencias. Te compartiré por aquí los primeros bocetos para tu aprobación. ✨`,
      type: 'system',
      createdAt: new Date().toISOString(),
      isRead: true,
    };

    const orderWithMessages: Order = {
      ...order,
      messages: order.messages && order.messages.length > 0 ? order.messages : [defaultWelcomeMessage],
      deliveredFiles: order.deliveredFiles || [],
    };

    setOrders((prev) => [orderWithMessages, ...prev]);

    // Ensure customer is registered in customers directory
    const existingCustomer = customers.find(
      (c) => c.email.toLowerCase() === order.customerEmail.toLowerCase()
    );
    if (!existingCustomer) {
      const newCustomer: CustomerUser = {
        id: order.customerId || `usr-${Date.now()}`,
        name: order.customerName,
        email: order.customerEmail,
        discord: order.notes?.includes('Discord:') ? order.notes.replace('Discord:', '').trim() : undefined,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        role: 'customer',
        createdAt: order.createdAt,
      };
      setCustomers((prev) => [newCustomer, ...prev]);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
      )
    );

    // Sync with Supabase Database in Realtime
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        await supabase
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', orderId);
      } catch (err) {
        console.error('Error updating order status in Supabase:', err);
      }
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const getOrder = useCallback(
    (idOrNumber: string) => {
      const normalized = idOrNumber.trim().toLowerCase();
      return orders.find(
        (o) =>
          o.id.toLowerCase() === normalized ||
          o.orderNumber.toLowerCase() === normalized ||
          o.orderNumber.replace('#', '').toLowerCase() === normalized
      );
    },
    [orders]
  );

  const addOrderMessage = (
    orderId: string,
    messageData: Omit<OrderMessage, 'id' | 'createdAt'>
  ): OrderMessage => {
    const newMessage: OrderMessage = {
      ...messageData,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedMessages = [...(o.messages || []), newMessage];
          return {
            ...o,
            messages: updatedMessages,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );

    // Push to Supabase if connected
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      supabase.from('order_messages').insert({
        id: newMessage.id,
        order_id: orderId,
        sender: newMessage.sender,
        sender_name: newMessage.senderName,
        text: newMessage.text,
        attachment_url: newMessage.attachmentUrl,
        attachment_name: newMessage.attachmentName,
        type: newMessage.type,
        created_at: newMessage.createdAt,
      }).then();
    }

    return newMessage;
  };

  const addDeliveredFile = (orderId: string, file: DeliveredFile) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            deliveredFiles: [...(o.deliveredFiles || []), file],
            status: 'completed',
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        artist,
        updateArtist,
        commissions,
        addCommission,
        updateCommission,
        deleteCommission,
        toggleCommissionActive,
        updateCommissionSlots,
        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        getOrder,
        addOrderMessage,
        addDeliveredFile,
        customers,
        addCustomer,
        updateCustomer,
        currency,
        setCurrency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
