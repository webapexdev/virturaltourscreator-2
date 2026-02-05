import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi, Note, NoteCreateData, NoteUpdateData } from '../services/api';

// Query keys
export const notesKeys = {
  all: ['notes'] as const,
  lists: () => [...notesKeys.all, 'list'] as const,
  list: (filters?: { search?: string; status?: string; category?: string }) => 
    [...notesKeys.lists(), filters] as const,
  details: () => [...notesKeys.all, 'detail'] as const,
  detail: (id: number) => [...notesKeys.details(), id] as const,
};

// Hook to fetch notes list
export const useNotesQuery = (filters?: { search?: string; status?: string; category?: string }, enabled: boolean = true) => {
  return useQuery({
    queryKey: notesKeys.list(filters),
    queryFn: async () => {
      const response = await notesApi.list(filters);
      return response;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
  });
};

// Hook to fetch a single note
export const useNoteQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: notesKeys.detail(id),
    queryFn: async () => {
      const response = await notesApi.get(id);
      return response.note;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook to create a note
export const useCreateNoteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: NoteCreateData) => {
      const response = await notesApi.create(data);
      return response.note;
    },
    onSuccess: () => {
      // Invalidate and refetch notes list
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() });
    },
  });
};

// Hook to update a note
export const useUpdateNoteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: NoteUpdateData }) => {
      const response = await notesApi.update(id, data);
      return response.note;
    },
    onSuccess: (data) => {
      // Update the specific note in cache
      queryClient.setQueryData(notesKeys.detail(data.id), data);
      // Invalidate and refetch notes list
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() });
    },
  });
};

// Hook to delete a note
export const useDeleteNoteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await notesApi.delete(id);
      return id;
    },
    onSuccess: (id) => {
      // Remove the note from cache
      queryClient.removeQueries({ queryKey: notesKeys.detail(id) });
      // Invalidate and refetch notes list
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() });
    },
  });
};

