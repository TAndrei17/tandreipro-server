import { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = {};

export const up = (pgm: MigrationBuilder) => {
	pgm.createTable('questions', {
		id: {
			type: 'uuid',
			primaryKey: true,
			default: pgm.func('gen_random_uuid()'),
		},
		name: { type: 'varchar(100)', notNull: true },
		email: { type: 'varchar(255)', notNull: true },
		content: { type: 'text', notNull: true },
		approved: { type: 'boolean', notNull: true, default: false },
		admin_id: { type: 'uuid', references: 'users', onDelete: 'SET NULL' },
		created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
		updated_at: { type: 'timestamp' },
	});
};

export const down = (pgm: MigrationBuilder) => {
	pgm.dropTable('questions');
};
