import React, { useLayoutEffect } from 'react';
import { useConst } from '../utils';
import { QueryParamsGlobalContext } from '../context/QueryParamsGlobalContext';
import type {
  Adapter,
  TQueryParamsGlobalContext,
} from '../context/QueryParamsGlobalContext';

export type QueryParamsGlobalProviderProps<H> = {
  adapter: Adapter<H>;
};

export const QueryParamsGlobalProvider = <H extends any>({
  children,
  adapter,
}: React.PropsWithChildren<QueryParamsGlobalProviderProps<H>>) => {
  const history = adapter[0]();

  const ctx = useConst<TQueryParamsGlobalContext>(() => {
    const _cbs: TQueryParamsGlobalContext['_cbs'] = new Set();

    const h = adapter[1](history);

    return {
      _listen: h.listen,
      _push: h.push,
      _replace: h.replace,
      _cbs,
      _register(listener) {
        _cbs.add(listener);

        return () => {
          _cbs.delete(listener);
        };
      },
      _wrapper: adapter[2]((listen, ctx, setErrors) =>
        listen(() => {
          const { _updated, _errors } = ctx;

          setErrors(_errors);

          const fn = (item: Set<() => void>) => {
            const it = item.values();

            for (let i = item.size; i--; ) {
              it.next().value();
            }
          };

          for (let i = 0; i < _updated.length; i++) {
            fn(_updated[i]);
          }

          delete ctx._message;

          ctx._updatedKeys = [];

          ctx._updated = [];
        })
      ),
    };
  });

  useLayoutEffect(
    () =>
      ctx._listen((search) => {
        const { _cbs } = ctx;

        const it = _cbs.values();

        for (let i = _cbs.size; i--; ) {
          it.next().value(search);
        }
      }),
    []
  );

  return (
    <QueryParamsGlobalContext.Provider value={ctx}>
      {children}
    </QueryParamsGlobalContext.Provider>
  );
};
