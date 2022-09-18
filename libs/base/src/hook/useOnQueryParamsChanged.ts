import { useLayoutEffect, useMemo } from 'react';
import { isFunction } from '../utils';
import { useQueryParamsContext } from '../context/QueryParamsContext';
import type {
  AnyRecord,
  StringOrNever,
  QueryParamsState,
  ValueOf,
} from '../types';

export type OnQueryParamsChanged<
  P extends AnyRecord,
  Keys extends StringOrNever<keyof P>[]
> = {
  /**
   * @param state - current state of query params
   * @param updatedKeys - list of updated keys
   * @param message - message from `setQueryParams` or undefined if it changed by other way
   */
  (
    state: QueryParamsState<
      P,
      StringOrNever<[] extends Keys ? keyof P : ValueOf<Keys>>
    >,
    updatedKeys: StringOrNever<[] extends Keys ? keyof P : ValueOf<Keys>>[],
    message?: any
  ): void;
};

export const useOnQueryParamsChanged: {
  /**
   * @param keys - keys to watch
   * @param onParamsChanged - callback that is executed after any of {@link keys} is changed
   * @param deps - similar to {@link React.useEffect useEffect} deps param
   */
  <P extends AnyRecord, Keys extends StringOrNever<keyof P>[]>(
    keys: Keys,
    onParamsChanged: OnQueryParamsChanged<P, Keys>,
    deps?: React.DependencyList
  ): void;
  /**
   * @param onParamsChanged - callback that is executed after any (which was provided in `schema`) query parameter is changed
   * @param deps - similar to {@link React.useEffect useEffect} deps param
   */
  <P extends AnyRecord>(
    onParamsChanged: OnQueryParamsChanged<P, []>,
    deps?: React.DependencyList
  ): void;
} = (
  arg1: string[] | OnQueryParamsChanged<AnyRecord, string[]>,
  arg2?: OnQueryParamsChanged<AnyRecord, string[]> | React.DependencyList,
  arg3?: React.DependencyList
) => {
  const isWithKeys = !isFunction(arg1);

  const deps = isWithKeys ? arg3 : (arg2 as React.DependencyList | undefined);

  const ctx = useQueryParamsContext();

  let unregister: () => void;

  useMemo(() => {
    let onParamsChanged: OnQueryParamsChanged<AnyRecord, string[]>;

    let keys: string[];

    if (isWithKeys) {
      keys = arg1;

      onParamsChanged = arg2 as OnQueryParamsChanged<AnyRecord, string[]>;
    } else {
      keys = [];

      onParamsChanged = arg1;
    }

    const t: ReturnType<typeof ctx['_register']> = ctx._register(keys, () =>
      onParamsChanged(getValue(), ctx._updatedKeys, ctx._message)
    );

    unregister = t[0];

    const getValue = t[1];
  }, deps);

  useLayoutEffect(() => unregister, deps);
};
