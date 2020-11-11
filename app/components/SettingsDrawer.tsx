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
} from '../features/observer/observerSlice';
import CSS from './SettingsDrawer.css';

type SettingKinds = 'LaunchSetting' | 'PomodoroSetting';

export default function SettingsDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector(isDrawerOpen);
  const launchAtBoot = useSelector(shouldAppLaunchAtBoot);
  const pomodoroEnabled = useSelector(isPomodoroEnabled);

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
            style={pomodoroEnabled ? {} : { display: 'none' }}
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
                    max="60"
                    step="5"
                  />
                  25 min
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
                  />
                  10 min
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
                    max="60"
                    step="5"
                  />
                  25 min
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
