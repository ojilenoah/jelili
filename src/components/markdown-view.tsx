'use client';

import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { cn } from '@/lib/utils';
import type { ContentFormat } from '@/lib/types';

interface MarkdownViewProps {
  body: string;
  format: ContentFormat;
  className?: string;
}

const COMPONENTS: Components = {
  a: ({ children, href, ...props }) => (
    <a
      {...props}
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </a>
  ),
};

export default function MarkdownView({ body, format, className }: MarkdownViewProps) {
  if (format === 'plain') {
    return (
      <p className={cn('whitespace-pre-wrap break-words text-foreground', className)}>
        {body}
      </p>
    );
  }

  if (format === 'code') {
    return (
      <pre
        className={cn(
          'whitespace-pre-wrap break-words rounded-md border border-border bg-muted dark:bg-foreground/10 px-3 py-2 font-code text-xs text-foreground',
          className
        )}
      >
        {body}
      </pre>
    );
  }

  if (format === 'quote') {
    return (
      <blockquote
        className={cn(
          'whitespace-pre-wrap break-words border-l-2 border-foreground/40 pl-3 italic text-foreground/90',
          className
        )}
      >
        {body}
      </blockquote>
    );
  }

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none break-words text-foreground',
        'prose-headings:text-foreground prose-headings:font-headline',
        'prose-p:my-2 prose-p:leading-relaxed',
        'prose-a:text-foreground prose-a:underline prose-a:underline-offset-2',
        'prose-strong:text-foreground prose-em:text-foreground',
        'prose-code:bg-muted dark:prose-code:bg-foreground/15 prose-code:text-foreground prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:font-medium prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-muted dark:prose-pre:bg-foreground/10 prose-pre:text-foreground prose-pre:p-3 prose-pre:rounded-md prose-pre:border prose-pre:border-border',
        'prose-blockquote:border-l-2 prose-blockquote:border-foreground/40 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-foreground/90',
        'prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5',
        'prose-img:rounded-md prose-img:my-2',
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={COMPONENTS}>
        {body}
      </ReactMarkdown>
    </div>
  );
}
