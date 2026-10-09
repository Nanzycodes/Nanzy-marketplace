-- ============================================================
-- Nanzy Marketplace - Multi-role extension
-- Free stack: Supabase Auth + Postgres
-- Roles: admin | seller | buyer
-- ============================================================

-- ------------------------------------------------------------
-- PROFILES (extends auth.users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  role          TEXT NOT NULL DEFAULT 'buyer'
                CHECK (role IN ('admin', 'seller', 'buyer')),
  avatar_url    TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Auto-create profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- SELLERS (subscription + ranking)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sellers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_name        TEXT NOT NULL,
  store_slug        TEXT NOT NULL UNIQUE,
  description       TEXT DEFAULT '',
  logo_url          TEXT,
  -- subscription
  subscription_status TEXT NOT NULL DEFAULT 'none'
                    CHECK (subscription_status IN ('none', 'trial', 'active', 'expired', 'cancelled')),
  subscription_plan   TEXT DEFAULT 'basic'
                    CHECK (subscription_plan IN ('basic', 'pro', 'enterprise')),
  subscribed_at       TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  -- ranking metrics (denormalized for fast admin queries)
  avg_rating          NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count        INTEGER NOT NULL DEFAULT 0,
  total_sales         INTEGER NOT NULL DEFAULT 0,
  response_rate       NUMERIC(5,2) NOT NULL DEFAULT 100, -- % of feedbacks they replied to
  is_approved         BOOLEAN NOT NULL DEFAULT false, -- admin must approve
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sellers_avg_rating ON public.sellers(avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_sellers_subscription ON public.sellers(subscription_status);
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON public.sellers(user_id);

-- ------------------------------------------------------------
-- Link products to sellers
-- ------------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);

-- ------------------------------------------------------------
-- Link orders to sellers (marketplace: one order can span sellers;
-- for simplicity we store primary seller on order_items)
-- ------------------------------------------------------------
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- FEEDBACK / REVIEW REPLIES (seller handling customer feedback)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_replies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id   UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  seller_id   UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (review_id) -- one reply per review for simplicity
);

-- Ensure reviews know which seller they belong to (via product)
-- (product.seller_id already links them)

-- ------------------------------------------------------------
-- SELLER ACTIVITY LOG (for admin monitoring)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role  TEXT,
  action      TEXT NOT NULL, -- e.g. 'order_placed', 'review_created', 'seller_subscribed', 'reply_to_review'
  entity_type TEXT,         -- 'order', 'review', 'seller', 'product'
  entity_id   UUID,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);

-- ------------------------------------------------------------
-- UPDATED_AT triggers
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS sellers_updated_at ON public.sellers;
CREATE TRIGGER sellers_updated_at
  BEFORE UPDATE ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users read own; admins read all
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Sellers: public can read approved active sellers; owners manage own
CREATE POLICY "Anyone can view approved sellers"
  ON public.sellers FOR SELECT
  USING (is_approved = true OR user_id = auth.uid());

CREATE POLICY "Users can create seller profile"
  ON public.sellers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can update own store"
  ON public.sellers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins full access sellers"
  ON public.sellers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Review replies
CREATE POLICY "Anyone can read replies"
  ON public.review_replies FOR SELECT
  USING (true);

CREATE POLICY "Sellers can reply to reviews"
  ON public.review_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sellers s
      WHERE s.id = seller_id AND s.user_id = auth.uid()
    )
  );

-- Activity logs: admins only for full read; users insert own actions via server
CREATE POLICY "Admins read activity logs"
  ON public.activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Authenticated can insert activity"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ----------------------------------------------------
-- Helper: refresh seller rating from reviews
-- ---------------------------------------------------
CREATE OR REPLACE FUNCTION public.refresh_seller_rating(p_seller_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.sellers s
  SET
    avg_rating = COALESCE((
      SELECT ROUND(AVG(r.rating)::numeric, 2)
      FROM public.reviews r
      JOIN public.products p ON p.id = r.product_id
      WHERE p.seller_id = p_seller_id
    ), 0),
    review_count = COALESCE((
      SELECT COUNT(*)
      FROM public.reviews r
      JOIN public.products p ON p.id = r.product_id
      WHERE p.seller_id = p_seller_id
    ), 0),
    response_rate = CASE
      WHEN (
        SELECT COUNT(*) FROM public.reviews r
        JOIN public.products p ON p.id = r.product_id
        WHERE p.seller_id = p_seller_id
      ) = 0 THEN 100
      ELSE (
        SELECT ROUND(
          100.0 * COUNT(rr.id) / NULLIF(COUNT(r.id), 0),
          2
        )
        FROM public.reviews r
        JOIN public.products p ON p.id = r.product_id
        LEFT JOIN public.review_replies rr ON rr.review_id = r.id
        WHERE p.seller_id = p_seller_id
      )
    END
  WHERE s.id = p_seller_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
