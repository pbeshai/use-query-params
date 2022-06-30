import {
  DecodedValueMap,
  encodeQueryParams,
  QueryParamConfigMap,
} from 'serialize-query-params';
import { decodedParamCache } from './decodedParamCache';
import { expandWithInheritedParams } from './inheritedParams';
import { getLatestDecodedValues } from './latestValues';
import { memoParseParams } from './memoParseParams';
import { QueryParamOptionsWithRequired } from './options';
import { removeDefaults } from './removeDefaults';
import { PartialLocation, QueryParamAdapter, UrlUpdateType } from './types';
import { applyUrlNames } from './urlName';

// for multiple param config
type ChangesType<DecodedValueMapType> =
  | Partial<DecodedValueMapType>
  | ((latestValues: DecodedValueMapType) => Partial<DecodedValueMapType>);

export function getUpdatedSearchString({
  changes,
  updateType,
  currentSearchString,
  paramConfigMap: baseParamConfigMap,
  options,
}: {
  changes: ChangesType<DecodedValueMap<any>>;
  currentSearchString: string;
  paramConfigMap: QueryParamConfigMap;
  options: QueryParamOptionsWithRequired;
  updateType?: UrlUpdateType;
}): string {
  const { parseParams, stringifyParams } = options;
  if (updateType == null) updateType = options.updateType;

  let encodedChanges;
  const parsedParams = memoParseParams(parseParams, currentSearchString);

  // see if we have unconfigured params in the changes that we can
  // inherit to expand our config map instead of just using strings
  const paramConfigMap = expandWithInheritedParams(
    baseParamConfigMap,
    Object.keys(changes),
    options.params
  );

  // update changes prior to encoding to handle removing defaults
  // getting latest values when functional update
  let changesToUse: Partial<DecodedValueMap<any>>;

  // functional updates here get the latest values
  if (typeof changes === 'function') {
    const latestValues = getLatestDecodedValues(
      parsedParams,
      paramConfigMap,
      decodedParamCache,
      options
    );

    changesToUse = (changes as Function)(latestValues);
  } else {
    // simple update here
    changesToUse = changes;
  }

  encodedChanges = encodeQueryParams(paramConfigMap, changesToUse);

  // remove defaults
  if (options.removeDefaultsFromUrl) {
    removeDefaults(encodedChanges, paramConfigMap);
  }

  // interpret urlNames
  encodedChanges = applyUrlNames(encodedChanges, paramConfigMap);

  let newSearchString: string;
  if (updateType === 'push' || updateType === 'replace') {
    newSearchString = stringifyParams(encodedChanges);
  } else {
    newSearchString = stringifyParams({ ...parsedParams, ...encodedChanges });
  }

  if (newSearchString?.length && newSearchString[0] !== '?') {
    (newSearchString as any) = `?${newSearchString}`;
  }

  return newSearchString ?? '';
}

export function updateSearchString({
  searchString,
  adapter,
  navigate,
  updateType,
}: {
  searchString: string;
  adapter: QueryParamAdapter;
  navigate: boolean;
  updateType?: UrlUpdateType;
}) {
  const currentLocation = adapter.location;

  // update the location and URL
  const newLocation: PartialLocation = {
    ...currentLocation,
    search: searchString,
  };

  if (navigate) {
    if (updateType?.startsWith('replace')) {
      adapter.replace(newLocation);
    } else {
      adapter.push(newLocation);
    }
  }
}

type UpdateArgs = Parameters<typeof getUpdatedSearchString>[0] & {
  adapter: QueryParamAdapter;
};

const immediateTask = (task: Function) => task();
const timeoutTask = (task: Function) => setTimeout(() => task(), 0);
// alternative could be native `queueMicrotask`

const updateQueue: UpdateArgs[] = [];
export function queueUpdate(
  args: UpdateArgs,
  { immediate }: { immediate?: boolean } = {}
) {
  updateQueue.push(args);
  let scheduleTask = immediate ? immediateTask : timeoutTask;

  if (updateQueue.length === 1) {
    scheduleTask(() => {
      const updates = updateQueue.slice();
      updateQueue.length = 0;

      let searchString: string | undefined;
      for (let i = 0; i < updates.length; ++i) {
        const modifiedUpdate: UpdateArgs =
          i === 0
            ? updates[i]
            : { ...updates[i], currentSearchString: searchString! };
        searchString = getUpdatedSearchString(modifiedUpdate);
      }

      updateSearchString({
        searchString: searchString ?? '',
        adapter: updates[updates.length - 1].adapter,
        navigate: true,
        updateType: updates[updates.length - 1].updateType,
      });
    });
  }
}
