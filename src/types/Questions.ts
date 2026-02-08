export interface QuestionBody {
	name: string;
	email: string;
	question: string;
}

export interface QuestionResponse {
	success: boolean;
	message: string;
	data?: {
		id: string;
		created_at: string;
	};
	fields?: {
		name?: string;
		email?: string;
		question?: string;
	};
}
