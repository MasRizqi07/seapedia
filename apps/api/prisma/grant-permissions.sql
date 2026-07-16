GRANT USAGE ON SCHEMA public TO app_runtime_test;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_runtime_test;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_runtime_test;
ALTER TABLE "Product" OWNER TO app_runtime_test;
ALTER TABLE "Order" OWNER TO app_runtime_test;
ALTER TABLE "Cart" OWNER TO app_runtime_test;
ALTER TABLE "OrderItem" OWNER TO app_runtime_test;
ALTER TABLE "CartItem" OWNER TO app_runtime_test;
