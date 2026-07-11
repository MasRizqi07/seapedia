-- ==========================================================
-- SEAPEDIA — Row Level Security (RLS) Migration
-- Enforces tenant (store) isolation at the database layer
-- Pattern mirrors ai-coo's 20260621063000_enable_rls migration
-- ==========================================================

-- Session variable: app.current_tenant_id
-- Must be set per-connection/transaction by the application layer

-- ============================================
-- 1. ENABLE RLS on tenant-scoped tables
-- ============================================

ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CartItem" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. FORCE RLS even for table owners
-- ============================================

ALTER TABLE "Product" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Order" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Cart" FORCE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" FORCE ROW LEVEL SECURITY;
ALTER TABLE "CartItem" FORCE ROW LEVEL SECURITY;

-- ============================================
-- 3. DROP existing policies (idempotent)
-- ============================================

DROP POLICY IF EXISTS "tenant_isolation_product" ON "Product";
DROP POLICY IF EXISTS "tenant_isolation_order" ON "Order";
DROP POLICY IF EXISTS "tenant_isolation_cart" ON "Cart";
DROP POLICY IF EXISTS "tenant_isolation_orderitem" ON "OrderItem";
DROP POLICY IF EXISTS "tenant_isolation_cartitem" ON "CartItem";

-- ============================================
-- 4. CREATE tenant isolation policies
-- ============================================

-- Product: scoped by storeId
CREATE POLICY "tenant_isolation_product" ON "Product"
    AS PERMISSIVE FOR ALL
    TO PUBLIC
    USING ("storeId" = current_setting('app.current_tenant_id', true))
    WITH CHECK ("storeId" = current_setting('app.current_tenant_id', true));

-- Order: scoped by storeId
CREATE POLICY "tenant_isolation_order" ON "Order"
    AS PERMISSIVE FOR ALL
    TO PUBLIC
    USING ("storeId" = current_setting('app.current_tenant_id', true))
    WITH CHECK ("storeId" = current_setting('app.current_tenant_id', true));

-- Cart: scoped by storeId (nullable, but if set, must match)
CREATE POLICY "tenant_isolation_cart" ON "Cart"
    AS PERMISSIVE FOR ALL
    TO PUBLIC
    USING ("storeId" IS NULL OR "storeId" = current_setting('app.current_tenant_id', true))
    WITH CHECK ("storeId" IS NULL OR "storeId" = current_setting('app.current_tenant_id', true));

-- OrderItem: scoped via parent order's storeId (JOIN-based)
CREATE POLICY "tenant_isolation_orderitem" ON "OrderItem"
    AS PERMISSIVE FOR ALL
    TO PUBLIC
    USING (EXISTS (
        SELECT 1 FROM "Order"
        WHERE "Order"."id" = "OrderItem"."orderId"
        AND "Order"."storeId" = current_setting('app.current_tenant_id', true)
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM "Order"
        WHERE "Order"."id" = "OrderItem"."orderId"
        AND "Order"."storeId" = current_setting('app.current_tenant_id', true)
    ));

-- CartItem: scoped via parent cart's storeId (JOIN-based)
CREATE POLICY "tenant_isolation_cartitem" ON "CartItem"
    AS PERMISSIVE FOR ALL
    TO PUBLIC
    USING (EXISTS (
        SELECT 1 FROM "Cart"
        WHERE "Cart"."id" = "CartItem"."cartId"
        AND ("Cart"."storeId" IS NULL OR "Cart"."storeId" = current_setting('app.current_tenant_id', true))
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM "Cart"
        WHERE "Cart"."id" = "CartItem"."cartId"
        AND ("Cart"."storeId" IS NULL OR "Cart"."storeId" = current_setting('app.current_tenant_id', true))
    ));
