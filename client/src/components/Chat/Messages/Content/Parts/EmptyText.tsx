import { memo } from 'react';
import { cn } from '~/utils';
import ThinkingLabel from '../ThinkingLabel';

type EmptyTextPartProps = {
  /**
   * Aligns the status word with the size-6 message-header icon above it, as
   * inline-start padding so the axis holds when the document flips to RTL.
   * Only for placeholders rendering directly beneath the header — leading rows
   * and nested contexts (activity groups, parallel columns, mid-stream parts)
   * keep the flush default.
   */
  underHeaderIcon?: boolean;
};

/**
 * Solvane: what stands in for the reply between sending and the first token.
 *
 * Upstream shows a pulsing dot (`.result-thinking`); we show a cycling word.
 * Only the word — the two together read as a stray bullet parked in front of
 * the text. No bottom margin, to match Container's structure and avoid layout
 * shift when the real content arrives.
 */
const EmptyTextPart = memo(({ underHeaderIcon = false }: EmptyTextPartProps) => {
  return (
    <div className="text-message flex min-h-[20px] flex-col items-start gap-3 overflow-visible">
      <div className="markdown prose dark:prose-invert light w-full break-words">
        <div className={cn('flex items-center', underHeaderIcon && 'ps-1.5')}>
          <ThinkingLabel />
        </div>
      </div>
    </div>
  );
});

export default EmptyTextPart;
