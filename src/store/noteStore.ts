import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color?: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NoteState {
  notes: Note[];
  tags: string[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isPinned' | 'isArchived'>) => string;
  updateNote: (id: string, noteData: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  pinNote: (id: string, isPinned: boolean) => void;
  archiveNote: (id: string, isArchived: boolean) => void;
  addTag: (tag: string) => void;
  deleteTag: (tag: string) => void;
  addTagToNote: (noteId: string, tag: string) => void;
  removeTagFromNote: (noteId: string, tag: string) => void;
}

// Default colors for notes
export const NOTE_COLORS = [
  "#ffffff", // White (default)
  "#f28b82", // Red
  "#fbbc04", // Orange
  "#fff475", // Yellow
  "#ccff90", // Green
  "#a7ffeb", // Teal
  "#cbf0f8", // Blue
  "#aecbfa", // Dark blue
  "#d7aefb", // Purple
  "#fdcfe8", // Pink
];

export const useNoteStore = create<NoteState>()(
  persist(
    (set) => ({
      notes: [],
      tags: ['Personal', 'Work', 'Ideas', 'To-do', 'Important'],
      
      addNote: (note) => {
        const id = uuidv4();
        set((state) => {
          const newNote: Note = {
            id,
            ...note,
            isPinned: false,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          return { notes: [...state.notes, newNote] };
        });
        return id;
      },
      
      updateNote: (id, noteData) => set((state) => {
        const noteIndex = state.notes.findIndex(note => note.id === id);
        if (noteIndex === -1) return state;

        const updatedNotes = [...state.notes];
        updatedNotes[noteIndex] = {
          ...updatedNotes[noteIndex],
          ...noteData,
          updatedAt: new Date(),
        };
        
        return { notes: updatedNotes };
      }),
      
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(note => note.id !== id),
      })),
      
      pinNote: (id, isPinned) => set((state) => {
        const noteIndex = state.notes.findIndex(note => note.id === id);
        if (noteIndex === -1) return state;

        const updatedNotes = [...state.notes];
        updatedNotes[noteIndex] = {
          ...updatedNotes[noteIndex],
          isPinned,
          updatedAt: new Date(),
        };
        
        return { notes: updatedNotes };
      }),
      
      archiveNote: (id, isArchived) => set((state) => {
        const noteIndex = state.notes.findIndex(note => note.id === id);
        if (noteIndex === -1) return state;

        const updatedNotes = [...state.notes];
        updatedNotes[noteIndex] = {
          ...updatedNotes[noteIndex],
          isArchived,
          updatedAt: new Date(),
        };
        
        return { notes: updatedNotes };
      }),
      
      addTag: (tag) => set((state) => {
        if (state.tags.includes(tag)) return state;
        return { tags: [...state.tags, tag] };
      }),
      
      deleteTag: (tag) => set((state) => ({
        tags: state.tags.filter(t => t !== tag),
        notes: state.notes.map(note => ({
          ...note,
          tags: note.tags.filter(t => t !== tag),
          updatedAt: note.tags.includes(tag) ? new Date() : note.updatedAt,
        })),
      })),
      
      addTagToNote: (noteId, tag) => set((state) => {
        const noteIndex = state.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return state;
        
        // Add to tags list if it doesn't exist
        let updatedTags = [...state.tags];
        if (!updatedTags.includes(tag)) {
          updatedTags = [...updatedTags, tag];
        }
        
        // Don't add duplicate tags to the note
        if (state.notes[noteIndex].tags.includes(tag)) {
          return { tags: updatedTags };
        }
        
        const updatedNotes = [...state.notes];
        updatedNotes[noteIndex] = {
          ...updatedNotes[noteIndex],
          tags: [...updatedNotes[noteIndex].tags, tag],
          updatedAt: new Date(),
        };
        
        return { notes: updatedNotes, tags: updatedTags };
      }),
      
      removeTagFromNote: (noteId, tag) => set((state) => {
        const noteIndex = state.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return state;

        const updatedNotes = [...state.notes];
        updatedNotes[noteIndex] = {
          ...updatedNotes[noteIndex],
          tags: updatedNotes[noteIndex].tags.filter(t => t !== tag),
          updatedAt: new Date(),
        };
        
        return { notes: updatedNotes };
      }),
    }),
    {
      name: 'note-storage',
    }
  )
); 