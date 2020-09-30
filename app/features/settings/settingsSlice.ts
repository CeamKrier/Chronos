import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';

const SettingsSlice = createSlice({
  name: 'settings',
  initialState: {
    isDrawerOpen: false,
  },
  reducers: {
    openSettingsDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeSettingsDrawer: (state) => {
      state.isDrawerOpen = false;
    },
  },
});

const { closeSettingsDrawer, openSettingsDrawer } = SettingsSlice.actions;

export const ToggleDrawerVisibility = (): AppThunk => {
  return (dispatch, getState) => {
    const state = getState();
    if (state.settings.isDrawerOpen) {
      dispatch(closeSettingsDrawer());
      return;
    }
    dispatch(openSettingsDrawer());
  };
};

export default SettingsSlice.reducer;

export const isDrawerOpen = (state: RootState) => state.settings.isDrawerOpen;
