import Store from 'electron-store';
import {
  ProcessType,
  StoreType,
  SettingsType,
  DailyProcessSessionType,
} from './typeKeeper';

const config: {
  store: Store<StoreType> | undefined;
} = {
  store: undefined,
};

export default function GetStoreInstance() {
  if (!config.store) {
    config.store = new Store();
  }
  return config.store;
}

const getStoreData = (target: 'settings' | 'dailySessions') => {
  if (!config.store?.get('settings')) {
    config.store?.set('settings', <SettingsType>{
      preferences: {
        launchAtBoot: false,
        isPomodoroEnabled: false,
      },
    });
  }
  return config.store?.get(target);
};

export const AddNewProcessToStorage = (key: string, payload: ProcessType) => {
  const oldSession = config.store?.get('dailySessions')[key];
  if (!oldSession) {
    config.store?.set(`dailySessions.${key}`, {
      processes: [payload],
      screenTime: 0,
    });
  } else {
    oldSession.processes.push(payload);
    config.store?.set(`dailySessions.${key}`, oldSession);
  }
};

export const UpdateProcessUsageTimeInStorage = (
  key: string,
  payload: { sessionIndex: number; usageTime: number }
) => {
  const oldSession = config.store?.get('dailySessions')[key];
  if (!oldSession) {
    return;
  }
  oldSession.screenTime += 1;
  oldSession.processes[payload.sessionIndex].usageTime = payload.usageTime;
  config.store?.set(`dailySessions.${key}`, oldSession);
};

export const UpdateProcessIdleTimeInStorage = (
  key: string,
  payload: { sessionIndex: number; idleTime: number }
) => {
  const oldSession = config.store?.get('dailySessions')[key];
  if (!oldSession) {
    return;
  }
  oldSession.screenTime += 1;
  oldSession.processes[payload.sessionIndex].idleTime = payload.idleTime;
  config.store?.set(`dailySessions.${key}`, oldSession);
};

export const UpdateApplicationBootPreferenceInStorage = (
  shouldLaunchAtBoot: boolean
) => {
  const oldSession = getStoreData('settings') as SettingsType;
  oldSession.preferences.launchAtBoot = shouldLaunchAtBoot;
  config.store?.set('settings', oldSession);
};

export const UpdatePomodoroStateInStorage = (isPomodoroEnabled: boolean) => {
  const oldSession = getStoreData('settings') as SettingsType;
  oldSession.preferences.isPomodoroEnabled = isPomodoroEnabled;
  config.store?.set('settings', oldSession);
};

export const UpdatePomodoroWorkLimit = (pomodoroWorkLimit: number) => {
  const oldSession = getStoreData('settings') as SettingsType;
  oldSession.preferences.pomodoroWorkLimit = pomodoroWorkLimit;
  config.store?.set('settings', oldSession);
};

export const UpdatePomodoroBreakLimit = (
  pomodoroBreakLimit: number,
  type: 'longBreak' | 'shortBreak'
) => {
  const oldSession = getStoreData('settings') as SettingsType;
  oldSession.preferences[
    type === 'longBreak' ? 'pomodoroLongBreakLimit' : 'pomodoroBreakLimit'
  ] = pomodoroBreakLimit;
  config.store?.set('settings', oldSession);
};

export const UpdatePomodoroTotalWorkTime = (
  key: string,
  isIteration: boolean,
  reset?: boolean
) => {
  const oldSession = getStoreData('dailySessions') as DailyProcessSessionType;
  oldSession[key].pomodoroTracker.work.totalTime += 1;
  if (isIteration) {
    oldSession[key].pomodoroTracker.work.iteration += 1;
    oldSession[key].pomodoroTracker.work.isActive = false;
    oldSession[key].pomodoroTracker.break.isActive = true;
    oldSession[key].pomodoroTracker.work.totalTime = 0;
  }
  if (reset) {
    oldSession[key].pomodoroTracker.work.totalTime = 0;
  }
  config.store?.set(`dailySessions.${key}`, oldSession[key]);
};

export const UpdatePomodoroTotalBreakTime = (
  key: string,
  isIteration: boolean,
  reset?: boolean
) => {
  const oldSession = getStoreData('dailySessions') as DailyProcessSessionType;
  oldSession[key].pomodoroTracker.break.totalTime += 1;
  if (isIteration) {
    oldSession[key].pomodoroTracker.break.iteration += 1;
    oldSession[key].pomodoroTracker.work.isActive = true;
    oldSession[key].pomodoroTracker.break.isActive = false;
    oldSession[key].pomodoroTracker.break.totalTime = 0;
  }
  if (reset) {
    oldSession[key].pomodoroTracker.break.totalTime = 0;
  }
  config.store?.set(`dailySessions.${key}`, oldSession[key]);
};
