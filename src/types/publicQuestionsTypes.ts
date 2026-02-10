export interface PublicQuestionRequest {
	name: string;
	email: string;
	question: string;
}

export interface PublicQuestionResponse {
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

export type PublicQuestion = {
	id: number;
	name: string;
	content: string;
	created_at: string;
};

export interface PublicAllQuestionsResponse {
	success: boolean;
	message: string;
	data?: PublicQuestion[];
}
