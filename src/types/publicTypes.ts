import { Question } from './common/question.js';
import { Tag } from './common/tag.js';

export interface PublicQuestionRequest {
	name: string;
	email: string;
	question: string;
	captchaToken: string;
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

export interface PublicAllQuestionsResponse {
	success: boolean;
	message: string;
	data?: Question[];
}

export interface PublicAllTagsResponse {
	success: boolean;
	message: string;
	data?: Tag[];
}

export interface RecaptchaResponse {
	success: boolean;
	challenge_ts?: string;
	hostname?: string;
	'error-codes'?: string[];
	score?: number; // для v3
}
