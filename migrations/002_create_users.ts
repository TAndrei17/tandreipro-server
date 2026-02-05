/* eslint-disable @stylistic/quotes */
import { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = {};

export const up = (pgm: MigrationBuilder) => {
	pgm.createTable('users', {
		id: {
			type: 'uuid',
			primaryKey: true,
			default: pgm.func('gen_random_uuid()'),
		},
		username: {
			type: 'varchar(50)',
			notNull: true,
			unique: true,
		},
		email: {
			type: 'varchar(255)',
			notNull: true,
			unique: true,
		},
		password_hash: {
			type: 'text',
			notNull: true,
		},
		role: {
			type: 'varchar(20)',
			notNull: true,
			default: 'user',
		},
		created_at: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('now()'),
		},
	});

	// Restrict allowed roles
	pgm.addConstraint('users', 'users_role_check', {
		check: "role IN ('admin', 'user')",
	});
};

export const down = (pgm: MigrationBuilder) => {
	pgm.dropTable('users');
};
