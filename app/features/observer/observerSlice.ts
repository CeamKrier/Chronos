import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import DataStore, {
  AddNewProcessToStorage,
  UpdateProcessIdleTimeInStorage,
  UpdateProcessUsageTimeInStorage,
} from '../../utils/electronStore';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';
import { ProcessType } from '../../utils/typeKeeper';

const Storage = DataStore();
// Timezone offset in miliseconds
const timezoneOffset = new Date().getTimezoneOffset() * 60000;
const date = new Date(Date.now() - timezoneOffset).toISOString().slice(0, 10);

const prepareInitialState = () => {
  const todaysSession = Storage.get(date);
  if (todaysSession) {
    return { ...todaysSession };
  }
  return {
    screenTime: 0,
    processes: new Array<ProcessType>(),
  };
};

const capitalizeWord = (word: string) => {
  return word[0].toUpperCase() + word.slice(1);
};

const prettifyProcessName = (
  processName: string,
  os: 'macos' | 'linux' | 'windows'
) => {
  if (os === 'macos') {
    // ex: com.microsoft.VSCode
    const splittedProcess = processName.split('.');
    return splittedProcess[splittedProcess.length - 1];
  }
  if (os === 'windows') {
    // ex: chrome.exe
    return capitalizeWord(processName.split('.')[0]);
  }
  // ex: chromium
  return capitalizeWord(processName);
};

const observerSlice = createSlice({
  name: 'observer',
  initialState: prepareInitialState(),
  reducers: {
    addNewProcess: (state, action: PayloadAction<ProcessType>) => {
      let hasBeenIdle = false;
      if (action.payload.idleTime > 0) {
        state.screenTime += +action.payload.idleTime;
        hasBeenIdle = true;
      }
      action.payload.windowClass = prettifyProcessName(
        action.payload.windowClass,
        action.payload.os
      );
      // Initiate the usageTime
      action.payload.usageTime = 0;
      state.processes.push(action.payload);

      AddNewProcessToStorage(date, action.payload, hasBeenIdle);
    },
    incrementProcessUsageTimeByOneSecond: (
      state,
      action: PayloadAction<number>
    ) => {
      state.processes[action.payload].usageTime =
        +(state.processes[action.payload].usageTime || 0) + 1;
      state.screenTime += 1;

      UpdateProcessUsageTimeInStorage(date, {
        sessionIndex: action.payload,
        usageTime: state.processes[action.payload].usageTime,
      });
    },
    incrementProcessIdleTimeByOneSecond: (
      state,
      action: PayloadAction<number>
    ) => {
      state.processes[action.payload].idleTime =
        +(state.processes[action.payload].idleTime || 0) + 1;
      state.screenTime += 1;

      UpdateProcessIdleTimeInStorage(date, {
        sessionIndex: action.payload,
        idleTime: state.processes[action.payload].idleTime,
      });
    },
  },
});

export const {
  addNewProcess,
  incrementProcessUsageTimeByOneSecond,
  incrementProcessIdleTimeByOneSecond,
} = observerSlice.actions;

export const observeProcess = (incomingProcess: ProcessType): AppThunk => {
  return (dispatch, getState) => {
    const state = getState();
    const processStateIndex = state.observer.processes.findIndex(
      (process) =>
        process.windowPid === incomingProcess.windowPid ||
        process.windowClass ===
          prettifyProcessName(incomingProcess.windowClass, incomingProcess.os)
    );

    if (processStateIndex === -1 && incomingProcess.windowName.length > 0) {
      dispatch(addNewProcess(incomingProcess));
      return;
    }

    if (+incomingProcess.idleTime > 0) {
      dispatch(incrementProcessIdleTimeByOneSecond(processStateIndex));
      return;
    }
    dispatch(incrementProcessUsageTimeByOneSecond(processStateIndex));
  };
};

export default observerSlice.reducer;

export const allProcesses = (state: RootState) => state.observer.processes;

export const totalScreenTime = (state: RootState) => state.observer.screenTime;
