import React, { useEffect, useCallback, useMemo } from 'react';
// import { Link } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { useDispatch } from 'react-redux';
import { observeProcess } from '../features/observer/observerSlice';
import { ProcessType } from '../utils/typeKeeper';
// import routes from '../constants/routes.json';
import ProcessList from './ProcessList';
import SummaryHeader, { StartObserver, StopObserver } from './SummaryHeader';
import SettingsDrawer from './SettingsDrawer';

export default function Home(): JSX.Element {
  const dispatch = useDispatch();

  const handleProcess = useCallback(
    (_, data: ProcessType) => {
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

  const renderSettingsDrawer = useMemo(() => <SettingsDrawer />, []);

  return (
    <div data-tid="container">
      {renderSummaryHeader}
      {/* <Link to={routes.COUNTER}>to Counter</Link> */}
      {renderSettingsDrawer}
      {renderProcessList}
    </div>
  );
}
