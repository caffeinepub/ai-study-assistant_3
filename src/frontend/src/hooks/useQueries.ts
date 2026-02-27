import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";
import { type Message, type StudySession } from "../backend.d";

export function useGetChatHistory(sessionId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["chatHistory", sessionId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatHistory(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

export function useCreateChatSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.createChatSession(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}

export function useAddMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      sender,
      content,
      imageData,
      isAI,
    }: {
      sessionId: string;
      sender: string;
      content: string;
      imageData: string | null;
      isAI: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addMessage(sessionId, sender, content, imageData, isAI);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory", variables.sessionId] });
    },
  });
}

export function useSaveStudySession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      startTime,
      endTime,
      durationMinutes,
      completed,
    }: {
      startTime: bigint;
      endTime: bigint;
      durationMinutes: bigint;
      completed: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.saveStudySession(startTime, endTime, durationMinutes, completed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studyHistory"] });
    },
  });
}

export function useGetStudyHistory() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<StudySession[]>({
    queryKey: ["studyHistory"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getStudyHistory(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}
