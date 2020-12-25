/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';

// Lazily load routes and code split with webpack
const LazyHistoricalAnalysisPage = React.lazy(() =>
  import(
    /* webpackChunkName: "HistoricalAnalysisPage" */ './containers/HistoricalAnalysisPage'
  )
);

const HistoricalAnalysisPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyHistoricalAnalysisPage {...props} />
  </React.Suspense>
);

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route
          path={routes.HISTORICAL_ANALYSIS}
          component={HistoricalAnalysisPage}
        />
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </App>
  );
}
