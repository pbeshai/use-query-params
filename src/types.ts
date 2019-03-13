export type UrlUpdateType = 'replace' | 'replaceIn' | 'push' | 'pushIn';

export interface PushReplaceHistory {
  push: (location: Location) => void;
  replace: (location: Location) => void;
}
