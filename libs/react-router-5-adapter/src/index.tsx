import type { Adapter } from 'use-query-parameters';
import type { History } from 'history';
import React from 'react';
import { useHistory } from 'react-router';

const reactRouter5Adapter: Adapter<History> = [
  useHistory,
  (history) => ({
    listen: (listener) => history.listen((p) => listener(p.search)),
    push(search) {
      history.push({ search });
    },
    replace(search) {
      history.replace({ search });
    },
  }),
  (listenForUpdates) => {
    type Params = Parameters<typeof listenForUpdates>;

    type Props = React.PropsWithChildren<{
      _listen: Params[0];
      _ctx: Params[1];
      _setErrors: Params[2];
    }>;

    class Wrapper extends React.Component<Props> {
      componentDidMount() {
        this.componentWillUnmount = listenForUpdates(
          this.props._listen,
          this.props._ctx,
          this.props._setErrors
        );
      }
      render() {
        return this.props.children;
      }
    }

    return (children, listen, ctx, setErrors) => (
      <Wrapper _listen={listen} _ctx={ctx as any} _setErrors={setErrors}>
        {children}
      </Wrapper>
    );
  },
];

export default reactRouter5Adapter;
