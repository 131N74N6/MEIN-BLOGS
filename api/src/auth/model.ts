import { authService } from "./service";

export type Session = typeof authService.$Infer.Session;
export type User = typeof authService.$Infer.Session.user;
export type AuthServiceApi = typeof authService;