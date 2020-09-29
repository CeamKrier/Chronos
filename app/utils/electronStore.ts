import Store from 'electron-store';
import { ProcessType, StoreType } from './typeKeeper';

const config: {
  store: Store<StoreType> | undefined;
} = {
  store: undefined,
};

export default function () {
  if (!config.store) {
    config.store = new Store();
  }
  return config.store;
}

export const AddNewProcessToStorage = (
  key: string,
  payload: ProcessType,
  hasBeenIdle: boolean
) => {
  const oldSession = config.store?.get(key);
  if (!oldSession) {
    config.store?.set(key, {
      processes: [payload],
      screenTime: 0,
    });
  } else {
    if (hasBeenIdle) {
      oldSession.screenTime += +payload.idleTime;
    }
    oldSession.processes.push(payload);
    config.store?.set(key, oldSession);
  }
};

export const UpdateProcessUsageTimeInStorage = (
  key: string,
  payload: { sessionIndex: number; usageTime: number }
) => {
  const oldSession = config.store?.get(key);
  if (!oldSession) {
    return;
  }
  oldSession.screenTime += 1;
  oldSession.processes[payload.sessionIndex].usageTime = payload.usageTime;
  config.store?.set(key, oldSession);
};

export const UpdateProcessIdleTimeInStorage = (
  key: string,
  payload: { sessionIndex: number; idleTime: number }
) => {
  const oldSession = config.store?.get(key);
  if (!oldSession) {
    return;
  }
  oldSession.screenTime += 1;
  oldSession.processes[payload.sessionIndex].idleTime = payload.idleTime;
  config.store?.set(key, oldSession);
};
