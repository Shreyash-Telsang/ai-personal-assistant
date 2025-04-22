import { v4 as uuidv4 } from 'uuid';
import { pdfService, StoredPDF } from './pdfService';

// Interface for paper outline section
interface OutlineSection {
  id: string;
  title: string;
  description: string;
  subsections?: OutlineSection[];
}

// Interface for a paper outline
interface PaperOutline {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  sections: OutlineSection[];
}

// Interface for a citation
interface Citation {
  id: string;
  title: string;
  authors: string[];
  year: number;
  source: string;
  url?: string;
  pdfId?: string; // Reference to a stored PDF if available
}

// Interface for keyword analysis
interface KeywordAnalysis {
  keyword: string;
  relevance: number; // 0-100 score
  frequency: number;
  suggestions?: string[];
}

class AcademicService {
  private outlines: PaperOutline[] = [];
  private citations: Citation[] = [];
  private localStorageKeyOutlines = 'paper_outlines';
  private localStorageKeyCitations = 'citations';

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    // Load outlines
    const storedOutlines = localStorage.getItem(this.localStorageKeyOutlines);
    if (storedOutlines) {
      try {
        this.outlines = JSON.parse(storedOutlines);
      } catch (error) {
        console.error('Error loading outlines from localStorage:', error);
      }
    }

    // Load citations
    const storedCitations = localStorage.getItem(this.localStorageKeyCitations);
    if (storedCitations) {
      try {
        this.citations = JSON.parse(storedCitations);
      } catch (error) {
        console.error('Error loading citations from localStorage:', error);
      }
    }
  }

  private saveOutlinesToLocalStorage(): void {
    try {
      localStorage.setItem(this.localStorageKeyOutlines, JSON.stringify(this.outlines));
    } catch (error) {
      console.error('Error saving outlines to localStorage:', error);
    }
  }

  private saveCitationsToLocalStorage(): void {
    try {
      localStorage.setItem(this.localStorageKeyCitations, JSON.stringify(this.citations));
    } catch (error) {
      console.error('Error saving citations to localStorage:', error);
    }
  }

  // Smart Paper Outline Generator
  async generatePaperOutline(topic: string, description: string): Promise<PaperOutline> {
    try {
      // In a real implementation, this would call the Gemini API
      // For now, we'll create a simplified mock response
      const mockOutline: PaperOutline = {
        id: uuidv4(),
        title: topic,
        description: description,
        createdAt: Date.now(),
        sections: [
          {
            id: uuidv4(),
            title: 'Introduction',
            description: 'Provide background information and state the purpose of the paper.',
            subsections: []
          },
          {
            id: uuidv4(),
            title: 'Literature Review',
            description: 'Summarize existing research related to your topic.',
            subsections: []
          },
          {
            id: uuidv4(),
            title: 'Methodology',
            description: 'Explain your research methods and approach.',
            subsections: []
          },
          {
            id: uuidv4(),
            title: 'Results',
            description: 'Present your findings and data analysis.',
            subsections: []
          },
          {
            id: uuidv4(),
            title: 'Discussion',
            description: 'Interpret results and discuss implications.',
            subsections: []
          },
          {
            id: uuidv4(),
            title: 'Conclusion',
            description: 'Summarize key findings and suggest future research directions.',
            subsections: []
          }
        ]
      };

      this.outlines.push(mockOutline);
      this.saveOutlinesToLocalStorage();
      return mockOutline;
    } catch (error) {
      console.error('Error generating paper outline:', error);
      throw error;
    }
  }

  // Citation Recommendation Engine
  async findRelevantCitations(keywords: string[]): Promise<Citation[]> {
    // In a real implementation, this would search through a database or API
    // For demonstration, we'll filter the stored citations based on keywords
    const relevantCitations = this.citations.filter(citation => {
      // Check if any keyword is found in the title
      return keywords.some(keyword => 
        citation.title.toLowerCase().includes(keyword.toLowerCase())
      );
    });

    return relevantCitations;
  }

  // Add a citation manually
  addCitation(citation: Omit<Citation, 'id'>): Citation {
    const newCitation: Citation = {
      ...citation,
      id: uuidv4()
    };
    
    this.citations.push(newCitation);
    this.saveCitationsToLocalStorage();
    
    return newCitation;
  }

  // Academic Writing Analysis
  async analyzeWriting(text: string): Promise<{
    suggestions: string[],
    coherence: number,
    keywords: KeywordAnalysis[]
  }> {
    // In a real implementation, this would use the Gemini API
    // For demonstration, we'll return mock results
    
    // Extract some keywords from the text
    const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 3);
    const wordFrequency: Record<string, number> = {};
    
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    // Get top 5 most frequent words as keywords
    const sortedWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const keywords: KeywordAnalysis[] = sortedWords.map(([word, frequency]) => ({
      keyword: word,
      relevance: Math.min(frequency * 10, 100),
      frequency,
      suggestions: [`${word}s`, `${word}ing`, `${word}ed`].filter(w => w !== word)
    }));
    
    return {
      suggestions: [
        "Consider using more precise language in the introduction.",
        "The paragraph structure could be improved for better flow.",
        "Add more supporting evidence for your main arguments."
      ],
      coherence: 75, // 0-100 score
      keywords
    };
  }

  // Paragraph Coherence Analyzer
  async analyzeParagraphCoherence(paragraph: string): Promise<{
    score: number,
    suggestions: string[]
  }> {
    // In a real implementation, this would use the Gemini API
    // For now, we'll provide a mock analysis
    
    const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const score = Math.min(Math.max(50 + sentences.length * 5, 0), 100);
    
    return {
      score,
      suggestions: [
        "Ensure topic sentences clearly state the main idea.",
        "Improve transitions between sentences for better flow.",
        "Consider adding more supporting details to strengthen your arguments."
      ]
    };
  }

  // Keyword Extractor & Optimizer
  async extractAndOptimizeKeywords(text: string): Promise<KeywordAnalysis[]> {
    // Extract some keywords from the text
    const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 3);
    const wordFrequency: Record<string, number> = {};
    
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    // Get top 8 most frequent words as keywords
    const sortedWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    
    const keywords: KeywordAnalysis[] = sortedWords.map(([word, frequency]) => ({
      keyword: word,
      relevance: Math.min(frequency * 10, 100),
      frequency,
      suggestions: [
        `${word} analysis`, 
        `${word} research`, 
        `${word} study`,
        `${word} framework`
      ]
    }));
    
    return keywords;
  }

  // Get methods
  getAllOutlines(): PaperOutline[] {
    return [...this.outlines];
  }

  getOutlineById(id: string): PaperOutline | undefined {
    return this.outlines.find(outline => outline.id === id);
  }

  getAllCitations(): Citation[] {
    return [...this.citations];
  }

  getCitationById(id: string): Citation | undefined {
    return this.citations.find(citation => citation.id === id);
  }

  // Delete methods
  deleteOutline(id: string): boolean {
    const index = this.outlines.findIndex(outline => outline.id === id);
    if (index !== -1) {
      this.outlines.splice(index, 1);
      this.saveOutlinesToLocalStorage();
      return true;
    }
    return false;
  }

  deleteCitation(id: string): boolean {
    const index = this.citations.findIndex(citation => citation.id === id);
    if (index !== -1) {
      this.citations.splice(index, 1);
      this.saveCitationsToLocalStorage();
      return true;
    }
    return false;
  }
}

export const academicService = new AcademicService();
export type { PaperOutline, OutlineSection, Citation, KeywordAnalysis };
