import { updateUrlQuery } from '../index';
import {
  makeMockHistory,
  makeMockLocation,
  calledPushQuery,
  calledReplaceQuery,
} from './helpers';

describe('updateUrlQuery', () => {
  it('replaceIn', () => {
    const history = makeMockHistory();
    // test updating existing query param
    updateUrlQuery(
      { foo: '123' },
      makeMockLocation({ foo: '521', bar: 'zzz' }),
      history,
      'replaceIn'
    );

    expect(history.push).not.toBeCalled();
    expect(history.replace).toBeCalled();
    expect(calledReplaceQuery(history, 0)).toEqual({
      foo: '123',
      bar: 'zzz',
    });

    // test when no query params
    updateUrlQuery({ foo: '123' }, makeMockLocation({}), history, 'replaceIn');
    expect(calledReplaceQuery(history, 1)).toEqual({
      foo: '123',
    });
  });

  it('pushIn', () => {
    const history = makeMockHistory();
    // test updating existing query param
    updateUrlQuery(
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
    updateUrlQuery({ foo: '123' }, makeMockLocation({}), history, 'pushIn');
    expect(calledPushQuery(history, 1)).toEqual({
      foo: '123',
    });
  });

  it('replace', () => {
    const history = makeMockHistory();
    // test updating existing query param
    updateUrlQuery(
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
    updateUrlQuery({ foo: '123' }, makeMockLocation({}), history, 'replace');
    expect(calledReplaceQuery(history, 1)).toEqual({
      foo: '123',
    });
  });

  it('push', () => {
    const history = makeMockHistory();
    // test updating existing query param
    updateUrlQuery(
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
    updateUrlQuery({ foo: '123' }, makeMockLocation({}), history, 'push');
    expect(calledPushQuery(history, 1)).toEqual({
      foo: '123',
    });
  });
});
