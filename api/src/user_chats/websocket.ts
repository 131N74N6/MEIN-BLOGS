import { EventEmitter } from "events";

export const userChatsEvents = new EventEmitter();

export const wsContext = new WeakMap<any, { roomId: string; handler: (payload: any) => void }>();