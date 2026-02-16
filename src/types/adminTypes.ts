import { Question } from './common/question.js';

export interface AdminQuestionRequest {
	page?: string;
	limit?: string;
}

export interface AdminQuestionResponse {
	success: boolean;
	message: string;
	data?: Question[];
	page?: number;
	limit?: number;
	total?: number;
	totalPages?: number;
}

export interface AdminQuestionDeleteRequest {
	id?: string;
}

export interface AdminQuestionDeleteResponse {
	success: boolean;
	message: string;
}

export interface AdminQuestionUpdateRequest {
	name?: string;
	email?: string;
	content?: string;
	approved?: boolean;
	tags?: number[];
}

export interface AdminQuestionUpdateResponse {
	success: boolean;
	message: string;
}
