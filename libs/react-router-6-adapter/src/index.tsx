import type { Adapter } from 'use-query-parameters';
import type { History } from '@remix-run/router';
import { useContext, useEffect } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';

const reactRouter6Adapter: Adapter<History> = [
  () => useContext(UNSAFE_NavigationContext).navigator as History,
  (history) => ({
    listen: (listener) => history.listen((p) => listener(p.location.search)),
    push(search) {
      history.push({ search });
    },
    replace(search) {
      history.replace({ search });
    },
  }),
  (listenForUpdates) => (children, listen, ctx, setErrors) => {
    useEffect(() => listenForUpdates(listen, ctx as any, setErrors), []);

    return children;
  },
];

export default reactRouter6Adapter;
