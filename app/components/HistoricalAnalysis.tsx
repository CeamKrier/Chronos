import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import DataStore from '../utils/electronStore';
import {} from '../features/historical/historicalSlice';

import routes from '../constants/routes.json';

import styles from './HistoricalAnalysis.css';

export default function HistoricalAnalysis() {
  const dispatch = useDispatch();
  const Storage = DataStore();

  const data = Storage.get('dailySessions');

  return (
    <div>
      <div data-tid="backButton">
        <Link to={routes.HOME}>
          <i className="fa fa-arrow-left fa-3x" />
        </Link>
      </div>
      <p>Hello from histogram page!</p>
      <p>{`Total ${Object.keys(data).length} days of session data found`}</p>
    </div>
  );
}
