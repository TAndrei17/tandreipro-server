const routes = {
	authLogin: '/login',
	authLogout: '/logout',
	authMe: '/me',

	public: '/questions',
	publicTags: '/tags',

	adminQuestions: '/questions',
	adminQuestionOne: '/questions/:id',
	adminTags: '/tags',
	adminTag: '/tags/:id',

	adminAnswers: '/answers',
	adminAnswerOne: '/answers/:id',
};

export default routes;
