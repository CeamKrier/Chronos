import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
// eslint-disable-next-line import/no-cycle
import observerReducer from './features/observer/observerSlice';
// eslint-disable-next-line import/no-cycle
import settingsReducer from './features/settings/settingsSlice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    observer: observerReducer,
    settings: settingsReducer,
  });
}
