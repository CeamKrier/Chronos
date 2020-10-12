import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';
import {
  isDrawerOpen,
  ToggleDrawerVisibility,
  startApplicationAtBoot,
  shouldAppLaunchAtBoot,
} from '../features/settings/settingsSlice';
import CSS from './SettingsDrawer.css';

type SettingKinds = 'LaunchSetting' | 'AlarmSetting';

export default function SettingsDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector(isDrawerOpen);
  const launchAtBoot = useSelector(shouldAppLaunchAtBoot);

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
        case 'AlarmSetting':
          // console.log(event.target.checked);
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
            <span>Enable screen-time limit</span>
            <input
              type="checkbox"
              id="screenTimeLimit"
              onChange={handleLaunchStartupPreference('AlarmSetting')}
            />
            <label htmlFor="screenTimeLimit">Screen Time Limit</label>
          </div>
        </div>
      </div>
    </div>
  );
}
