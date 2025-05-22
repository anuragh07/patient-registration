import { PGlite } from '@electric-sql/pglite';
// import { PGliteProvider, usePGlite, useLiveQuery } from '@electric-sql/pglite-react';
const db = new PGlite('idb://my-pgdata');

await db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    contact TEXT NOT NULL,
    dob TEXT NOT NULL,
    age INTEGER,
    bloodgroup TEXT,
    gender TEXT NOT NULL,
    address TEXT,
    emergencycontact TEXT NOT NULL,
    conditions TEXT NOT NULL,
    surgeries TEXT,
    reason TEXT NOT NULL,
    insuranceprovider TEXT,
    policynumber TEXT,
    dateOfVisit TEXT
  );
`);


export default db;
