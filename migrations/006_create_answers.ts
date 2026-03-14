import { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = {};

export const up = (pgm: MigrationBuilder) => {
	pgm.createTable('answers', {
		id: {
			type: 'serial',
			primaryKey: true,
		},
		question_id: {
			type: 'integer',
			notNull: true,
			references: 'questions',
			onDelete: 'CASCADE',
		},
		admin_id: {
			type: 'integer',
			notNull: true,
			references: 'users',
			onDelete: 'SET NULL',
		},
		content: {
			type: 'text',
			notNull: true,
		},
		created_at: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('now()'),
		},
		updated_at: {
			type: 'timestamp',
		},
	});
};

export const down = (pgm: MigrationBuilder) => {
	pgm.dropTable('answers');
};
