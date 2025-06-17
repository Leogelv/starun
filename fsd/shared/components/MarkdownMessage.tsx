'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { memo } from 'react';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export const MarkdownMessage = memo(({ content, className = '' }: MarkdownMessageProps) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mb-4 text-white">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold mb-3 text-white">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold mb-2 text-purple-200">{children}</h3>
        ),
        
        // Paragraphs and text
        p: ({ children }) => (
          <p className="mb-3 leading-relaxed">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-purple-300">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-purple-200">{children}</em>
        ),
        
        // Lists
        ul: ({ children }) => (
          <ul className="mb-3 space-y-1 list-none">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 space-y-1 list-none counter-reset-list">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="flex">
            <span className="text-purple-400 mr-2">•</span>
            <span className="flex-1">{children}</span>
          </li>
        ),
        
        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-4 italic text-purple-200/80 bg-purple-500/10 rounded-r">
            {children}
          </blockquote>
        ),
        
        // Code
        code: ({ children, ...props }) => {
          const isInline = !props.className;
          if (isInline) {
            return (
              <code className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-sm font-mono">
                {children}
              </code>
            );
          }
          return (
            <code className="text-purple-300 text-sm font-mono">{children}</code>
          );
        },
        
        pre: ({ children }) => (
          <pre className="overflow-x-auto p-4 bg-dark-surface rounded-lg mb-3">
            {children}
          </pre>
        ),
        
        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 underline hover:text-purple-300 transition-colors"
          >
            {children}
          </a>
        ),
        
        // Horizontal rule
        hr: () => (
          <hr className="my-6 border-t border-purple-500/20" />
        ),
        
        // Tables (from GFM)
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-purple-500/20">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-purple-500/10">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-purple-500/10">{children}</tbody>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left text-sm font-semibold text-purple-300">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-sm">{children}</td>
        ),
        
        // Task lists (from GFM)
        input: ({ type, checked, disabled }) => {
          if (type === 'checkbox') {
            return (
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                className="mr-2 rounded border-purple-500/30 bg-purple-500/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                readOnly
              />
            );
          }
          return null;
        },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

MarkdownMessage.displayName = 'MarkdownMessage';