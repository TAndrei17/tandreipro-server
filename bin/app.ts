#!/usr/bin/env node

// Load environment variables
import 'dotenv/config';
import app from '../src/app.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
