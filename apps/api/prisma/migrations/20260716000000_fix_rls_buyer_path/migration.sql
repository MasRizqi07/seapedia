-- ==========================================================
-- SEAPEDIA — Fix RLS Buyer-Path Regression
-- The original policies on Order, Cart, OrderItem, CartItem
-- blocked buyer queries because app.current_tenant_id was
-- unset (NULL) when a BUYER role makes requests.
--
-- Fix: Augment policies to allow rows when the tenant setting
-- is empty (buyer scope), relying on application-layer
-- buyerId / userId filters for row ownership.
-- ==========================================================

-- ============================================
-- Order: allow tenant-scoped (seller) OR
-- no-tenant (buyer) access
-- ============================================

DROP POLICY IF EXISTS "tenant_isolation_order" ON "Order";

CREATE POLICY "tenant_isolation_order" ON "Order"
    AS PERMISSIVE FOR ALL
    TO PUBLIC
    USING (
        -- Seller path: storeId must match tenant context
        "storeId" = current_setting('app.current_tenant_id', true)
        OR
        -- Buyer / driver / admin path: no tenant context set
        current_setting('app.current_tenant_id', true) IS NULL
        OR
        current_setting('app.current_tenant_id', true) = ''
    )
    WITH CHECK (
        "storeId" = current_setting('app.current_tenant_id', true)
        OR
        current_setting('app.current_tenant_id', true) IS NULL
        OR
        current_setting('app.current_tenant_id', true) = ''
    );

-- ============================================
-- Cart: already allows NULL storeId, ensure
-- no-tenant path also passes
-- ============================================

DROP POLICY IF EXISTS "tenant_isolation_cart" ON "Cart";

CREATE POLICY "tenant_isolation_cart" ON "Cart"
    AS PERMISSIVE FOR ALL
    TO PUBLIC
    USING (
        "storeId" IS NULL
        OR "storeId" = current_setting('app.current_tenant_id', true)
        OR current_setting('app.current_tenant_id', true) IS NULL
        OR current_setting('app.current_tenant_id', true) = ''
    )
    WITH CHECK (
        "storeId" IS NULL
        OR "storeId" = current_setting('app.current_tenant_id', true)
        OR current_setting('app.current_tenant_id', true) IS NULL
        OR current_setting('app.current_tenant_id', true) = ''
    );

-- ============================================
-- OrderItem: buyer path needs to see order items
-- ============================================

DROP POLICY IF EXISTS "tenant_isolation_orderitem" ON "OrderItem";

CREATE POLICY "tenant_isolation_orderitem" ON "OrderItem"
    AS PERMISSIVE FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM "Order"
            WHERE "Order"."id" = "OrderItem"."orderId"
            AND "Order"."storeId" = current_setting('app.current_tenant_id', true)
        )
        OR current_setting('app.current_tenant_id', true) IS NULL
        OR current_setting('app.current_tenant_id', true) = ''
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Order"
            WHERE "Order"."id" = "OrderItem"."orderId"
            AND "Order"."storeId" = current_setting('app.current_tenant_id', true)
        )
        OR current_setting('app.current_tenant_id', true) IS NULL
        OR current_setting('app.current_tenant_id', true) = ''
    );

-- ============================================
-- CartItem: buyer path
-- ============================================

DROP POLICY IF EXISTS "tenant_isolation_cartitem" ON "CartItem";

CREATE POLICY "tenant_isolation_cartitem" ON "CartItem"
    AS PERMISSIVE FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM "Cart"
            WHERE "Cart"."id" = "CartItem"."cartId"
            AND ("Cart"."storeId" IS NULL OR "Cart"."storeId" = current_setting('app.current_tenant_id', true))
        )
        OR current_setting('app.current_tenant_id', true) IS NULL
        OR current_setting('app.current_tenant_id', true) = ''
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Cart"
            WHERE "Cart"."id" = "CartItem"."cartId"
            AND ("Cart"."storeId" IS NULL OR "Cart"."storeId" = current_setting('app.current_tenant_id', true))
        )
        OR current_setting('app.current_tenant_id', true) IS NULL
        OR current_setting('app.current_tenant_id', true) = ''
    );

-- Product policy: unchanged (only sellers + admins query scoped products)
-- Buyers see all products (no tenant constraint needed for product browsing)
