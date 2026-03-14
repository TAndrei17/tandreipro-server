import { Answer } from './common/answer.js';
import { Question } from './common/question.js';
import { Tag } from './common/tag.js';

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

export interface AdminCreateTagRequest {
	name: string;
}

export interface AdminCreateTagResponse {
	success: boolean;
	message: string;
	data?: Tag;
}

export interface AdminTagDeleteRequest {
	id: string;
}

export interface AdmintagDeleteResponse {
	success: boolean;
	message: string;
}

export interface AdminAnswerRequest {
	question_id: number;
	content: string;
}

export interface AdminAnswerResponse {
	success: boolean;
	message: string;
	data?: {
		id: number;
		created_at: string;
	};
}

export interface AdminAnswerDeleteResponse {
	success: boolean;
	message: string;
}

export interface AdminAnswersResponse {
	success: boolean;
	message: string;
	data?: Answer[];
}
