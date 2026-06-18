'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface GrowingTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  maxRows?: number;
}

const GrowingTextarea = forwardRef<HTMLTextAreaElement, GrowingTextareaProps>(
  function GrowingTextarea(
    { className, value, minRows = 1, maxRows = 10, onChange, ...rest },
    forwardedRef
  ) {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    useImperativeHandle(forwardedRef, () => innerRef.current as HTMLTextAreaElement);

    const resize = () => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = 'auto';
      const styles = window.getComputedStyle(el);
      const lineHeight = parseFloat(styles.lineHeight || '20') || 20;
      const paddingY =
        parseFloat(styles.paddingTop || '0') + parseFloat(styles.paddingBottom || '0');
      const borderY =
        parseFloat(styles.borderTopWidth || '0') +
        parseFloat(styles.borderBottomWidth || '0');
      const minHeight = lineHeight * minRows + paddingY + borderY;
      const maxHeight = lineHeight * maxRows + paddingY + borderY;
      const next = Math.max(minHeight, Math.min(maxHeight, el.scrollHeight));
      el.style.height = `${next}px`;
      el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
    };

    useEffect(resize, [value, minRows, maxRows]);

    return (
      <textarea
        ref={innerRef}
        value={value}
        onChange={(e) => {
          onChange?.(e);
          resize();
        }}
        rows={minRows}
        className={cn(
          'block w-full resize-none bg-transparent outline-none leading-relaxed',
          className
        )}
        {...rest}
      />
    );
  }
);

export default GrowingTextarea;
