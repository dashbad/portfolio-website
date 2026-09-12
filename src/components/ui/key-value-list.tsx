/**
 * KeyValueList — adapted from 21st.dev "Key Value List" (@corr).
 * Rows are separated by hairlines and values wrap instead of truncating.
 */
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type KeyValueListItem = {
  label: ReactNode;
  value: ReactNode;
  description?: ReactNode;
};

export function KeyValueList({ items, className }: { items: KeyValueListItem[]; className?: string }) {
  return (
    <dl className={cn('divide-y divide-border border-y border-border text-sm', className)}>
      {items.map((item, index) => (
        <div key={index} className="grid gap-1 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="min-w-0 font-medium text-foreground">
            <div>{item.value}</div>
            {item.description ? (
              <div className="mt-1 text-xs font-normal text-muted-foreground">{item.description}</div>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default KeyValueList;
