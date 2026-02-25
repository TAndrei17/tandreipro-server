export interface LoginRequest {
	email: string;
	password: string;
	captchaToken: string;
}

export interface LoginResponse {
	success: boolean;
	message: string;
	data?: {
		id: number;
		name: string;
		role: 'user' | 'admin';
	};
}
