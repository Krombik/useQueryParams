# react-router-5-adapter

This is adapter for [use-query-parameters](https://www.npmjs.com/package/@use-query-params/bases)

## Install

```
npm i use-query-parameters react-router-5-adapter
```

or

```
yarn add use-query-parameters react-router-5-adapter
```

## Example

```tsx
import { FC } from 'react';

import {
  numberConverter,
  stringConverter,
  useOnQueryParamsChanged,
  useSetQueryParams,
  useQueryParams,
  QueryParamsProvider,
  QueryParamsGlobalProvider,
  stringifyUrl,
} from 'use-query-parameters';

import {
  BrowserRouter,
  Switch,
  Route,
  Link,
  useParams,
} from 'react-router-dom';

import reactRouter5Adapter from 'react-router-5-adapter';

type HomeQueryParams = {
  a?: string;
};

type IdSearchParams = {
  b: number;
};

const Home: FC = () => {
  const setQueryParams = useSetQueryParams<HomeQueryParams>();

  const { params } = useQueryParams<HomeQueryParams, ['a']>('a');

  useOnQueryParamsChanged<HomeQueryParams, ['a']>(['a'], console.log, []);

  const next = `${Math.round(Math.random() * 1000)}`;

  return (
    <>
      <button onClick={() => setQueryParams({ a: next })}>
        Set random query param from {params.a} to {next}
      </button>
      <br />
      <Link to={stringifyUrl('/1', { b: 1 })}>go to id page</Link>
    </>
  );
};

const Id: FC = () => {
  const { id } = useParams<{ id: string }>();

  const { params } = useQueryParams<IdSearchParams, ['b']>('b');

  const next = params.b + 1;

  return (
    <>
      <div>{id}</div>
      <br />
      <Link to={stringifyUrl('/2', { b: next })}>
        Set query param to {next}
      </Link>
    </>
  );
};

const IdPage: FC = () => (
  <QueryParamsProvider<IdSearchParams>
    schema={{
      b: { converter: numberConverter, required: true },
    }}
  >
    <Id />
  </QueryParamsProvider>
);

const HomePage: FC = () => (
  <QueryParamsProvider<HomeQueryParams>
    schema={{
      a: { converter: stringConverter },
    }}
  >
    <Home />
  </QueryParamsProvider>
);

const App: FC = () => (
  <BrowserRouter>
    <QueryParamsGlobalProvider adapter={reactRouter5Adapter}>
      <Switch>
        <Route path='/' exact>
          <HomePage />
        </Route>
        <Route path='/:id' exact>
          <IdPage />
        </Route>
      </Switch>
    </QueryParamsGlobalProvider>
  </BrowserRouter>
);
```

## License

MIT © [Krombik](https://github.com/Krombik)
