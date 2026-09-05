import { memo } from 'react';
import { cn } from '~/utils';
import ThinkingLabel from '../ThinkingLabel';

type EmptyTextPartProps = {
  /**
   * Centers the 12px dot (style.css `.result-thinking`) on the axis of the
   * size-6 message-header icon above it: (24 − 12) / 2, as inline-start
   * padding so the axis holds when the document flips to RTL. Only for
   * placeholders rendering directly beneath the header — leading rows and
   * nested contexts (activity groups, parallel columns, mid-stream parts)
   * keep the flush default.
   */
  underHeaderIcon?: boolean;
};

/** Streaming cursor placeholder — no bottom margin to match Container's structure and prevent CLS */
const EmptyTextPart = memo(({ underHeaderIcon = false }: EmptyTextPartProps) => {
  return (
    <div className="text-message flex min-h-[20px] flex-col items-start gap-3 overflow-visible">
      <div className="markdown prose dark:prose-invert light w-full break-words">
        {/* Solvane: hold the reply's place with a word, not a dot. */}
        <div className={cn('flex items-center gap-2', underHeaderIcon && 'ps-1.5')}>
          <p className="submitting relative m-0">
            <span className="result-thinking" />
          </p>
          <ThinkingLabel />
        </div>
      </div>
    </div>
  );
});

export default EmptyTextPart;
