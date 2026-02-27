import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    content: string;
    imageData?: string;
    isAI: boolean;
    sender: string;
    timestamp: Time;
}
export interface StudySession {
    startTime: Time;
    endTime: Time;
    user: Principal;
    completed: boolean;
    durationMinutes: bigint;
}
export type Time = bigint;
export interface backendInterface {
    addMessage(sessionId: string, sender: string, content: string, imageData: string | null, isAI: boolean): Promise<void>;
    createChatSession(sessionId: string): Promise<void>;
    getChatHistory(sessionId: string): Promise<Array<Message>>;
    getStudyHistory(user: Principal): Promise<Array<StudySession>>;
    saveStudySession(startTime: Time, endTime: Time, durationMinutes: bigint, completed: boolean): Promise<void>;
}
