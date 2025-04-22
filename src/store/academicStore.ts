import { create } from 'zustand';
import { academicService, PaperOutline, Citation, KeywordAnalysis, OutlineSection } from '../services/academicService';
import { pdfService, StoredPDF } from '../services/pdfService';

interface AcademicState {
  // Paper Outline
  outlines: PaperOutline[];
  activeOutlineId: string | null;
  isGeneratingOutline: boolean;
  
  // Citations
  citations: Citation[];
  searchResults: Citation[];
  isSearchingCitations: boolean;
  
  // PDFs
  pdfs: StoredPDF[];
  activePdfId: string | null;
  isStoringPdf: boolean;
  
  // Academic Writing
  writingAnalysis: {
    suggestions: string[];
    coherence: number;
    keywords: KeywordAnalysis[];
  } | null;
  isAnalyzingWriting: boolean;
  
  // Paragraph Coherence
  coherenceAnalysis: {
    score: number;
    suggestions: string[];
  } | null;
  isAnalyzingCoherence: boolean;
  
  // Keywords
  keywordAnalysis: KeywordAnalysis[] | null;
  isExtractingKeywords: boolean;
  
  // Actions
  loadAllData: () => Promise<void>;
  
  // Paper Outline Actions
  generateOutline: (topic: string, description: string) => Promise<PaperOutline>;
  setActiveOutline: (id: string | null) => void;
  deleteOutline: (id: string) => Promise<boolean>;
  
  // Citation Actions
  findCitations: (keywords: string[]) => Promise<Citation[]>;
  addCitation: (citation: Omit<Citation, 'id'>) => Promise<Citation>;
  deleteCitation: (id: string) => Promise<boolean>;
  
  // PDF Actions
  storePdf: (file: File) => Promise<StoredPDF>;
  setActivePdf: (id: string | null) => void;
  deletePdf: (id: string) => Promise<boolean>;
  
  // Academic Writing Actions
  analyzeWriting: (text: string) => Promise<void>;
  clearWritingAnalysis: () => void;
  
  // Paragraph Coherence Actions
  analyzeCoherence: (paragraph: string) => Promise<void>;
  clearCoherenceAnalysis: () => void;
  
  // Keyword Actions
  extractKeywords: (text: string) => Promise<void>;
  clearKeywordAnalysis: () => void;
}

export const useAcademicStore = create<AcademicState>((set, get) => ({
  // Initial state
  outlines: [],
  activeOutlineId: null,
  isGeneratingOutline: false,
  
  citations: [],
  searchResults: [],
  isSearchingCitations: false,
  
  pdfs: [],
  activePdfId: null,
  isStoringPdf: false,
  
  writingAnalysis: null,
  isAnalyzingWriting: false,
  
  coherenceAnalysis: null,
  isAnalyzingCoherence: false,
  
  keywordAnalysis: null,
  isExtractingKeywords: false,
  
  // Actions
  loadAllData: async () => {
    const outlines = academicService.getAllOutlines();
    const citations = academicService.getAllCitations();
    const pdfs = pdfService.getAllPDFs();
    
    set({
      outlines,
      citations,
      pdfs
    });
  },
  
  // Paper Outline Actions
  generateOutline: async (topic, description) => {
    set({ isGeneratingOutline: true });
    try {
      const outline = await academicService.generatePaperOutline(topic, description);
      set(state => ({
        outlines: [...state.outlines, outline],
        activeOutlineId: outline.id,
        isGeneratingOutline: false
      }));
      return outline;
    } catch (error) {
      set({ isGeneratingOutline: false });
      throw error;
    }
  },
  
  setActiveOutline: (id) => {
    set({ activeOutlineId: id });
  },
  
  deleteOutline: async (id) => {
    const success = academicService.deleteOutline(id);
    if (success) {
      set(state => ({
        outlines: state.outlines.filter(outline => outline.id !== id),
        activeOutlineId: state.activeOutlineId === id ? null : state.activeOutlineId
      }));
    }
    return success;
  },
  
  // Citation Actions
  findCitations: async (keywords) => {
    set({ isSearchingCitations: true });
    try {
      const citations = await academicService.findRelevantCitations(keywords);
      set({
        searchResults: citations,
        isSearchingCitations: false
      });
      return citations;
    } catch (error) {
      set({ isSearchingCitations: false });
      throw error;
    }
  },
  
  addCitation: async (citation) => {
    const newCitation = academicService.addCitation(citation);
    set(state => ({
      citations: [...state.citations, newCitation]
    }));
    return newCitation;
  },
  
  deleteCitation: async (id) => {
    const success = academicService.deleteCitation(id);
    if (success) {
      set(state => ({
        citations: state.citations.filter(citation => citation.id !== id),
        searchResults: state.searchResults.filter(citation => citation.id !== id)
      }));
    }
    return success;
  },
  
  // PDF Actions
  storePdf: async (file) => {
    set({ isStoringPdf: true });
    try {
      const pdf = await pdfService.storePDF(file);
      set(state => ({
        pdfs: [...state.pdfs, pdf],
        activePdfId: pdf.id,
        isStoringPdf: false
      }));
      return pdf;
    } catch (error) {
      set({ isStoringPdf: false });
      throw error;
    }
  },
  
  setActivePdf: (id) => {
    set({ activePdfId: id });
  },
  
  deletePdf: async (id) => {
    const success = pdfService.deletePDF(id);
    if (success) {
      set(state => ({
        pdfs: state.pdfs.filter(pdf => pdf.id !== id),
        activePdfId: state.activePdfId === id ? null : state.activePdfId
      }));
    }
    return success;
  },
  
  // Academic Writing Actions
  analyzeWriting: async (text) => {
    set({ isAnalyzingWriting: true });
    try {
      const analysis = await academicService.analyzeWriting(text);
      set({
        writingAnalysis: analysis,
        isAnalyzingWriting: false
      });
    } catch (error) {
      set({ isAnalyzingWriting: false });
      throw error;
    }
  },
  
  clearWritingAnalysis: () => {
    set({ writingAnalysis: null });
  },
  
  // Paragraph Coherence Actions
  analyzeCoherence: async (paragraph) => {
    set({ isAnalyzingCoherence: true });
    try {
      const analysis = await academicService.analyzeParagraphCoherence(paragraph);
      set({
        coherenceAnalysis: analysis,
        isAnalyzingCoherence: false
      });
    } catch (error) {
      set({ isAnalyzingCoherence: false });
      throw error;
    }
  },
  
  clearCoherenceAnalysis: () => {
    set({ coherenceAnalysis: null });
  },
  
  // Keyword Actions
  extractKeywords: async (text) => {
    set({ isExtractingKeywords: true });
    try {
      const keywords = await academicService.extractAndOptimizeKeywords(text);
      set({
        keywordAnalysis: keywords,
        isExtractingKeywords: false
      });
    } catch (error) {
      set({ isExtractingKeywords: false });
      throw error;
    }
  },
  
  clearKeywordAnalysis: () => {
    set({ keywordAnalysis: null });
  }
}));
