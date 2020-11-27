import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import DataStore, {
  UpdateApplicationBootPreferenceInStorage,
  UpdatePomodoroStateInStorage,
  UpdatePomodoroBreakLimit,
  UpdatePomodoroWorkLimit,
} from '../../utils/electronStore';
import { SettingsType } from '../../utils/typeKeeper';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';

const Storage = DataStore();

const prepareInitialState = (): SettingsType => {
  const applicationSettings = Storage.get('settings');
  if (!applicationSettings) {
    return {
      isDrawerOpen: false,
      preferences: {
        launchAtBoot: true,
        isPomodoroEnabled: false,
        pomodoroWorkLimit: 1500,
        pomodoroBreakLimit: 300,
        pomodoroLongBreakLimit: 1500,
      },
    };
  }
  return { isDrawerOpen: false, ...applicationSettings };
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
      state.preferences.launchAtBoot = action.payload;
      UpdateApplicationBootPreferenceInStorage(action.payload);
    },
    enablePomodoroTracker: (state, action: PayloadAction<boolean>) => {
      state.preferences.isPomodoroEnabled = action.payload;
      UpdatePomodoroStateInStorage(action.payload);
    },
    setPomodoroWorkLimit: (state, action: PayloadAction<number>) => {
      state.preferences.pomodoroWorkLimit = action.payload;
      UpdatePomodoroWorkLimit(action.payload);
    },
    setPomodoroBreakLimit: (
      state,
      action: PayloadAction<{ type: 'longBreak' | 'shortBreak'; limit: number }>
    ) => {
      state.preferences[
        action.payload.type === 'longBreak'
          ? 'pomodoroLongBreakLimit'
          : 'pomodoroBreakLimit'
      ] = action.payload.limit;
      UpdatePomodoroBreakLimit(action.payload.limit, action.payload.type);
    },
  },
});

export const {
  closeSettingsDrawer,
  openSettingsDrawer,
  startApplicationAtBoot,
  enablePomodoroTracker,
  setPomodoroBreakLimit,
  setPomodoroWorkLimit,
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

export const shouldAppLaunchAtBoot = (state: RootState) =>
  state.settings.preferences.launchAtBoot;

export const isPomodoroEnabled = (state: RootState) =>
  state.settings.preferences.isPomodoroEnabled;
