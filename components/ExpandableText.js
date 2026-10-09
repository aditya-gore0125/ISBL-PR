'use client';

import { useState } from 'react';

export default function ExpandableText({ text = '', maxLength = 260 }) {
  const [expanded, setExpanded] = useState(false);
  const shouldExpand = text.length > maxLength;
  const visibleText = expanded || !shouldExpand ? text : `${text.slice(0, maxLength).trimEnd()}...`;

  return (
    <div>
      <p>{visibleText}</p>
      {shouldExpand ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-2 text-sm font-semibold text-gold-dark"
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      ) : null}
    </div>
  );
}