import { createContext, useContext } from 'react';
import type { AnyRecord, Errors } from '../types';

export const ErrorsContext = createContext<Errors | undefined>(undefined);

export const useErrors = <P extends AnyRecord>(): Errors<P> =>
  useContext(ErrorsContext) || {};
