import { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = {};

export const up = (pgm: MigrationBuilder) => {
	pgm.createTable('question_tags', {
		question_id: { type: 'uuid', notNull: true, references: 'questions', onDelete: 'CASCADE' },
		tag_id: { type: 'integer', notNull: true, references: 'tags', onDelete: 'CASCADE' },
	});

	pgm.addConstraint('question_tags', 'question_tags_pk', {
		primaryKey: ['question_id', 'tag_id'],
	});
};

export const down = (pgm: MigrationBuilder) => {
	pgm.dropTable('question_tags');
};
