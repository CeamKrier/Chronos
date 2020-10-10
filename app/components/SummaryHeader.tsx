import React, { useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';
import { AiOutlineSetting } from 'react-icons/ai';
import { VscDebugStart, VscDebugStop } from 'react-icons/vsc';
import {
  totalScreenTime,
  totalUsageTime,
} from '../features/observer/observerSlice';
import { ToggleDrawerVisibility } from '../features/settings/settingsSlice';
import CSS from './SummaryHeader.css';

export const StopObserver = () => {
  ipcRenderer.send('stopObserving');
};

export const StartObserver = () => {
  ipcRenderer.send('startObserving');
};

export default function SummaryHeader() {
  const dispatch = useDispatch();
  const screenTime = useSelector(totalScreenTime);
  const usageTotalTime = useSelector(totalUsageTime);
  const screenTotalTime = useSelector(totalScreenTime);

  const usagePercentage = useMemo(
    () => +((usageTotalTime / screenTotalTime) * 100).toFixed(2) || 100,
    [usageTotalTime, screenTotalTime]
  );
  const idlePercentage = useMemo(() => +(100 - usagePercentage).toFixed(2), [
    usagePercentage,
  ]);
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

  const handleSettingsPanelVisibilityViaClick = useCallback(() => {
    dispatch(ToggleDrawerVisibility());
  }, [dispatch]);

  const handleSettingsPanelVisibilityViaKey = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.keyCode === 32) {
        handleSettingsPanelVisibilityViaClick();
      }
    },
    [handleSettingsPanelVisibilityViaClick]
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
          <VscDebugStop size="2em" />
        ) : (
          <VscDebugStart size="2em" />
        )}
      </div>
      <div className={CSS.scaleBarWrapper}>
        <div className={CSS.scaleBarSectionTitleWrapper}>
          <span>Active</span>
          <div className={CSS.sessionInformationSection}>
            <span className={CSS.sessionInformationTime}>
              {new Date(screenTime * 1000).toISOString().substr(11, 8)}
            </span>
          </div>
          <span>Inactive</span>
        </div>
        <div className={CSS.processScaleBar}>
          <div
            className={CSS.processPercentage}
            style={{ width: `${usagePercentage}%` }}
          >
            {`${usagePercentage}%`}
          </div>
          <div className={CSS.processPercentagePointer} />
          <div
            className={CSS.processPercentage}
            style={{ width: `${idlePercentage}%` }}
          >
            {`${idlePercentage}%`}
          </div>
        </div>
      </div>
      <div
        className={CSS.settingsSection}
        onClick={handleSettingsPanelVisibilityViaClick}
        onKeyDown={handleSettingsPanelVisibilityViaKey}
        role="button"
        tabIndex={0}
      >
        <AiOutlineSetting size="2em" />
      </div>
    </div>
  );
}
