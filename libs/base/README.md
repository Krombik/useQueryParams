# @use-query-params/base

> Note: This library requires React v16.8 or later.

Library for convenient work with query parameters.

### Why you should use this library?

- Possibility to define scheme of query parameters for one time
- Watch for only needed params
- Don't provoke extra rerenders
- Parsing params only once for each route changing
- Strong typing for each method, so you don't need to care about it

## Example

[react-router@5 example](https://www.npmjs.com/package/@use-query-params/react-router-5-adapter#example)

[react-router@6 example](https://www.npmjs.com/package/@use-query-params/react-router-6-adapter#example)

## Api

- [Providers](#providers)
  - [QueryParamsGlobalProvider](#queryparamsglobalprovider)
  - [QueryParamsProvider](#queryparamsprovider)
- [hooks](#hooks)
  - [useQueryParams](#usequeryparams)
  - [useSetQueryParams](#usesetqueryparams)
  - [useOnQueryParamsChanged](#useonqueryparamschanged)
  - [useGetters](#usegetters)
  - [useErrors](#useerrors)
- [Schema](#schema)
- [Converter](#converter)
  - [stringConverter](#stringconverter)
  - [numberConverter](#numberconverter)
  - [booleanConverter](#booleanconverter)
  - [getArrayConverter](#getarrayconverter)
  - [getOneOfConverter](#getoneofconverter)
- [utils](#utils)
  - [stringifyParams](#stringifyparams)
  - [stringifyUrl](#stringifyurl)

## Providers

### QueryParamsGlobalProvider

```ts
type QueryParamsGlobalProviderProps<H> = {
  adapter: Adapter<H>;
};

const QueryParamsGlobalProvider: <H extends unknown>({
  children,
  adapter,
}: React.PropsWithChildren<QueryParamsGlobalProviderProps<H>>) => JSX.Element;
```

Main provider, should be after `Router` component, see example

---

### QueryParamsProvider

```ts
type QueryParamsProviderProps<P extends {}> = {
  schema: Schema<P>;
  renderIfError?: (
    errors: Errors<P>,
    correctValues: QueryParamsState<Partial<P>>
  ) => JSX.Element;
};

const QueryParamsProvider: <P extends {}>({
  children,
  renderIfError,
  schema,
}: React.PropsWithChildren<QueryParamsProviderProps<P>>) => JSX.Element;
```

| Name             | Description                                                                                       |
| :--------------- | :------------------------------------------------------------------------------------------------ |
| `schema`         | [schema](#schema) of query parameters                                                             |
| `renderIfError?` | if provided, renders this instead of children if some of the parameters were parsed with an error |

> Note: it's better to use only one `QueryParamProvider` per route, but not necessary

---

## hooks

### useQueryParams

```ts
const useQueryParams: <P extends {}, Keys extends (keyof P)[]>(
  ...keys: Keys
) => QueryParamsState<P, [] extends Keys ? keyof P : ValueOf<Keys>>;
```

Only watched the change of the specified `keys`, if no `keys` were provided, watched for all parameters presented in the [schema](#queryparamsprovider)

---

### useSetQueryParams

```ts
type SetQueryPramsOptions = {
  message?: any;
  replace?: boolean;
};

type SetQueryPrams<P extends {}> = <T extends {}>(
  params: PartOf<P, T>,
  options?: SetQueryPramsOptions
) => void;

const useSetQueryParams: <P extends {}>() => SetQueryPrams<P>;
```

#### setQueryPrams

| Name     | Description                          |
| :------- | :----------------------------------- |
| `params` | params to merge with previous params |

#### SetQueryPramsOptions

| Name       | Description                                                                                                                                                                                                             | Default |
| :--------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `message?` | message to [onQueryParamsChanged](#onparamschanged)                                                                                                                                                                     |         |
| `replace?` | if `true` - execute [replace](https://github.com/remix-run/history/blob/dev/docs/api-reference.md#history.replace), overwise - [push](https://github.com/remix-run/history/blob/dev/docs/api-reference.md#history.push) | `false` |

---

### useOnQueryParamsChanged

```ts
type OnQueryParamsChanged<P extends {}, Keys extends (keyof P)[]> = (
  state: QueryParamsState<P, [] extends Keys ? keyof P : ValueOf<Keys>>,
  updatedKeys: ([] extends Keys ? keyof P : ValueOf<Keys>)[],
  message?: any
) => void;

const useOnQueryParamsChanged: {
  <P extends {}, Keys extends (keyof P)[]>(
    keys: Keys,
    onParamsChanged: OnQueryParamsChanged<P, Keys>,
    deps?: React.DependencyList
  ): void;
  <P extends {}>(
    onParamsChanged: OnQueryParamsChanged<P, []>,
    deps?: React.DependencyList
  ): void;
};
```

| Name              | Description                                                                                                                                                     |
| :---------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keys`            | keys to watch                                                                                                                                                   |
| `onParamsChanged` | callback that is executed after any `key` from `keys` (or all params from [schema](#queryparamsprovider) if no `keys` was provided), query parameter is changed |
| `deps`            | same to `deps` from [useEffect](https://reactjs.org/docs/hooks-reference.html#conditionally-firing-an-effect)                                                   |

#### onParamsChanged

| Name          | Description                                                                             |
| :------------ | :-------------------------------------------------------------------------------------- |
| `state`       | current state of query params                                                           |
| `updatedKeys` | list of updated keys                                                                    |
| `message`     | message from [setQueryParams](#setqueryprams) or `undefined` if it changed by other way |

---

### useGetters

```ts
const useGetters: <P extends {}>() => {
  getErrors(): Errors<P>;
  getState<Keys extends (keyof P)[]>(
    ...keys: Keys
  ): QueryParamsState<P, [] extends Keys ? keyof P : ValueOf<Keys>;
};
```

> Note: this hook don't trigger rerenders

---

### useErrors

```ts
const useErrors: <P extends {}>() => Errors<P>;
```

---

## Schema

```ts
type SchemaItem<T = unknown> = {
  converter: Converter<NonNullable<T>>;
} & (null extends Extract<T, null>
  ? { nullable: true }
  : { nullable?: false }) &
  (undefined extends Extract<T, undefined>
    ? { required?: false }
    : { required?: false; defaultValue: T | (() => T) } | { required: true });

type Schema<P extends {}> = {
  [key in keyof P]: SchemaItem<P[key]>;
};
```

Schema - an object with rules for each query parameter, parameters which not provided in schema will be ignored

Example:

```ts
type Params = {
  q: string | null;
  name?: string;
  distance: number;
};

const schema: Schema<Params> = {
  q: { converter: stringConverter, required: true, nullable: true },
  name: { converter: stringConverter },
  distance: { converter: numberConverter, defaultValue: 1 },
};
```

## Converter

```ts
type Converter<T> = {
  serialize(value: T): string | undefined;
  parse(value: string): T | undefined;
};
```

Custom date converter example:

```ts
import { Converter } from '@use-query-params/base';
import format from 'date-fns/format';
import isValid from 'date-fns/isValid';
import parse from 'date-fns/parse';

const DATE_FORMAT = 'yyyyMMdd';

const dateConverter: Converter<Date> = {
  serialize: (date) => format(date, DATE_FORMAT),
  parse(str) {
    if (str) {
      const date = parse(str, DATE_FORMAT, new Date());

      if (isValid(date)) {
        return date;
      }

      throw new Error('invalid date');
    }
  },
};
```

### stringConverter

```ts
const stringConverter: Converter<string>;
```

> Note: it skips empty string

---

### numberConverter

```ts
const numberConverter: Converter<number>;
```

throws error if parsed value is `NaN`

---

### booleanConverter

```ts
const booleanConverter: Converter<boolean>;
```

---

### getArrayConverter

```ts
const getArrayConverter: <T>(
  itemConverter: Converter<T>,
  separator?: string
) => Converter<T[]>;
```

| Name            | Description                      | Default |
| :-------------- | :------------------------------- | ------- |
| `itemConverter` | converter for each item of array |         |
| `separator?`    | array separator                  | `','`   |

```ts
const numberArrayConverter = getArrayConverter(numberConverter);
```

---

### getOneOfConverter

```ts
const getOneOfConverter: <T extends {} | []>(
  generalConverter: Converter<Generalize<ValueOf<T>>>,
  possibleValues: T
) => Converter<ValueOf<T>>;
```

| Name               | Description                           |
| :----------------- | :------------------------------------ |
| `generalConverter` | converter to get general type first   |
| `possibleValues`   | array or enum-like of possible values |

```ts
enum Rating {
  BAD,
  NORMAL,
  GOOD,
  EXCELLENT,
}

const ratingConverter = getOneOfConverter(numberConverter, Rating);

const sortConverter = getOneOfConverter(stringConverter, {
  price: 'price',
  rating: 'rating',
  star: 'star',
} as const);

const starConverter = getOneOfConverter(numberConverter, [
  1, 2, 3, 4, 5,
] as const);
```

---

## utils

### stringifyParams

```ts
type StringifyParamsOptions = {
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

const stringifyParams: (
  params: PrimitiveRecord,
  options?: StringifyParamsOptions
) => string;
```

transforms given `params` to query string

---

### stringifyUrl

```ts
const stringifyUrl: (
  url: string,
  params: PrimitiveRecord,
  options?: StringifyParamsOptions
) => string;
```

transforms given `url` and `params` to url with query string

```ts
stringifyUrl('/foo', { c: 1, a: 2, b: 3 }); // /foo?c=1&a=true&b=3

stringifyUrl('/foo?bar=1#asd', { c: 1, a: 2, b: 3 }); // /foo?bar=1&c=1&a=2&b=3#asd

stringifyUrl('/foo?bar=1#asd', { c: 1, a: 2, b: [1, 2, 3] }, { sort: true }); // /foo?a=2&b=1%2C2%2C3&bar=1&c=1#asd
```

---

## License

MIT © [Krombik](https://github.com/Krombik)
