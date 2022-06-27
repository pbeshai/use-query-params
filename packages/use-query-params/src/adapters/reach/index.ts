/**
 * Subset of a @reach/router history object. We only
 * care about the navigate function.
 */
interface ReachHistory {
  navigate: (
    to: string,
    options?: {
      state?: any;
      replace?: boolean;
    }
  ) => void;
  location: Location;
}

// we use a lazy caching solution to prevent #46 from happening
let cachedReachHistory: ReachHistory | undefined;
let cachedAdaptedReachHistory: PushReplaceHistory | undefined;
/**
 * Adapts @reach/router history to work with our
 * { replace, push } interface.
 *
 * @param history globalHistory from @reach/router
 */
function adaptReachHistory(history: ReachHistory): PushReplaceHistory {
  if (history === cachedReachHistory && cachedAdaptedReachHistory != null) {
    return cachedAdaptedReachHistory;
  }

  const adaptedReachHistory = {
    replace(location: Location) {
      history.navigate(
        `${location.protocol}//${location.host}${location.pathname}${location.search}`,
        { replace: true }
      );
    },
    push(location: Location) {
      history.navigate(
        `${location.protocol}//${location.host}${location.pathname}${location.search}`,
        { replace: false }
      );
    },
    get location() {
      return history.location;
    },
  };

  cachedReachHistory = history;
  cachedAdaptedReachHistory = adaptedReachHistory;

  return adaptedReachHistory;
}
