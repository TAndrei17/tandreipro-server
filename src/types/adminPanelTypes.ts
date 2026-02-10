import { Question } from './common/question.js';

export interface AdminQuestionRequest {
	page?: string;
	limit?: string;
}

export interface PublicQuestionResponse {
	success: boolean;
	message: string;
	data?: Question[];
	page?: number;
	limit?: number;
	total?: number;
	totalPages?: number;
}
