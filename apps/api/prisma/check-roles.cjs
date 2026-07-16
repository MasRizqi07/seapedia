const { PrismaClient } = require('@prisma/client');

const url = process.env.DATABASE_URL;
const p = new PrismaClient({ datasources: { db: { url } } });

async function main() {
  const roles = await p.$queryRawUnsafe(
    "SELECT rolname, rolsuper::text, rolbypassrls::text FROM pg_roles WHERE rolname IN ('postgres','seapedia','app_runtime_test') ORDER BY rolname"
  );
  console.log('=== pg_roles check ===');
  console.log(JSON.stringify(roles, null, 2));

  const tables = await p.$queryRawUnsafe(
    "SELECT c.relname as tablename, c.relrowsecurity::text as rowsecurity, c.relforcerowsecurity::text as forcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r' ORDER BY c.relname"
  );
  console.log('\n=== pg_tables RLS status ===');
  console.log(JSON.stringify(tables, null, 2));
}

main().catch(console.error).finally(() => p.$disconnect());
