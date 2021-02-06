/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { AiOutlineLoading } from 'react-icons/ai';
import routes from './constants/routes.json';
import App from './containers/App';
import HomeContainer from './containers/HomeContainer';

// Lazily load routes and code split with webpack
const LazyHistoricalAnalysisContainer = React.lazy(() =>
  import(
    /* webpackChunkName: "HistoricalAnalysisPage" */ './containers/HistoricalAnalysisContainer'
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
    <LazyHistoricalAnalysisContainer {...props} />
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
        <Route path={routes.HOME} component={HomeContainer} />
      </Switch>
    </App>
  );
}
