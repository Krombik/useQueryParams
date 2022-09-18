import type { PrimitiveRecord } from '../types';

const handleParams = (
  params: PrimitiveRecord,
  { sort, separator = ',', skipEmptyString = true }: StringifyParamsOptions,
  search?: string
) => {
  const searchParams = new URLSearchParams(search);

  const keys = Object.keys(params);

  const fn = (key: string) => {
    let item = params[key];

    if (item && Array.isArray(item)) {
      item = item.length ? item.join(separator) : undefined;
    }

    if (item === undefined || (skipEmptyString && item === '')) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, String(item));
    }
  };

  for (let i = 0; i < keys.length; i++) {
    fn(keys[i]);
  }

  if (sort) {
    searchParams.sort();
  }

  return searchParams.toString();
};

export type StringifyParamsOptions = {
  /**
   * @default true
   */
  skipEmptyString?: boolean;
  /**
   * sort params in alphabet order
   */
  sort?: boolean;
  /**
   * array separator
   * @default ','
   */
  separator?: string;
};

export const stringifyParams = (
  params: PrimitiveRecord,
  options: StringifyParamsOptions = {}
) => handleParams(params, options);

export const stringifyUrl = (
  url: string,
  params: PrimitiveRecord,
  options: StringifyParamsOptions = {}
) => {
  const searchIndex = url.indexOf('?');
  const hashIndex = url.indexOf('#');

  let search: string | undefined;
  let path = url;
  let hash = '';

  if (searchIndex !== hashIndex) {
    if (searchIndex < 0) {
      path = url.slice(0, hashIndex);
      hash = url.slice(hashIndex);
    } else if (hashIndex < 0) {
      path = url.slice(0, searchIndex);
      search = url.slice(searchIndex);
    } else {
      path = url.slice(0, searchIndex);
      search = url.slice(searchIndex, hashIndex);
      hash = url.slice(hashIndex);
    }
  }

  search = handleParams(params, options, search);

  return `${path}${search && '?' + search}${hash}`;
};
