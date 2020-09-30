import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  isDrawerOpen,
  ToggleDrawerVisibility,
} from '../features/settings/settingsSlice';
import CSS from './SettingsDrawer.css';

export default function SettingsDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector(isDrawerOpen);

  const handleSettingsPanelVisibilityViaClick = useCallback(() => {
    dispatch(ToggleDrawerVisibility());
  }, [dispatch]);

  // const handleSettingsPanelVisibilityViaKey = useCallback(
  //   (e) => {
  //     if (e.keyCode === 32) {
  //       handleSettingsPanelVisibilityViaClick();
  //     }
  //   },
  //   [handleSettingsPanelVisibilityViaClick]
  // );

  const handlePanelMenuItemClick = useCallback((e) => {
    // Prevent the parent's click event to get triggered
    e.stopPropagation();
    // Rest of the menu item click logic
  }, []);

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
        Hello
      </div>
    </div>
  );
}
