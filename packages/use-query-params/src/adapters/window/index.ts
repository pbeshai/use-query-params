// we use a lazy caching solution to prevent #46 from happening
let cachedWindowHistory: History | undefined;
let cachedAdaptedWindowHistory: PushReplaceHistory | undefined;
/**
 * Adapts standard DOM window history to work with our
 * { replace, push } interface.
 *
 * @param history Standard history provided by DOM
 */
function adaptWindowHistory(history: History): PushReplaceHistory {
  if (history === cachedWindowHistory && cachedAdaptedWindowHistory != null) {
    return cachedAdaptedWindowHistory;
  }

  const adaptedWindowHistory = {
    replace(location: Location) {
      history.replaceState(
        (location as any).state,
        '',
        `${location.protocol}//${location.host}${location.pathname}${location.search}`
      );
    },
    push(location: Location) {
      history.pushState(
        (location as any).state,
        '',
        `${location.protocol}//${location.host}${location.pathname}${location.search}`
      );
    },
    get location() {
      return window.location;
    },
  };

  cachedWindowHistory = history;
  cachedAdaptedWindowHistory = adaptedWindowHistory;

  return adaptedWindowHistory;
}
