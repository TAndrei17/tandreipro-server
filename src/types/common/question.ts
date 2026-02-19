export type Question = {
	id: number;
	name: string;
	email?: string;
	content: string;
	approved: boolean;
	tags?: number[];
	created_at: string;
};
