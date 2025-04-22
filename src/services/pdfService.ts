import { v4 as uuidv4 } from 'uuid';

interface StoredPDF {
  id: string;
  name: string;
  file: File;
  url: string;
  createdAt: number;
  tags?: string[];
}

class PDFService {
  private pdfs: StoredPDF[] = [];
  private localStorageKey = 'stored_pdfs';

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const storedData = localStorage.getItem(this.localStorageKey);
    if (storedData) {
      try {
        // We can only store metadata in localStorage, not the actual files
        const metadata = JSON.parse(storedData);
        this.pdfs = metadata;
      } catch (error) {
        console.error('Error loading PDFs from localStorage:', error);
      }
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.pdfs));
    } catch (error) {
      console.error('Error saving PDFs to localStorage:', error);
    }
  }

  async storePDF(file: File): Promise<StoredPDF> {
    // Create a URL for the PDF file
    const url = URL.createObjectURL(file);
    
    const newPDF: StoredPDF = {
      id: uuidv4(),
      name: file.name,
      file: file,
      url: url,
      createdAt: Date.now(),
      tags: []
    };
    
    this.pdfs.push(newPDF);
    this.saveToLocalStorage();
    
    return newPDF;
  }

  getAllPDFs(): StoredPDF[] {
    return [...this.pdfs];
  }

  getPDFById(id: string): StoredPDF | undefined {
    return this.pdfs.find(pdf => pdf.id === id);
  }

  deletePDF(id: string): boolean {
    const pdfIndex = this.pdfs.findIndex(pdf => pdf.id === id);
    
    if (pdfIndex !== -1) {
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(this.pdfs[pdfIndex].url);
      
      // Remove the PDF from the array
      this.pdfs.splice(pdfIndex, 1);
      this.saveToLocalStorage();
      return true;
    }
    
    return false;
  }

  addTagToPDF(pdfId: string, tag: string): boolean {
    const pdf = this.getPDFById(pdfId);
    
    if (pdf) {
      if (!pdf.tags) {
        pdf.tags = [];
      }
      
      if (!pdf.tags.includes(tag)) {
        pdf.tags.push(tag);
        this.saveToLocalStorage();
      }
      
      return true;
    }
    
    return false;
  }

  removeTagFromPDF(pdfId: string, tag: string): boolean {
    const pdf = this.getPDFById(pdfId);
    
    if (pdf && pdf.tags) {
      const tagIndex = pdf.tags.indexOf(tag);
      
      if (tagIndex !== -1) {
        pdf.tags.splice(tagIndex, 1);
        this.saveToLocalStorage();
        return true;
      }
    }
    
    return false;
  }
}

export const pdfService = new PDFService();
export type { StoredPDF }; 