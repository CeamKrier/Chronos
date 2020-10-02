import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import DataStore, {
  UpdateApplicationBootPreferenceInStorage,
} from '../../utils/electronStore';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';

const Storage = DataStore();

const prepareInitialState = () => {
  const applicationSettings = Storage.get('settings');
  if (applicationSettings) {
    return { isDrawerOpen: false, preferences: { ...applicationSettings } };
  }
  return {
    isDrawerOpen: false,
    preferences: {
      launchAppOnBoot: true,
      alertInfo: {
        enabled: false,
        limit: 0,
      },
    },
  };
};

const SettingsSlice = createSlice({
  name: 'settings',
  initialState: prepareInitialState(),
  reducers: {
    openSettingsDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeSettingsDrawer: (state) => {
      state.isDrawerOpen = false;
    },
    startApplicationAtBoot: (state, action: PayloadAction<boolean>) => {
      state.preferences.launchAppOnBoot = action.payload;
      UpdateApplicationBootPreferenceInStorage(action.payload);
    },
  },
});

export const {
  closeSettingsDrawer,
  openSettingsDrawer,
  startApplicationAtBoot,
} = SettingsSlice.actions;

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
