import { useLayoutEffect, useState } from 'react';
import { useQueryParamsContext } from '../context/QueryParamsContext';
import type { AnyRecord, StringOrNever } from '../types';
import { useConst } from '../utils';

/**
 * @param keys - keys to watch, if no keys was provided, it watch to all keys, which was provided in `schema`
 */
export const useQueryParams = <
  P extends AnyRecord,
  Keys extends StringOrNever<keyof P>[]
>(
  ...keys: Keys
) => {
  const ctx = useQueryParamsContext<P>();

  const s = useState<{}>();

  let unregister: () => void;

  useLayoutEffect(() => unregister, []);

  return useConst(() => {
    let timestamp: number;

    const forceUpdate = s[1];

    const t = ctx._register(keys, () => {
      if (timestamp < ctx._timestamp!) {
        forceUpdate({});
      }
    });

    unregister = t[0];

    const getValue = t[1];

    return () => {
      timestamp = Date.now();

      return getValue();
    };
  })();
};
