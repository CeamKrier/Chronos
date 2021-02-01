/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { AiOutlineLoading } from 'react-icons/ai';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';

// Lazily load routes and code split with webpack
const LazyHistoricalAnalysisPage = React.lazy(() =>
  import(
    /* webpackChunkName: "HistoricalAnalysisPage" */ './containers/HistoricalAnalysisPage'
  )
);

const LoaderSpinner = (
  <div className="loaderWrapper">
    <div className="loadingColumn">
      <p>Loading</p>
      <AiOutlineLoading size="2em" className="spinner" />
    </div>
  </div>
);

const HistoricalAnalysisPage = (props: Record<string, any>) => (
  <React.Suspense fallback={LoaderSpinner}>
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
