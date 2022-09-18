import { useGlobalCtx } from '../context/QueryParamsGlobalContext';
import { useQueryParamsContext } from '../context/QueryParamsContext';
import type { AnyRecord, StringOrNever, PartOf } from '../types';
import { handleParamsUpdate, isFunction } from '../utils';

export type SetQueryPramsOptions = {
  /**
   * message to `onQueryParamsChanged`
   */
  message?: any;
  /**
   * if `true` - execute [replace](https://github.com/remix-run/history/blob/dev/docs/api-reference.md#history.replace), overwise - [push](https://github.com/remix-run/history/blob/dev/docs/api-reference.md#history.push)
   */
  replace?: boolean;
};

export type SetQueryPrams<P extends {}> = {
  /** @param params - parameters to change, parameters that are not present will not be changed */
  <T extends {}>(params: PartOf<P, T>, options?: SetQueryPramsOptions): void;
};

export const useSetQueryParams = <P extends AnyRecord>(): SetQueryPrams<P> => {
  const globalCtx = useGlobalCtx();

  const ctx = useQueryParamsContext<P>();

  return (params, options = {}) => {
    type Key = StringOrNever<keyof P>;

    const { _pParams, _sParams, _schema } = ctx;

    const keys = Object.keys(params) as Key[];

    const updatedKeys: Key[] = [];

    const updateValue = (key: Key, value: any) => {
      updatedKeys.push(key);

      _pParams.set(key, value);
    };

    const fn = (key: Key) => {
      const value = params[key];

      const curr = _schema[key];

      const serializedValue =
        value !== undefined && curr.converter.serialize(value as any);

      if (serializedValue || serializedValue === '') {
        if (serializedValue !== _sParams.get(key)) {
          _sParams.set(key, serializedValue);

          updateValue(key, value);
        }
      } else {
        if (curr.required) {
          throw new Error(`${key} is required`);
        }

        if (_sParams.has(key)) {
          const { defaultValue } = curr;

          if (defaultValue === undefined) {
            updateValue(key, value);
          } else {
            const value = isFunction(defaultValue)
              ? defaultValue()
              : defaultValue;

            if (curr.converter.serialize(value) !== _sParams.get(key)) {
              updateValue(key, value);
            }
          }

          _sParams.delete(key);
        }
      }
    };

    for (let i = 0; i < keys.length; i++) {
      fn(keys[i]);
    }

    if (updatedKeys.length) {
      ctx._message = options.message;

      handleParamsUpdate(updatedKeys, ctx);

      globalCtx[options.replace ? '_replace' : '_push'](_sParams.toString());
    }
  };
};
