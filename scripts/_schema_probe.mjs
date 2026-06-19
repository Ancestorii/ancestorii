// Temporary, read-only schema probe.
// Reads Supabase URL + keys from .env.local (never printed) and fetches the
// PostgREST OpenAPI spec, which describes every table/column in the `public`
// schema. Read-only: it only performs GET requests.
import fs from 'node:fs';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
// Prefer service role for a complete view (bypasses anon grants); fall back to anon.
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing URL or key in .env.local');
  process.exit(1);
}

const res = await fetch(`${url}/rest/v1/`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
if (!res.ok) {
  console.error('Fetch failed:', res.status, await res.text());
  process.exit(1);
}
const spec = await res.json();
const defs = spec.definitions || {};
const tables = Object.keys(defs).sort();

// Save raw spec for reference (gitignored location handled by caller).
fs.writeFileSync('scripts/_schema_openapi.json', JSON.stringify(spec, null, 2));

console.log(`# public schema — ${tables.length} tables exposed via PostgREST\n`);
for (const t of tables) {
  const def = defs[t];
  const props = def.properties || {};
  const required = new Set(def.required || []);
  console.log(`## ${t}`);
  for (const [col, meta] of Object.entries(props)) {
    const desc = (meta.description || '').replace(/\s+/g, ' ');
    const isPk = /Primary Key/i.test(desc);
    const fk = /<fk table='([^']+)' column='([^']+)'/.exec(desc);
    const tags = [];
    if (isPk) tags.push('PK');
    if (fk) tags.push(`FK→${fk[1]}.${fk[2]}`);
    if (required.has(col)) tags.push('required');
    const type = meta.format || meta.type || '?';
    console.log(`  - ${col}: ${type}${tags.length ? `  [${tags.join(', ')}]` : ''}`);
  }
  console.log('');
}
