import { useRef } from 'react';
import type {
  TQueryParamsContext,
  StoreItem,
} from '../context/QueryParamsContext';
import type {
  AnyRecord,
  StringOrNever,
  QueryParamsState,
  ValueOf,
} from '../types';

export const isFunction = (item: any): item is Function =>
  typeof item === 'function';

export const handleParamsUpdate = <P extends AnyRecord>(
  updatedKeys: StringOrNever<keyof P>[],
  ctx: TQueryParamsContext<P>
) => {
  const { _store, _pParams, _sParams, _updated } = ctx;

  const it = _store.values();

  const fn = () => {
    const data: StoreItem<StringOrNever<keyof P>> = it.next().value;

    const hasKey = data[0];

    const keys = hasKey ? updatedKeys.filter(hasKey) : updatedKeys;

    if (keys.length) {
      data[1] = handleState(keys, _pParams, _sParams, data[1]);

      _updated.push(data[2]);
    }
  };

  for (let i = _store.size; i--; ) {
    fn();
  }

  ctx._updatedKeys = updatedKeys;

  ctx._timestamp = Date.now();
};

export const useConst = <T>(getConst: () => T) => {
  const r = useRef<T>();

  return r.current || (r.current = getConst());
};

export const handleState = <
  P extends AnyRecord,
  Keys extends StringOrNever<keyof P>[]
>(
  keys: Keys,
  pParams: Map<StringOrNever<keyof P>, any>,
  sParams: URLSearchParams,
  prevState?: QueryParamsState<P, StringOrNever<ValueOf<Keys>>>
) => {
  type Key = StringOrNever<ValueOf<Keys>>;
  type _State = QueryParamsState<P, Key>;

  let params = {} as _State['params'];
  let serializedParams = {} as _State['serializedParams'];

  if (prevState) {
    params = { ...prevState.params };

    serializedParams = { ...prevState.serializedParams };
  }

  const fn = (key: Key) => {
    params[key] = pParams.get(key as any);

    serializedParams[key] = sParams.get(key) ?? (undefined as any);
  };

  for (let i = 0; i < keys.length; i++) {
    fn(keys[i] as Key);
  }

  return { params, serializedParams } as _State;
};
