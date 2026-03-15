declare global {
	namespace App {
		// interface Error {}
		interface Locals { user?: any }

		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties
		}

		// interface PageData {}
		// interface PageState {}
	}
}

export {};
