import 'dotenv/config';
import pool from '../src/db/pool.js';

// to run script: update import and run "node scripts/checkDb.ts" from CL
// import pool from '../src/db/pool.ts';

(async () => {
	try {
		const now = await pool.query('SELECT NOW()');
		console.log('DB connected, server time:', now.rows[0].now);

		const table = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public' AND table_name='questions';
    `);

		if ((table.rowCount ?? 0) > 0) {
			console.log('Table "questions" exists ✅');
		} else {
			console.log('Table "questions" does NOT exist ❌');
		}
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error('Error connecting to DB:', err.message);
		} else {
			console.error('Unexpected error:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
		}
	} finally {
		await pool.end();
	}
})();
