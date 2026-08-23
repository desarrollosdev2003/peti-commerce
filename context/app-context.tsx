'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ArtistProfile, Commission, Order, OrderStatus, OrderMessage, DeliveredFile, CustomerUser } from '@/lib/types';
import { INITIAL_ARTIST, INITIAL_COMMISSIONS, INITIAL_ORDERS, INITIAL_CUSTOMERS } from '@/lib/initial-data';

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

const STORAGE_KEY_COMMISSIONS = 'peti_commissions_v3';
const STORAGE_KEY_ORDERS = 'peti_orders_v3';
const STORAGE_KEY_ARTIST = 'peti_artist_v3';
const STORAGE_KEY_CUSTOMERS = 'peti_customers_v1';

// Seed demo messages for orders
const SEED_ORDERS_WITH_MESSAGES: Order[] = INITIAL_ORDERS.map((ord) => {
  const defaultMessages: OrderMessage[] = [
    {
      id: `msg-${ord.id}-1`,
      orderId: ord.id,
      sender: 'artist',
      senderName: 'Peti',
      text: `¡Hola ${ord.customerName}! Gracias por tu encargo. Ya he recibido tu briefing y referencias. Me pongo a trabajar en la composición inicial. Te compartiré por aquí los primeros bocetos para validar la pose y detalles. ✨`,
      type: 'system',
      createdAt: ord.createdAt,
      isRead: true,
    },
  ];

  if (ord.status === 'in_progress' || ord.status === 'in_review' || ord.status === 'completed') {
    defaultMessages.push({
      id: `msg-${ord.id}-2`,
      orderId: ord.id,
      sender: 'artist',
      senderName: 'Peti',
      text: '¡Aquí tienes el primer boceto preliminar para validar la composición y la pose!',
      attachmentUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
      attachmentName: 'sketch_v1.png',
      type: 'sketch_submission',
      createdAt: new Date(new Date(ord.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    });
    defaultMessages.push({
      id: `msg-${ord.id}-3`,
      orderId: ord.id,
      sender: 'customer',
      senderName: ord.customerName,
      text: '¡Me encanta la pose y el estilo! ¿Podríamos hacer los ojos un poco más expresivos y agregar un pequeño brillo en el cabello?',
      type: 'revision_request',
      createdAt: new Date(new Date(ord.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    });
  }

  if (ord.status === 'completed') {
    defaultMessages.push({
      id: `msg-${ord.id}-4`,
      orderId: ord.id,
      sender: 'artist',
      senderName: 'Peti',
      text: '¡Ilustración final completada y renderizada en alta resolución (300 DPI)! Muchas gracias por tu apoyo. Ya puedes descargar los archivos finales. 💖',
      attachmentUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
      attachmentName: 'final_artwork_300dpi.png',
      type: 'final_delivery',
      createdAt: new Date(new Date(ord.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    });
  }

  return {
    ...ord,
    messages: defaultMessages,
    deliveredFiles: ord.status === 'completed' ? [
      {
        name: 'final_render_300dpi.png',
        url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
        size: '18.4 MB',
        uploadedAt: ord.createdAt,
      },
      {
        name: 'source_layers.psd',
        url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
        size: '142.8 MB',
        uploadedAt: ord.createdAt,
      }
    ] : [],
  };
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [artist, setArtist] = useState<ArtistProfile>(INITIAL_ARTIST);
  const [commissions, setCommissions] = useState<Commission[]>(INITIAL_COMMISSIONS);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS_WITH_MESSAGES);
  const [customers, setCustomers] = useState<CustomerUser[]>(INITIAL_CUSTOMERS);
  const [currency, setCurrency] = useState<'USD' | 'ARS'>('USD');
  const [isLoaded, setIsLoaded] = useState(false);

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

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
      )
    );
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
