import React, { createContext, useContext } from 'react';
import type { AnyRecord, Errors, MappedHistory, Private } from '../types';
import type { TQueryParamsContext } from './QueryParamsContext';

type ListenForUpdates<P extends AnyRecord = AnyRecord> = (
  listen: MappedHistory['listen'],
  ctx: TQueryParamsContext<P>,
  setErrors: (errors: Errors<P> | undefined) => void
) => () => void;

type Wrapper = <P extends AnyRecord>(
  children: React.ReactNode,
  ...args: Parameters<ListenForUpdates<P>>
) => React.ReactNode;

export type Adapter<H> = readonly [
  useHistory: () => H,
  mapHistory: (history: H) => MappedHistory,
  getWrapper: (listenForUpdates: ListenForUpdates) => Wrapper
];

export type TQueryParamsGlobalContext = {
  readonly _cbs: Set<(search: string) => void>;
  _register(listener: (search: string) => void): () => void;
  _wrapper: Wrapper;
} & Private<MappedHistory>;

export const QueryParamsGlobalContext =
  createContext<TQueryParamsGlobalContext>(null as any);

export const useGlobalCtx = () => useContext(QueryParamsGlobalContext);
