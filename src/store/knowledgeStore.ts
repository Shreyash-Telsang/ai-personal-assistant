import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// Type definitions
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category?: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastReviewed?: Date;
  reviewCount: number;
  color?: string;
  links: NoteLink[];
  citations: Citation[];
  attachments: Attachment[];
  spaceRepetitionData?: SpaceRepetitionData;
}

export interface NoteLink {
  id: string;
  targetNoteId: string;
  description?: string;
  bidirectional: boolean;
}

export interface Citation {
  id: string;
  type: 'book' | 'article' | 'webpage' | 'journal' | 'other';
  title: string;
  authors: string[];
  year?: number;
  url?: string;
  doi?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  accessed?: Date;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: string; // Base64 encoded data
  createdAt: Date;
}

export interface SpaceRepetitionData {
  interval: number; // Days until next review
  ease: number; // Difficulty factor (1.3 - 2.5)
  nextReviewDate: Date;
  reviewHistory: ReviewHistoryItem[];
}

export interface ReviewHistoryItem {
  date: Date;
  quality: 1 | 2 | 3 | 4 | 5; // 1=hard, 5=easy
  interval: number;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  noteIds: string[];
  createdAt: Date;
  updatedAt: Date;
  icon?: string;
  color?: string;
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

interface KnowledgeState {
  notes: Note[];
  collections: Collection[];
  tags: string[];
  categories: string[];
  
