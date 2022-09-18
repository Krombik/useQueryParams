import React, { useLayoutEffect, useState } from 'react';
import { ErrorsContext } from '../context/ErrorContext';
import { QueryParamsContext } from '../context/QueryParamsContext';
import { useGlobalCtx } from '../context/QueryParamsGlobalContext';
import type { AnyRecord, Errors, QueryParamsState, Schema } from '../types';
import { handleParamsUpdate, handleState, useConst } from '../utils';
import { generateCtx, getErrorFilter, handleParams } from './utils';

export type QueryParamsProviderProps<P extends AnyRecord> = {
  schema: Schema<P>;
  renderIfError?: (
    errors: Errors<P>,
    correctValues: QueryParamsState<Partial<P>>
  ) => JSX.Element;
};

export const QueryParamsProvider = <P extends AnyRecord>({
  children,
  renderIfError,
  schema,
}: React.PropsWithChildren<QueryParamsProviderProps<P>>) => {
  const globalCtx = useGlobalCtx();

  const ctx = useConst(() => generateCtx(schema));

  const [errors, setErrors] = useState(ctx._errors);

  useLayoutEffect(
    () =>
      globalCtx._register((search) => {
        if (!('_message' in ctx)) {
          const updatedParams = handleParams(search, ctx);

          if (updatedParams.length) {
            handleParamsUpdate(updatedParams, ctx);
          }
        }
      }),
    []
  );

  return (
    <QueryParamsContext.Provider value={ctx}>
      {globalCtx._wrapper(
        errors && renderIfError ? (
          renderIfError(
            errors,
            handleState(
              ctx._keys.filter(getErrorFilter(errors)),
              ctx._pParams,
              ctx._sParams
            )
          )
        ) : (
          <ErrorsContext.Provider value={errors}>
            {children}
          </ErrorsContext.Provider>
        ),
        globalCtx._listen,
        ctx,
        setErrors
      )}
    </QueryParamsContext.Provider>
  );
};
