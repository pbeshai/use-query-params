import { createLocationWithChanges, updateUrlQuery } from '../updateUrlQuery';
import {
  makeMockHistory,
  makeMockLocation,
  calledPushQuery,
  calledReplaceQuery,
} from './helpers';
import { UrlUpdateType } from '../types';
import { describe, it, vi, test } from 'vitest';

describe.skip('createLocationWithChanges and updateUrlQuery', () => {
  function getAndUpdateLocation(
    queryReplacements,
    location,
    history,
    updateType: UrlUpdateType = 'replaceIn'
  ) {
    const newLocation = createLocationWithChanges(
      queryReplacements,
      location,
      updateType
    );
    updateUrlQuery(history, newLocation, updateType);
  }

  it('replaceIn', () => {
    const history = makeMockHistory();
    // test updating existing query param
    getAndUpdateLocation(
      { foo: '123', emp: '', nul: null, und: undefined },
      makeMockLocation({
        foo: '521',
        bar: 'zzz',
        emp: 'emp',
        nul: 'nul',
        und: 'und',
      }),
      history,
      'replaceIn'
    );

    expect(history.push).not.toBeCalled();
    expect(history.replace).toBeCalled();
    expect(calledReplaceQuery(history, 0)).toEqual({
      foo: '123',
      bar: 'zzz',
      emp: '',
      nul: null,
      // und is removed
    });

    // test when no query params
    getAndUpdateLocation(
      { foo: '123' },
      makeMockLocation({}),
      history,
      'replaceIn'
    );
    expect(calledReplaceQuery(history, 1)).toEqual({
      foo: '123',
    });

    // test when removing query params
    getAndUpdateLocation(
      { foo: undefined },
      makeMockLocation({ foo: '123', bar: 'zzz' }),
      history,
      'replaceIn'
    );
    expect(calledReplaceQuery(history, 2)).toEqual({
      bar: 'zzz',
    });
  });

  it('pushIn', () => {
    const history = makeMockHistory();
    // test updating existing query param
    getAndUpdateLocation(
      { foo: '123' },
      makeMockLocation({ foo: '521', bar: 'zzz' }),
      history,
      'pushIn'
    );

    expect(history.replace).not.toBeCalled();
    expect(history.push).toBeCalled();
    expect(calledPushQuery(history, 0)).toEqual({
      foo: '123',
      bar: 'zzz',
    });

    // test when no query params
    getAndUpdateLocation(
      { foo: '123' },
      makeMockLocation({}),
      history,
      'pushIn'
    );
    expect(calledPushQuery(history, 1)).toEqual({
      foo: '123',
    });

    // test when removing query params
    getAndUpdateLocation(
      { foo: undefined },
      makeMockLocation({ foo: '123', bar: 'zzz' }),
      history,
      'pushIn'
    );
    expect(calledPushQuery(history, 2)).toEqual({
      bar: 'zzz',
    });
  });

  it('replace', () => {
    const history = makeMockHistory();
    // test updating existing query param
    getAndUpdateLocation(
      { foo: '123' },
      makeMockLocation({ foo: '521', bar: 'zzz' }),
      history,
      'replace'
    );

    expect(history.push).not.toBeCalled();
    expect(history.replace).toBeCalled();
    expect(calledReplaceQuery(history, 0)).toEqual({
      foo: '123',
    });

    // test when no query params
    getAndUpdateLocation(
      { foo: '123' },
      makeMockLocation({}),
      history,
      'replace'
    );
    expect(calledReplaceQuery(history, 1)).toEqual({
      foo: '123',
    });
  });

  it('push', () => {
    const history = makeMockHistory();
    // test updating existing query param
    getAndUpdateLocation(
      { foo: '123' },
      makeMockLocation({ foo: '521', bar: 'zzz' }),
      history,
      'push'
    );

    expect(history.replace).not.toBeCalled();
    expect(history.push).toBeCalled();
    expect(calledPushQuery(history, 0)).toEqual({
      foo: '123',
    });

    // test when no query params
    getAndUpdateLocation({ foo: '123' }, makeMockLocation({}), history, 'push');
    expect(calledPushQuery(history, 1)).toEqual({
      foo: '123',
    });
  });
});
