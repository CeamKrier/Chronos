import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import { AiOutlineSetting } from 'react-icons/ai';
import { VscDebugStart, VscDebugStop } from 'react-icons/vsc';
import { totalScreenTime } from '../features/observer/observerSlice';
import CSS from './SummaryHeader.css';

export const StopObserver = () => {
  ipcRenderer.send('stopObserving');
};

export const StartObserver = () => {
  ipcRenderer.send('startObserving');
};

export default function SummaryHeader() {
  const screenTime = useSelector(totalScreenTime);
  const [isObserving, setObservingState] = useState(true);

  const handleObservationState = useCallback(() => {
    if (isObserving) {
      StopObserver();
      setObservingState(false);
      return;
    }
    StartObserver();
    setObservingState(true);
  }, [isObserving]);

  const handleObservationStateViaKey = useCallback(
    (e) => {
      if (e.keyCode === 32) {
        handleObservationState();
      }
    },
    [handleObservationState]
  );

  return (
    <div className={CSS.headerWrapper}>
      <div
        className={CSS.startStopSection}
        onClick={handleObservationState}
        onKeyDown={handleObservationStateViaKey}
        role="button"
        tabIndex={0}
      >
        {isObserving ? (
          <VscDebugStop size="1.5em" />
        ) : (
          <VscDebugStart size="1.5em" />
        )}
      </div>
      <div className={CSS.sessionInformationSection}>
        <span className={CSS.sessionInformationTitle}>Today`s session</span>
        <span className={CSS.sessionInformationTime}>{screenTime}</span>
      </div>
      <div className={CSS.settingsSection}>
        <AiOutlineSetting size="1.5em" />
      </div>
    </div>
  );
}
