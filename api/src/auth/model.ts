import { authService } from "./service";

// Export type untuk TypeScript
export type Session = typeof authService.$Infer.Session;
export type User = typeof authService.$Infer.Session.user;
export type AuthServiceApi = typeof authService;