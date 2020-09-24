import React, { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { useSelector, useDispatch } from 'react-redux';
import {
  observeProcess,
  allProcesses,
} from '../features/observer/observerSlice';
import { Process } from '../utils/typeKeeper';
import routes from '../constants/routes.json';
import styles from './Home.css';

export default function Home(): JSX.Element {
  const processLog = useSelector(allProcesses);
  const dispatch = useDispatch();

  const handleStopObserver = () => {
    ipcRenderer.send('stopObserving');
  };

  const handleStartObserver = () => {
    ipcRenderer.send('startObserving');
  };

  const handleProcess = useCallback(
    (_, data: Process) => {
      dispatch(observeProcess(data));
    },
    [dispatch]
  );

  useEffect(() => {
    handleStartObserver();
    return handleStopObserver;
  }, []);

  useEffect(() => {
    ipcRenderer.on('activeProcess', handleProcess);
    return () => {
      ipcRenderer.removeListener('activeProcess', handleProcess);
    };
  }, [handleProcess]);

  return (
    <div className={styles.container} data-tid="container">
      <h2>Home</h2>
      <Link to={routes.COUNTER}>to Counter</Link>
      <button type="button" onClick={handleStopObserver}>
        Stop Observing
      </button>
      <button type="button" onClick={handleStartObserver}>
        Start Observing
      </button>
      {processLog.map((process) => {
        return (
          <div key={process.windowPid}>
            <span>
              Name:
              {process.windowClass}
            </span>
            <span>
              PID:
              {process.windowPid}
            </span>
            <span>
              Usage:
              {process.usageTime}
              seconds
            </span>
            <span>
              Idle:
              {process.idleTime}
              seconds
            </span>
          </div>
        );
      })}
    </div>
  );
}
