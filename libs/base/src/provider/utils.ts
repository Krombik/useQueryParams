import type {
  TQueryParamsContext,
  StoreItem,
} from '../context/QueryParamsContext';
import type { AnyRecord, Schema, StringOrNever, Errors } from '../types';
import { handleState, isFunction } from '../utils';

export const getErrorFilter = (errors: Errors) => {
  const keys = Object.keys(errors);

  return (key: string) => !keys.includes(key);
};

export const generateCtx = <P extends AnyRecord>(
  schema: Schema<P>
): TQueryParamsContext<P> => {
  type Key = StringOrNever<keyof P>;

  const sParams = new URLSearchParams(location.search);

  const pParams: TQueryParamsContext<P>['_pParams'] = new Map();

  let errors: Errors<P> | undefined;

  const fn = (key: Key) => {
    const curr = schema[key];

    if (sParams.has(key)) {
      const currSerializedValue = sParams.get(key)!;

      if (curr.nullable && currSerializedValue === 'null') {
        pParams.set(key, null);
      } else {
        try {
          const value = curr.converter.parse(currSerializedValue);

          if (value !== undefined) {
            pParams.set(key, value);
          }
        } catch (err) {
          errors = {
            ...errors,
            [key]: true,
          } as TQueryParamsContext<P>['_errors'];
        }
      }
    } else if (curr.required) {
      errors = { ...errors, [key]: true } as TQueryParamsContext<P>['_errors'];
    } else {
      const { defaultValue } = curr;

      if (defaultValue !== undefined) {
        pParams.set(
          key,
          isFunction(defaultValue) ? defaultValue() : defaultValue
        );
      }
    }
  };

  const keys = Object.keys(schema) as Key[];

  for (let i = 0; i < keys.length; i++) {
    fn(keys[i]);
  }

  const store: TQueryParamsContext<P>['_store'] = new Map();

  return {
    _keys: keys,
    _sParams: sParams,
    _pParams: pParams,
    _errors: errors,
    _schema: schema,
    _store: store,
    _updated: [],
    _updatedKeys: [],
    _register(_keys, callback) {
      let key: string;

      let sortedKeys: Key[];

      let hasKey: Set<Key>['has'] | undefined;

      if (_keys.length && _keys.length !== keys.length) {
        const keysSet = new Set(_keys);

        hasKey = keysSet.has.bind(keysSet);

        sortedKeys = keys.filter(hasKey!);

        key = sortedKeys.join(' ');
      } else {
        sortedKeys = keys;

        key = '';
      }

      let storeItem: StoreItem<Key>;

      if (store.has(key)) {
        storeItem = store.get(key)!;
      } else {
        storeItem = [
          hasKey,
          handleState(sortedKeys, pParams, sParams),
          new Set(),
        ];

        store.set(key, storeItem);
      }

      const callbacks = storeItem[2];

      callbacks.add(callback);

      return [
        () => {
          callbacks.delete(callback);

          if (!callbacks.size) {
            store.delete(key);
          }
        },
        () => storeItem[1],
      ];
    },
  };
};

export const handleParams = <P extends AnyRecord>(
  search: string,
  ctx: TQueryParamsContext<P>
) => {
  type Key = StringOrNever<keyof P>;

  const { _pParams, _schema, _keys } = ctx;

  let errors: TQueryParamsContext<P>['_errors'] | undefined;

  const currSerializedParams = new URLSearchParams(search);

  const prevSerializedParams = ctx._sParams;

  ctx._sParams = currSerializedParams;

  const updatedKeys: StringOrNever<keyof P>[] = [];

  const updateValue = (key: Key, parsedValue: any) => {
    if (parsedValue !== undefined) {
      _pParams.set(key, parsedValue);
    } else {
      _pParams.delete(key);
    }

    updatedKeys.push(key);
  };

  const fn = (key: Key) => {
    const curr = _schema[key];

    if (currSerializedParams.has(key)) {
      const currSerializedValue = currSerializedParams.get(key);

      if (currSerializedValue !== prevSerializedParams.get(key)) {
        let value: any;

        if (curr.nullable && currSerializedValue === 'null') {
          value = null;
        } else {
          try {
            value = curr.converter.parse(currSerializedValue!);
          } catch (err) {
            errors = {
              ...errors,
              [key]: true,
            } as TQueryParamsContext<P>['_errors'];
          }
        }

        updateValue(key, value);
      }
    } else if (curr.required) {
      errors = { ...errors, [key]: true } as TQueryParamsContext<P>['_errors'];

      updateValue(key, undefined);
    } else if (prevSerializedParams.has(key)) {
      const { defaultValue } = curr;

      if (defaultValue === undefined) {
        updateValue(key, undefined);
      } else {
        const value = isFunction(defaultValue) ? defaultValue() : defaultValue;

        if (curr.converter.serialize(value) !== prevSerializedParams.get(key)) {
          updateValue(key, value);
        }
      }
    }
  };

  for (let i = 0; i < _keys.length; i++) {
    fn(_keys[i]);
  }

  ctx._errors = errors;

  return updatedKeys;
};
