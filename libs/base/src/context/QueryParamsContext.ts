import { createContext, useContext } from 'react';
import type {
  AnyRecord,
  Schema,
  QueryParamsState,
  StringOrNever,
  ValueOf,
  Errors,
} from '../types';

export type TQueryParamsContext<P extends AnyRecord> = {
  _errors?: Errors<P>;
  _register<Keys extends StringOrNever<keyof P>[]>(
    keys: Keys,
    callback: () => void
  ): readonly [
    unregister: () => void,
    getValue: () => QueryParamsState<
      P,
      StringOrNever<[] extends Keys ? keyof P : ValueOf<Keys>>
    >
  ];
  readonly _schema: Schema<P>;
  readonly _keys: StringOrNever<keyof P>[];
  _updatedKeys: StringOrNever<keyof P>[];
  _updated: Array<Set<() => void>>;
  /** parsedParams */
  readonly _pParams: Map<StringOrNever<keyof P>, any>;
  /** serializedParams */
  _sParams: URLSearchParams;
  readonly _store: Map<string, StoreItem<StringOrNever<keyof P>>>;
  _message?: any;
  _timestamp?: number;
};

export type StoreItem<T extends string> = [
  hasKey: Set<T>['has'] | undefined,
  state: QueryParamsState<any, any>,
  callbacks: Set<() => void>
];

export const QueryParamsContext = createContext<
  TQueryParamsContext<Record<any, any>>
>(null as any);

export const useQueryParamsContext = <T extends AnyRecord>() =>
  useContext<TQueryParamsContext<T>>(QueryParamsContext);
