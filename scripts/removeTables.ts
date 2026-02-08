import 'dotenv/config';
import pool from '../src/db/pool.js';

// to run script: update import and run "node scripts/removeDb.ts" from CL
// import pool from '../src/db/pool.ts';

(async () => {
	try {
		await pool.query('DROP TABLE IF EXISTS question_tags CASCADE');
		await pool.query('DROP TABLE IF EXISTS questions CASCADE');
		await pool.query('DROP TABLE IF EXISTS tags CASCADE');
		await pool.query('DROP TABLE IF EXISTS users CASCADE');
		await pool.query('DROP TABLE IF EXISTS pgmigrations CASCADE');
		console.log('All tables dropped');
	} catch (err) {
		console.error(err);
	} finally {
		await pool.end();
	}
})();
