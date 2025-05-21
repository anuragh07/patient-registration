import { PGlite } from '@electric-sql/pglite';
// import { PGliteProvider, usePGlite, useLiveQuery } from '@electric-sql/pglite-react';
const db = new PGlite('idb://my-pgdata');

await db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  dob TEXT NOT NULL,
  age INTEGER,
  bloodGroup TEXT NOT NULL,
  gender TEXT NOT NULL,
  address TEXT NOT NULL,
  emergencyContact TEXT NOT NULL,
  conditions TEXT NOT NULL,
  surgeries TEXT,
  reason TEXT NOT NULL,
  insuranceProvider TEXT,
  policyNumber TEXT
);
`);

export default db;
