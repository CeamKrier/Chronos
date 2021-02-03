import React, { useEffect, useCallback, useMemo } from 'react';
// import { Link } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { useDispatch } from 'react-redux';

import ProcessList from '../../components/ProcessList';
import SummaryHeader, {
  StartObserver,
  StopObserver,
} from '../../components/SummaryHeader';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import SettingsDrawer from '../../components/SettingsDrawer';
import Footer from '../../components/Footer';

import { observeProcess } from '../../features/observer/observerSlice';
import { ProcessType } from '../../utils/typeKeeper';

import CSS from './Home.css';

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

  const renderConfirmationDialog = useMemo(() => <ConfirmationDialog />, []);

  const renderSummaryHeader = useMemo(() => <SummaryHeader />, []);

  const renderSettingsDrawer = useMemo(() => <SettingsDrawer />, []);

  const renderFooter = useMemo(() => <Footer />, []);

  return (
    <div className={CSS.container}>
      {renderConfirmationDialog}
      {renderSummaryHeader}
      {renderSettingsDrawer}
      {renderProcessList}
      {renderFooter}
    </div>
  );
}
