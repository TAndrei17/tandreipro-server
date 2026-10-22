export interface LoginRequest {
	email: string;
	password: string;
	turnstileToken: string;
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

export interface LogoutResponse {
	success: boolean;
	message: string;
}
