-- ==========================================
-- PETI E-COMMERCE • ESQUEMA POSTGRESQL SUPABASE
-- ==========================================
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase (https://supabase.com/dashboard)

-- 1. Tabla de Perfil del Artista
CREATE TABLE IF NOT EXISTS public.artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Peti',
    handle TEXT NOT NULL DEFAULT '@peti_art',
    avatar TEXT NOT NULL,
    bio TEXT NOT NULL,
    banner_url TEXT,
    rating NUMERIC(3,2) DEFAULT 4.98,
    reviews_count INT DEFAULT 942,
    total_completed INT DEFAULT 1280,
    social_links JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Tipos de Comisión (Catálogo)
CREATE TABLE IF NOT EXISTS public.commissions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'Illustration',
    price_min NUMERIC NOT NULL,
    price_max NUMERIC,
    slots_available INT NOT NULL DEFAULT 5,
    delivery_days INT NOT NULL DEFAULT 14,
    samples JSONB NOT NULL DEFAULT '[]'::jsonb,
    additional_info JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Opciones Adicionales (Extras / Add-ons)
CREATE TABLE IF NOT EXISTS public.commission_options (
    id TEXT PRIMARY KEY,
    commission_id TEXT REFERENCES public.commissions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Pedidos / Órdenes
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    notes TEXT,
    total NUMERIC NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('mercadopago', 'polar')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'in_review', 'completed', 'cancelled')),
    payment_url TEXT,
    estimated_delivery DATE,
    delivered_files JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de Items del Pedido
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    commission_id TEXT REFERENCES public.commissions(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    unit_price NUMERIC NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    sample_image TEXT,
    usage_type TEXT NOT NULL DEFAULT 'personal',
    brief TEXT NOT NULL,
    references TEXT,
    selected_options JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabla de Mensajes del Chat en Vivo (Realtime WebSockets)
CREATE TABLE IF NOT EXISTS public.order_messages (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('artist', 'customer')),
    sender_name TEXT NOT NULL,
    text TEXT NOT NULL,
    attachment_url TEXT,
    attachment_name TEXT,
    type TEXT NOT NULL DEFAULT 'message' CHECK (type IN ('message', 'sketch_submission', 'sketch_approval', 'revision_request', 'final_delivery', 'system')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- ACTIVAR PUBLICACIÓN REALTIME (WEBSOCKETS)
-- ==========================================
-- Permite que los mensajes aparezcan instantáneamente en pantalla sin recargar
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- ==========================================
-- POLÍTICAS DE ACCESO PÚBLICO (RLS)
-- ==========================================
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

-- Permitir lectura y escritura con API anon / service_role
CREATE POLICY "Permitir lectura publica de artistas" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de comisiones" ON public.commissions FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de opciones" ON public.commission_options FOR SELECT USING (true);

CREATE POLICY "Permitir acceso a pedidos" ON public.orders FOR ALL USING (true);
CREATE POLICY "Permitir acceso a items de pedido" ON public.order_items FOR ALL USING (true);
CREATE POLICY "Permitir lectura y envio de mensajes de chat" ON public.order_messages FOR ALL USING (true);
