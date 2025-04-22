declare module 'react-syntax-highlighter' {
  import { ComponentType, ReactNode } from 'react';
  
  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    children?: ReactNode;
    className?: string;
    customStyle?: any;
    codeTagProps?: any;
    showLineNumbers?: boolean;
    startingLineNumber?: number;
    lineNumberStyle?: any;
    wrapLines?: boolean;
    lineProps?: any;
    [key: string]: any;
  }
  
  const SyntaxHighlighter: ComponentType<SyntaxHighlighterProps>;
  export default SyntaxHighlighter;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  const atomDark: any;
  const prism: any;
  export { atomDark, prism };
}

declare module 'react-syntax-highlighter/dist/esm/styles/hljs' {
  const atomOneDark: any;
  const docco: any;
  export { atomOneDark, docco };
} 