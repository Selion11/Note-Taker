import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const api = axios.create({ baseURL });

export interface Category {
  id: number;
  name: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  isArchived: boolean;
  updatedAt: string;
  categories: Category[];
  categoryIds?: number[];
}

export const noteService = {
  getNotes: (isArchived?: boolean) => api.get<Note[]>('/notes', { params: { isArchived } }),

  createNote: (data: Pick<Note, 'title' | 'content'> & { categoryIds?: number[]; isArchived?: boolean }) =>
    api.post<Note>('/notes', data),

  updateNote: (id: number, data: Partial<Pick<Note, 'title' | 'content' | 'isArchived'>> & { categoryIds?: number[] }) =>
    api.patch<Note>(`/notes/${id}`, data),

  deleteNote: (id: number) => api.delete(`/notes/${id}`),

  getCategories: () => api.get<Category[]>('/categories'),

  createCategory: (name: string) => api.post<Category>('/categories', { name }),

  deleteCategory: (id: number) => api.delete(`/categories/${id}`),
};
