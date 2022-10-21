import { describe, it } from 'vitest';
import {
  updateLocation,
  updateInLocation,
  transformSearchStringJsonSafe,
} from '../index';
import { makeMockLocation } from './helpers';
import { parse, stringify } from 'query-string';

describe('updateLocation', () => {
  it('creates the correct search string', () => {
    const location = makeMockLocation({
      foo: 'abc',
      bar: '555',
      baz: '222',
    });
    const newLocation = updateLocation(
      {
        foo: 'xxx',
        pgb: null,
        und: undefined,
        emp: '',
      },
      location,
      stringify
    );
    expect(parse(newLocation.search)).toEqual({
      foo: 'xxx',
      pgb: null,
      emp: '',
    });
    expect((newLocation as any).key).toBeDefined();
    expect((newLocation as any).key).not.toBe((location as any).key);
    // include updated search string
    expect(newLocation.href).toBe(
      'http://localhost:3000/' + newLocation.search
    );

    // check multiple params
    expect(
      parse(updateLocation({ foo: 'a', baz: 'b' }, location, stringify).search)
    ).toEqual({ foo: 'a', baz: 'b' });
  });

  it('works with no query params', () => {
    // check updating to no params
    const location = makeMockLocation({ foo: 'abc', bar: '555' });
    const newLocation = updateLocation({}, location);
    expect(newLocation.search).toBe('');
    expect(newLocation.href).toBe('http://localhost:3000/');

    // check updating from no params
    expect(updateLocation({ foo: 'xxx' }, makeMockLocation({})).search).toBe(
      '?foo=xxx'
    );
  });

  it('handles custom stringify options', () => {
    const location = makeMockLocation({
      foo: 'one two',
      bar: '[({1,2:3:4,5})]',
    });
    const newLocation = updateLocation(
      { foo: 'o t h', bar: '[({1,2:3:6,5})]' },
      location,
      (params) => stringify(params, { encode: false })
    );
    expect(newLocation.search).toBe('?bar=[({1,2:3:6,5})]&foo=o t h');

    const newLocation2 = updateLocation(
      { foo: 'o t h', bar: '[({1,2:6:4,5})]' },
      location,
      (params) => {
        const str = stringify(params, { encode: false });
        return transformSearchStringJsonSafe(str).replace(/ /g, '%20');
      }
    );
    expect(newLocation2.search).toBe('?bar=[({1,2:6:4,5})]&foo=o%20t%20h');
  });
  it('call it twice, should not throw exception', () => {
    const location = makeMockLocation({
        foo: 'one two',
        bar: '[({1,2:3:4,5})]',
    }, false);
    const newLocationAsReturned = updateLocation(
        { foo: 'o t h', bar: '[({1,2:3:6,5})]' },
        location,
        (params) => stringify(params, { encode: false })
    );
    const newLocation2 = updateLocation(
    { foo: 'o t h', bar: '[({1,2:6:4,5})]' },
      newLocationAsReturned,
        (params) => {
            const str = stringify(params, { encode: false });
            return transformSearchStringJsonSafe(str).replace(/ /g, '%20');
        }
    );
    expect(newLocation2.search).toBe('?bar=[({1,2:6:4,5})]&foo=o%20t%20h');
  });
});

describe('updateInLocation', () => {
  it('creates the correct search string', () => {
    const location = makeMockLocation({ foo: 'abc', bar: '555', baz: '222' });
    const newLocation = updateInLocation(
      { foo: 'xxx', pgb: null, baz: undefined, bar: '' },
      location,
      stringify,
      parse
    );
    expect(parse(newLocation.search)).toEqual({
      foo: 'xxx',
      bar: '',
      pgb: null,
    });
    expect((newLocation as any).key).toBeDefined();
    expect((newLocation as any).key).not.toBe((location as any).key);

    // check multiple params
    expect(
      parse(updateInLocation({ foo: 'a', baz: 'b' }, location).search)
    ).toEqual({ foo: 'a', bar: '555', baz: 'b' });
  });

  it('works with no query params', () => {
    // check updating to no params
    const location = makeMockLocation({ foo: 'abc', bar: '555' });
    const newLocation = updateInLocation({}, location);
    expect(parse(newLocation.search)).toEqual({ foo: 'abc', bar: '555' });

    // check updating from no params
    expect(updateInLocation({ foo: 'xxx' }, makeMockLocation({})).search).toBe(
      '?foo=xxx'
    );
  });

  it('handles stringify options', () => {
    const location = makeMockLocation({
      foo: 'one two',
      bar: '[({1,2:3:4,5})]',
    });
    const newLocation = updateInLocation({ foo: 'o t h' }, location, (params) =>
      stringify(params, {
        encode: false,
      })
    );
    expect(newLocation.search).toBe('?bar=[({1,2:3:4,5})]&foo=o t h');

    const newLocation2 = updateInLocation(
      { foo: 'o t h' },
      location,
      (params) => {
        const str = stringify(params, { encode: false });
        return str.replace(/ /g, '%20');
      }
    );
    expect(newLocation2.search).toBe('?bar=[({1,2:3:4,5})]&foo=o%20t%20h');
  });
});
