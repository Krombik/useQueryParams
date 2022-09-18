import { useQueryParamsContext } from '../context/QueryParamsContext';
import type { AnyRecord, Errors, StringOrNever } from '../types';
import { handleState } from '../utils';

export const useGetters = <P extends AnyRecord>() => {
  const ctx = useQueryParamsContext();

  return {
    getErrors(): Errors<P> {
      return ctx._errors || {};
    },
    getState<Keys extends StringOrNever<keyof P>[]>(...keys: Keys) {
      return handleState<P, [] extends Keys ? StringOrNever<keyof P>[] : Keys>(
        keys.length ? keys : (ctx._keys as any),
        ctx._pParams as any,
        ctx._sParams
      );
    },
  };
};