  // Note functions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isPinned' | 'isArchived' | 'links' | 'citations' | 'attachments' | 'reviewCount'>) => string;
  updateNote: (id: string, noteData: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  pinNote: (id: string, isPinned: boolean) => void;
  archiveNote: (id: string, isArchived: boolean) => void;
  
  // Link functions
  addLink: (noteId: string, targetNoteId: string, description?: string, bidirectional?: boolean) => string;
  updateLink: (noteId: string, linkId: string, linkData: Partial<NoteLink>) => void;
  deleteLink: (noteId: string, linkId: string) => void;
  
  // Citation functions
  addCitation: (noteId: string, citation: Omit<Citation, 'id'>) => string;
  updateCitation: (noteId: string, citationId: string, citationData: Partial<Citation>) => void;
  deleteCitation: (noteId: string, citationId: string) => void;
  
  // Attachment functions
  addAttachment: (noteId: string, attachment: Omit<Attachment, 'id' | 'createdAt'>) => string;
  deleteAttachment: (noteId: string, attachmentId: string) => void;
  
  // Space repetition functions
  initializeSpaceRepetition: (noteId: string) => void;
  recordReview: (noteId: string, quality: 1 | 2 | 3 | 4 | 5) => void;
  
  // Collection functions
  addCollection: (collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt' | 'noteIds'>) => string;
  updateCollection: (id: string, collectionData: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  addNoteToCollection: (collectionId: string, noteId: string) => void;
  removeNoteFromCollection: (collectionId: string, noteId: string) => void;
  
  // Tag and category functions
  addTag: (tag: string) => void;
  deleteTag: (tag: string) => void;
  addTagToNote: (noteId: string, tag: string) => void;
  removeTagFromNote: (noteId: string, tag: string) => void;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  
  // Knowledge graph functions
  getConnectedNotes: (noteId: string, depth?: number) => Note[];
  getNotesWithTag: (tag: string) => Note[];
  getNotesInCategory: (category: string) => Note[];
  searchNotes: (query: string) => Note[];
  getDueReviews: () => Note[];
}

export const useKnowledgeStore = create<KnowledgeState>()(
  persist(
    (set, get) => ({
      notes: [],
      collections: [],
      tags: ['Research', 'Lecture', 'Assignment', 'Exam', 'Project', 'Reference'],
      categories: ['Computer Science', 'Mathematics', 'Physics', 'Literature', 'History', 'Languages'],
      
      // Note functions
      addNote: (note) => {
        const id = uuidv4();
        const now = new Date();
        set((state) => ({
          notes: [
            ...state.notes, 
            {
              id,
              ...note,
              isPinned: false,
              isArchived: false,
              createdAt: now,
              updatedAt: now,
              links: [],
              citations: [],
              attachments: [],
              reviewCount: 0,
            }
          ],
        }));
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
      
      deleteNote: (id) => set((state) => {
        // Remove from collections
        const updatedCollections = state.collections.map(collection => ({
          ...collection,
          noteIds: collection.noteIds.filter(noteId => noteId !== id),
        }));
        
        // Remove links to this note from other notes
        const updatedNotes = state.notes
          .filter(note => note.id !== id)
          .map(note => ({
            ...note,
            links: note.links.filter(link => link.targetNoteId !== id),
          }));
        
        return {
          notes: updatedNotes,
          collections: updatedCollections,
        };
      }),
      
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
      
      // Link functions
      addLink: (noteId, targetNoteId, description = '', bidirectional = false) => {
        const linkId = uuidv4();
        
        set((state) => {
          const noteIndex = state.notes.findIndex(note => note.id === noteId);
          const targetNoteIndex = state.notes.findIndex(note => note.id === targetNoteId);
          
          if (noteIndex === -1 || targetNoteIndex === -1) return state;
          
          const updatedNotes = [...state.notes];
          
          // Add link to source note
          updatedNotes[noteIndex] = {
            ...updatedNotes[noteIndex],
            links: [
              ...updatedNotes[noteIndex].links,
              {
                id: linkId,
                targetNoteId,
                description,
                bidirectional,
              },
            ],
            updatedAt: new Date(),
          };
          
          // If bidirectional, add reverse link to target note
          if (bidirectional) {
            const reverseLinkId = uuidv4();
            updatedNotes[targetNoteIndex] = {
              ...updatedNotes[targetNoteIndex],
              links: [
                ...updatedNotes[targetNoteIndex].links,
                {
                  id: reverseLinkId,
                  targetNoteId: noteId,
                  description,
                  bidirectional,
                },
              ],
              updatedAt: new Date(),
            };
          }
          
          return { notes: updatedNotes };
        });
        
        return linkId;
      },
      
      updateLink: (noteId, linkId, linkData) => set((state) => {
        const noteIndex = state.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return state;
        
        const note = state.notes[noteIndex];
        const linkIndex = note.links.findIndex(link => link.id === linkId);
        if (linkIndex === -1) return state;
        
        const updatedNotes = [...state.notes];
        const updatedLinks = [...note.links];
        
        const originalLink = note.links[linkIndex];
        const wasOriginallyBidirectional = originalLink.bidirectional;
        const targetNoteId = originalLink.targetNoteId;
        
        // Update the link
        updatedLinks[linkIndex] = {
          ...originalLink,
          ...linkData,
        };
        
        updatedNotes[noteIndex] = {
          ...note,
          links: updatedLinks,
          updatedAt: new Date(),
        };
        
        // Handle bidirectional changes if needed
        const nowBidirectional = 'bidirectional' in linkData ? linkData.bidirectional : wasOriginallyBidirectional;
        
        if (wasOriginallyBidirectional !== nowBidirectional) {
          const targetNoteIndex = state.notes.findIndex(n => n.id === targetNoteId);
          
          if (targetNoteIndex !== -1) {
            const targetNote = updatedNotes[targetNoteIndex];
            
            if (nowBidirectional) {
              // Need to add a reverse link
              const reverseLinkId = uuidv4();
              updatedNotes[targetNoteIndex] = {
                ...targetNote,
                links: [
                  ...targetNote.links,
                  {
                    id: reverseLinkId,
                    targetNoteId: noteId,
                    description: linkData.description || originalLink.description,
                    bidirectional: true,
                  },
                ],
                updatedAt: new Date(),
              };
            } else {
              // Need to remove the reverse link
              updatedNotes[targetNoteIndex] = {
                ...targetNote,
                links: targetNote.links.filter(link => link.targetNoteId !== noteId),
                updatedAt: new Date(),
              };
            }
          }
        }
        
        return { notes: updatedNotes };
      }),
      
      deleteLink: (noteId, linkId) => set((state) => {
        const noteIndex = state.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return state;
        
        const note = state.notes[noteIndex];
        const linkIndex = note.links.findIndex(link => link.id === linkId);
        if (linkIndex === -1) return state;
        
        const link = note.links[linkIndex];
        const isBidirectional = link.bidirectional;
        const targetNoteId = link.targetNoteId;
        
        const updatedNotes = [...state.notes];
        
        // Remove link from source note
        updatedNotes[noteIndex] = {
          ...note,
          links: note.links.filter((_, i) => i !== linkIndex),
          updatedAt: new Date(),
        };
        
        // If bidirectional, remove reverse link from target note
        if (isBidirectional) {
          const targetNoteIndex = state.notes.findIndex(n => n.id === targetNoteId);
          
          if (targetNoteIndex !== -1) {
            const targetNote = updatedNotes[targetNoteIndex];
            
            updatedNotes[targetNoteIndex] = {
              ...targetNote,
              links: targetNote.links.filter(link => link.targetNoteId !== noteId),
              updatedAt: new Date(),
            };
          }
        }
        
        return { notes: updatedNotes };
      }),
      
      // Citation functions
      addCitation: (noteId, citation) => {
        const citationId = uuidv4();
        
        set((state) => {
          const noteIndex = state.notes.findIndex(note => note.id === noteId);
          if (noteIndex === -1) return state;
          
          const updatedNotes = [...state.notes];
          
          updatedNotes[noteIndex] = {
            ...updatedNotes[noteIndex],
            citations: [
              ...updatedNotes[noteIndex].citations,
              {
                id: citationId,
                ...citation,
              },
            ],
            updatedAt: new Date(),
          };
          
          return { notes: updatedNotes };
        });
        
        return citationId;
      },
      
      updateCitation: (noteId, citationId, citationData) => set((state) => {
        const noteIndex = state.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return state;
        
        const note = state.notes[noteIndex];
        const citationIndex = note.citations.findIndex(citation => citation.id === citationId);
        if (citationIndex === -1) return state;
        
        const updatedNotes = [...state.notes];
        const updatedCitations = [...note.citations];
        
        updatedCitations[citationIndex] = {
          ...updatedCitations[citationIndex],
          ...citationData,
        };
        
        updatedNotes[noteIndex] = {
          ...note,
          citations: updatedCitations,
          updatedAt: new Date(),
        };
        
        return { notes: updatedNotes };
      }),
      
      deleteCitation: (noteId, citationId) => set((state) => {
        const noteIndex = state.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return state;
        
        const note = state.notes[noteIndex];
        
        const updatedNotes = [...state.notes];
        
        updatedNotes[noteIndex] = {
          ...note,
          citations: note.citations.filter(citation => citation.id !== citationId),
          updatedAt: new Date(),
        };
        
        return { notes: updatedNotes };
      }),
      
      // Attachment functions
      addAttachment: (noteId, attachment) => {
        const attachmentId = uuidv4();
        
        set((state) => {
          const noteIndex = state.notes.findIndex(note => note.id === noteId);
          if (noteIndex === -1) return state;
          
          const updatedNotes = [...state.notes];
          
          updatedNotes[noteIndex] = {
            ...updatedNotes[noteIndex],
            attachments: [
              ...updatedNotes[noteIndex].attachments,
              {
                id: attachmentId,
                ...attachment,
                createdAt: new Date(),
              },
            ],
            updatedAt: new Date(),
          };
          
          return { notes: updatedNotes };
        });
        
        return attachmentId;
      },
      
      deleteAttachment: (noteId, attachmentId) => set((state) => {
        const noteIndex = state.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return state;
        
        const note = state.notes[noteIndex];
        
        const updatedNotes = [...state.notes];
        
        updatedNotes[noteIndex] = {
          ...note,
          attachments: note.attachments.filter(attachment => attachment.id !== attachmentId),
          updatedAt: new Date(),
        };
        
        return { notes: updatedNotes };
      }),
      
      // Space repetition functions
      initializeSpaceRepetition: (noteId) => set((state) => {
        const noteIndex = state.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return state;
        
        const note = state.notes[noteIndex];
        
        // Skip if already initialized
        if (note.spaceRepetitionData) return state;
        
        // Set next review to tomorrow
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + 1);
        
        const updatedNotes = [...state.notes];
        
        updatedNotes[noteIndex] = {
          ...note,
          spaceRepetitionData: {
            interval: 1,
            ease: 2.5,
            nextReviewDate,
            reviewHistory: [],
          },
          updatedAt: new Date(),
        };
        
        return { notes: updatedNotes };
      }),
      
      recordReview: (noteId, quality) => set((state) => {
        const noteIndex = state.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return state;
        
        const note = state.notes[noteIndex];
        
        // Initialize if not already
        if (!note.spaceRepetitionData) {
          get().initializeSpaceRepetition(noteId);
          return state; // Return current state, initialization will trigger a separate update
        }
        
        const spaceData = note.spaceRepetitionData!;
        
        // Implement SuperMemo-2 algorithm
        let newEase = spaceData.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (newEase < 1.3) newEase = 1.3;
        
        let newInterval = 1;
        if (quality >= 3) {
          if (spaceData.interval === 1) {
            newInterval = 6;
          } else {
            newInterval = Math.round(spaceData.interval * newEase);
          }
        }
        
        const now = new Date();
        const nextReviewDate = new Date();
        nextReviewDate.setDate(now.getDate() + newInterval);
        
        const updatedNotes = [...state.notes];
        
        updatedNotes[noteIndex] = {
          ...note,
          lastReviewed: now,
          reviewCount: (note.reviewCount || 0) + 1,
          spaceRepetitionData: {
            interval: newInterval,
            ease: newEase,
            nextReviewDate,
            reviewHistory: [
              ...spaceData.reviewHistory,
              {
                date: now,
                quality,
                interval: newInterval,
              },
            ],
          },
          updatedAt: now,
        };
        
        return { notes: updatedNotes };
      }),
      
      // Collection functions
      addCollection: (collection) => {
        const id = uuidv4();
        const now = new Date();
        
        set((state) => ({
          collections: [
            ...state.collections,
            {
              id,
              ...collection,
              noteIds: [],
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
        
        return id;
      },
      
      updateCollection: (id, collectionData) => set((state) => {
        const collectionIndex = state.collections.findIndex(collection => collection.id === id);
        if (collectionIndex === -1) return state;
        
        const updatedCollections = [...state.collections];
        
        updatedCollections[collectionIndex] = {
          ...updatedCollections[collectionIndex],
          ...collectionData,
          updatedAt: new Date(),
        };
        
        return { collections: updatedCollections };
      }),
      
      deleteCollection: (id) => set((state) => ({
        collections: state.collections.filter(collection => collection.id !== id),
      })),
      
      addNoteToCollection: (collectionId, noteId) => set((state) => {
        const collectionIndex = state.collections.findIndex(collection => collection.id === collectionId);
        if (collectionIndex === -1) return state;
        
        const collection = state.collections[collectionIndex];
        
        // Skip if note already in collection
        if (collection.noteIds.includes(noteId)) return state;
        
        const updatedCollections = [...state.collections];
        
        updatedCollections[collectionIndex] = {
          ...collection,
          noteIds: [...collection.noteIds, noteId],
          updatedAt: new Date(),
        };
        
        return { collections: updatedCollections };
      }),
      
      removeNoteFromCollection: (collectionId, noteId) => set((state) => {
        const collectionIndex = state.collections.findIndex(collection => collection.id === collectionId);
        if (collectionIndex === -1) return state;
        
        const collection = state.collections[collectionIndex];
        
        const updatedCollections = [...state.collections];
        
        updatedCollections[collectionIndex] = {
          ...collection,
          noteIds: collection.noteIds.filter(id => id !== noteId),
          updatedAt: new Date(),
        };
        
        return { collections: updatedCollections };
      }),
      
      // Tag and category functions
      addTag: (tag) => set((state) => {
        if (state.tags.includes(tag)) return state;
        return { tags: [...state.tags, tag] };
      }),
      
      deleteTag: (tag) => set((state) => {
        // Remove tag from all notes
        const updatedNotes = state.notes.map(note => ({
          ...note,
          tags: note.tags.filter(t => t !== tag),
          updatedAt: note.tags.includes(tag) ? new Date() : note.updatedAt,
        }));
        
        return {
          tags: state.tags.filter(t => t !== tag),
          notes: updatedNotes,
        };
      }),
      
      addTagToNote: (noteId, tag) => set((state) => {
        const noteIndex = state.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return state;
        
        const note = state.notes[noteIndex];
        
        // Skip if tag already on note
        if (note.tags.includes(tag)) return state;
        
        // Add tag to global tags if it doesn't exist
        const updatedTags = [...state.tags];
        if (!updatedTags.includes(tag)) {
          updatedTags.push(tag);
        }
        
        const updatedNotes = [...state.notes];
        
        updatedNotes[noteIndex] = {
          ...note,
          tags: [...note.tags, tag],
          updatedAt: new Date(),
        };
        
        return {
          tags: updatedTags,
          notes: updatedNotes,
        };
      }),
      
      removeTagFromNote: (noteId, tag) => set((state) => {
        const noteIndex = state.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return state;
        
        const note = state.notes[noteIndex];
        
        const updatedNotes = [...state.notes];
        
        updatedNotes[noteIndex] = {
          ...note,
          tags: note.tags.filter(t => t !== tag),
          updatedAt: new Date(),
        };
        
        return { notes: updatedNotes };
      }),
      
      addCategory: (category) => set((state) => {
        if (state.categories.includes(category)) return state;
        return { categories: [...state.categories, category] };
      }),
      
      deleteCategory: (category) => set((state) => ({
        categories: state.categories.filter(c => c !== category),
      })),
      
      // Knowledge graph functions
      getConnectedNotes: (noteId, depth = 1) => {
        const state = get();
        const visited = new Set<string>();
        const connected = new Set<string>();
        
        const addConnected = (id: string, currentDepth: number) => {
          if (visited.has(id)) return;
          visited.add(id);
          
          if (id !== noteId) {
            connected.add(id);
          }
          
          if (currentDepth < depth) {
            const note = state.notes.find(n => n.id === id);
            if (note) {
              for (const link of note.links) {
                addConnected(link.targetNoteId, currentDepth + 1);
              }
            }
          }
        };
        
        addConnected(noteId, 0);
        
        return state.notes.filter(note => connected.has(note.id));
      },
      
      getNotesWithTag: (tag) => {
        const state = get();
        return state.notes.filter(note => note.tags.includes(tag));
      },
      
      getNotesInCategory: (category) => {
        const state = get();
        return state.notes.filter(note => note.category === category);
      },
      
      searchNotes: (query) => {
        const state = get();
        const lowerQuery = query.toLowerCase();
        
        return state.notes.filter(note => 
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery) ||
          note.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
          (note.category && note.category.toLowerCase().includes(lowerQuery))
        );
      },
      
      getDueReviews: () => {
        const state = get();
        const now = new Date();
        
        return state.notes.filter(note => 
          note.spaceRepetitionData && 
          note.spaceRepetitionData.nextReviewDate <= now
        );
      },
    }),
    {
      name: 'knowledge-storage',
    }
  )
);
