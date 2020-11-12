import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';
import {
  isDrawerOpen,
  ToggleDrawerVisibility,
  startApplicationAtBoot,
  shouldAppLaunchAtBoot,
  enablePomodoroTracker,
  isPomodoroEnabled,
} from '../features/settings/settingsSlice';
import {
  setPomodoroBreakLimit,
  setPomodoroWorkLimit,
  pomodoroLongBreakLimit,
  pomodoroShortBreakLimit,
  pomodoroWorkLimit,
} from '../features/observer/observerSlice';

import { debounce } from '../helpers/eventHelper';

import CSS from './SettingsDrawer.css';

type SettingKinds = 'LaunchSetting' | 'PomodoroSetting';

export default function SettingsDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector(isDrawerOpen);
  const launchAtBoot = useSelector(shouldAppLaunchAtBoot);
  const pomodoroEnabled = useSelector(isPomodoroEnabled);

  const pmdrWorkLimit = useSelector(pomodoroWorkLimit);
  const pmdrShortBreakLimit = useSelector(pomodoroShortBreakLimit);
  const pmdrLongBreakLimit = useSelector(pomodoroLongBreakLimit);

  const handleSettingsPanelVisibilityViaClick = useCallback(() => {
    dispatch(ToggleDrawerVisibility());
  }, [dispatch]);

  const handlePanelMenuItemClick = useCallback((e) => {
    // Prevent the parent's click event getting triggered
    e.stopPropagation();
    // Rest of the menu item click logic
  }, []);

  const handleLaunchStartupPreference = useCallback(
    (target: SettingKinds) => (event: React.ChangeEvent<HTMLInputElement>) => {
      switch (target) {
        case 'PomodoroSetting':
          dispatch(enablePomodoroTracker(event.target.checked));
          break;
        case 'LaunchSetting':
          dispatch(startApplicationAtBoot(event.target.checked));
          ipcRenderer.send('setAutoLaunchPreference', event.target.checked);
          break;
        default:
          break;
      }
    },
    [dispatch]
  );

  const handlePomodoroLimitChange = useCallback(
    (target: 'work' | 'shortBreak' | 'longBreak') => (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      if (target === 'work') {
        dispatch(setPomodoroWorkLimit(+event.target.value * 60));
      } else {
        dispatch(
          setPomodoroBreakLimit({
            limit: +event.target.value * 60,
            type: target,
          })
        );
      }
    },
    [dispatch]
  );

  return (
    // Wrapper's outer section will be toggling the visibilty state too. Does not have a role.
    // No need for focusability and keyboard event too.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className={`${CSS.settingsDrawerWrapper} ${
        isOpen ? CSS.wrapperVisible : undefined
      }`}
      onClick={handleSettingsPanelVisibilityViaClick}
    >
      {/*
          Only preventing to trigger the parent element's click event. No applicable role available.
          No need for focusability and keyboard event too.
        */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div
        className={`${CSS.settingsDrawerPanel} ${
          isOpen ? CSS.panelVisible : undefined
        }`}
        onClick={handlePanelMenuItemClick}
      >
        <div className={CSS.settingsMenuItem}>
          <div className={CSS.settingsMenuContent}>
            <span>Launch on boot</span>
            <input
              type="checkbox"
              id="appLaunch"
              onChange={handleLaunchStartupPreference('LaunchSetting')}
              defaultChecked={launchAtBoot}
            />
            <label htmlFor="appLaunch">Toggle App Launch</label>
          </div>
        </div>

        <div
          className={`${CSS.settingsMenuItem} ${CSS.disableMenuItemSeperator}`}
        >
          <div className={CSS.settingsMenuContent}>
            <span>Enable pomodoro tracker</span>
            <input
              type="checkbox"
              id="screenTimeLimit"
              onChange={handleLaunchStartupPreference('PomodoroSetting')}
              defaultChecked={pomodoroEnabled}
            />
            <label htmlFor="screenTimeLimit">Enable pomodoro tracker</label>
          </div>

          <div
            className={CSS.pomodoroSettingsWrapper}
            style={pomodoroEnabled ? { opacity: 1 } : { opacity: 0 }}
          >
            <div className={CSS.pomodoroSettingRow}>
              <div className={CSS.pomodoroSettingIndicator} />
              <div className={CSS.pomodoroSettingContent}>
                Work Duration:
                <div className={CSS.pomodoroRangeWrapper}>
                  <input
                    type="range"
                    id="workDuration"
                    min="25"
                    max="50"
                    step="5"
                    defaultValue={pmdrWorkLimit / 60}
                    onChange={debounce(handlePomodoroLimitChange('work'), 500)}
                  />
                  {`${pmdrWorkLimit / 60} min`}
                </div>
              </div>
            </div>

            <div className={CSS.pomodoroSettingRow}>
              <div className={CSS.pomodoroSettingIndicator} />
              <div className={CSS.pomodoroSettingContent}>
                Short Break Duration:
                <div className={CSS.pomodoroRangeWrapper}>
                  <input
                    type="range"
                    id="shortBreakDuration"
                    min="5"
                    max="15"
                    step="5"
                    defaultValue={pmdrShortBreakLimit / 60}
                    onChange={debounce(
                      handlePomodoroLimitChange('shortBreak'),
                      500
                    )}
                  />
                  {`${pmdrShortBreakLimit / 60} min`}
                </div>
              </div>
            </div>

            <div className={CSS.pomodoroSettingRow}>
              <div className={CSS.pomodoroSettingIndicator} />
              <div className={CSS.pomodoroSettingContent}>
                Long Break Duration:
                <div className={CSS.pomodoroRangeWrapper}>
                  <input
                    type="range"
                    id="longBreakDuration"
                    min="25"
                    max="50"
                    step="5"
                    defaultValue={pmdrLongBreakLimit / 60}
                    onChange={debounce(
                      handlePomodoroLimitChange('longBreak'),
                      500
                    )}
                  />
                  {`${pmdrLongBreakLimit / 60} min`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
