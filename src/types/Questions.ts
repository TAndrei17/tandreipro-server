export interface QuestionRequest {
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

type Question = {
	id: string;
	name: string;
	question: string;
	created_at: string;
};

export interface QuestionsPublicResponse {
	success: boolean;
	message: string;
	data: Question[];
}
