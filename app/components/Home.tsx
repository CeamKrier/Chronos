import React, { useEffect, useCallback, useMemo } from 'react';
// import { Link } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { useDispatch } from 'react-redux';
import { observeProcess } from '../features/observer/observerSlice';
import { Process } from '../utils/typeKeeper';
// import routes from '../constants/routes.json';
import styles from './Home.css';
import ProcessList from './ProcessList';
import SummaryHeader, { StartObserver, StopObserver } from './SummaryHeader';

export default function Home(): JSX.Element {
  const dispatch = useDispatch();

  const handleProcess = useCallback(
    (_, data: Process) => {
      dispatch(observeProcess(data));
    },
    [dispatch]
  );

  useEffect(() => {
    StartObserver();
    return StopObserver;
  }, []);

  useEffect(() => {
    ipcRenderer.on('activeProcess', handleProcess);
    return () => {
      ipcRenderer.removeListener('activeProcess', handleProcess);
    };
  }, [handleProcess]);

  const renderProcessList = useMemo(() => <ProcessList />, []);

  const renderSummaryHeader = useMemo(() => <SummaryHeader />, []);

  return (
    <div className={styles.container} data-tid="container">
      {renderSummaryHeader}
      {/* <Link to={routes.COUNTER}>to Counter</Link> */}
      {renderProcessList}
    </div>
  );
}
