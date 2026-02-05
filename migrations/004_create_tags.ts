import { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = {};

export const up = (pgm: MigrationBuilder) => {
	pgm.createTable('tags', {
		id: { type: 'serial', primaryKey: true },
		name: { type: 'varchar(50)', notNull: true, unique: true },
	});
};

export const down = (pgm: MigrationBuilder) => {
	pgm.dropTable('tags');
};
