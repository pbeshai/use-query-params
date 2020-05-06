import * as React from 'react';
import { extract } from 'query-string';
import shallowEqual from './shallowEqual';

export function useUpdateRefIfShallowNew<T>(
  ref: React.MutableRefObject<T>,
  newValue: T,
  isEqual: (
    objA: NonNullable<T>,
    objB: NonNullable<T>
  ) => boolean = shallowEqual
) {
  const hasNew =
    ((ref.current == null || newValue == null) && ref.current === newValue) ||
    !isEqual(ref.current as NonNullable<T>, newValue as NonNullable<T>);
  React.useEffect(() => {
    if (hasNew) {
      ref.current = newValue;
    }
  }, [ref, newValue, hasNew]);
}

export function getSSRSafeSearchString(location: Location | undefined) {
  // handle checking SSR (#13)
  if (typeof location === 'object') {
    // in browser
    if (typeof window !== 'undefined') {
      return location.search;
    } else {
      return extract(
        `${location.pathname}${location.search ? location.search : ''}`
      );
    }
  }

  return '';
}
