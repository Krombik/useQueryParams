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
} from '@use-search-params/base';

import {
  BrowserRouter,
  Route,
  Routes,
  Link,
  useParams,
} from 'react-router-dom';
import reactRouter6Adapter from '@use-search-params/react-router-6-adapter';

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
    <QueryParamsGlobalProvider adapter={reactRouter6Adapter}>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/:id' element={<IdPage />} />
      </Routes>
    </QueryParamsGlobalProvider>
  </BrowserRouter>
);

export default App;
