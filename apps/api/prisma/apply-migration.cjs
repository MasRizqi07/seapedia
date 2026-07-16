const { PrismaClient } = require('@prisma/client');

const adminUrl = 'postgresql://postgres:postgres@localhost:5433/seapedia?schema=public';
const p = new PrismaClient({ datasources: { db: { url: adminUrl } } });

async function exec(sql) {
  try {
    await p.$executeRawUnsafe(sql);
    console.log('OK:', sql.slice(0, 80).replace(/\n/g, ' '));
  } catch(e) {
    console.error('ERR:', e.message.slice(0, 200));
  }
}

async function main() {
  // Also fix Product policy — buyers need to read products without tenant context
  await exec('DROP POLICY IF EXISTS "tenant_isolation_product" ON "Product"');

  await exec(`CREATE POLICY "tenant_isolation_product" ON "Product"
    AS PERMISSIVE FOR ALL TO PUBLIC
    USING (
      "storeId" = current_setting('app.current_tenant_id', true)
      OR current_setting('app.current_tenant_id', true) IS NULL
      OR current_setting('app.current_tenant_id', true) = ''
    )
    WITH CHECK (
      "storeId" = current_setting('app.current_tenant_id', true)
      OR current_setting('app.current_tenant_id', true) IS NULL
      OR current_setting('app.current_tenant_id', true) = ''
    )`);

  console.log('\nProduct policy recreated.');
}

main().catch(console.error).finally(() => p.$disconnect());
