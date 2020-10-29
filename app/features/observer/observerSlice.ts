import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ipcRenderer } from 'electron';
import DataStore, {
  AddNewProcessToStorage,
  UpdateProcessIdleTimeInStorage,
  UpdateProcessUsageTimeInStorage,
  UpdatePomodoroBreakLimit,
  UpdatePomodoroWorkLimit,
  UpdatePomodoroTotalWorkTime,
  UpdatePomodoroTotalBreakTime,
} from '../../utils/electronStore';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';
import {
  ProcessType,
  SettingsType,
  DailyProcessSessionType,
} from '../../utils/typeKeeper';

const Storage = DataStore();
// Timezone offset in miliseconds
const timezoneOffset = new Date().getTimezoneOffset() * 60000;
const date = new Date(Date.now() - timezoneOffset).toISOString().slice(0, 10);

const prepareInitialState = () => {
  const sessions = Storage.get('dailySessions');
  if (!sessions) {
    // Very first run of the app, create the config.json file with empty object
    Storage.set('dailySessions', <DailyProcessSessionType>{
      [date]: {
        pomodoroTracker: {
          work: {
            isActive: true,
            iteration: 0,
            limit: 1500,
            totalTime: 0,
          },
          break: {
            isActive: false,
            iteration: 0,
            limit: 300,
            longLimit: 1500,
            totalTime: 0,
          },
        },
        screenTime: 0,
        processes: [],
      },
    });
    Storage.set('settings', <SettingsType>{
      preferences: {
        launchAtBoot: true,
        isPomodoroEnabled: false,
      },
    });
  }
  const todaysSession = sessions && sessions[date];
  if (todaysSession) {
    return { ...todaysSession };
  }
  return Storage.get('dailySessions')[date];
};

// const capitalizeWord = (word: string) => {
//   return word[0].toUpperCase() + word.slice(1);
// };

// const prettifyProcessName = (
//   processName: string,
//   os: 'macos' | 'linux' | 'windows'
// ) => {
//   if (os === 'macos') {
//     // ex: com.microsoft.VSCode
//     const splittedProcess = processName.split('.');
//     return splittedProcess[splittedProcess.length - 1];
//   }
//   if (os === 'windows') {
//     // ex: chrome.exe
//     return capitalizeWord(processName.split('.')[0]);
//   }
//   // ex: chromium
//   return capitalizeWord(processName);
// };

const observerSlice = createSlice({
  name: 'observer',
  initialState: prepareInitialState(),
  reducers: {
    addNewProcess: (state, action: PayloadAction<ProcessType>) => {
      // Initiate the usageTime, idleTime
      action.payload.usageTime = 0;
      action.payload.idleTime = 0;
      state.processes.push(action.payload);

      AddNewProcessToStorage(date, action.payload);
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
    setPomodoroWorkLimit: (state, action: PayloadAction<number>) => {
      state.pomodoroTracker.work.limit = action.payload;
      UpdatePomodoroWorkLimit(date, action.payload);
    },
    setPomodoroBreakLimit: (state, action: PayloadAction<number>) => {
      state.pomodoroTracker.break.limit = action.payload;
      UpdatePomodoroBreakLimit(date, action.payload);
    },
    incrementPomodoroWorkTimeByOneSecond: (state) => {
      const totalTime = state.pomodoroTracker.work.totalTime + 1;
      state.pomodoroTracker.work.totalTime = totalTime;
      let isIteration = false;
      const isLongBreak = (state.pomodoroTracker.work.iteration + 1) % 4 === 0;

      if (totalTime % state.pomodoroTracker.work.limit === 0) {
        state.pomodoroTracker.work.iteration += 1;
        state.pomodoroTracker.work.isActive = false;
        state.pomodoroTracker.break.isActive = true;
        state.pomodoroTracker.work.totalTime = 0;
        isIteration = true;
        ipcRenderer.send(
          'generateNotification',
          'Chronos',
          isLongBreak ? 'A long break! It`s time to relax' : 'It`s break time!'
        );
      }
      UpdatePomodoroTotalWorkTime(date, isIteration);
    },
    incrementPomodoroBreakTimeByOneSecond: (state) => {
      const totalTime = state.pomodoroTracker.break.totalTime + 1;
      state.pomodoroTracker.break.totalTime = totalTime;
      let isIteration = false;
      const isLongBreak = state.pomodoroTracker.work.iteration % 4 === 0;
      if (
        totalTime %
          state.pomodoroTracker.break[isLongBreak ? 'longLimit' : 'limit'] ===
        0
      ) {
        state.pomodoroTracker.break.iteration += 1;
        state.pomodoroTracker.work.isActive = true;
        state.pomodoroTracker.break.isActive = false;
        state.pomodoroTracker.break.totalTime = 0;
        isIteration = true;
        ipcRenderer.send(
          'generateNotification',
          'Chronos',
          'Let`s get back to work!'
        );
      }
      UpdatePomodoroTotalBreakTime(date, isIteration);
    },
  },
});

export const {
  addNewProcess,
  incrementProcessUsageTimeByOneSecond,
  incrementProcessIdleTimeByOneSecond,
  incrementPomodoroBreakTimeByOneSecond,
  incrementPomodoroWorkTimeByOneSecond,
  setPomodoroBreakLimit,
  setPomodoroWorkLimit,
} = observerSlice.actions;

export const observeProcess = (incomingProcess: ProcessType): AppThunk => {
  return (dispatch, getState) => {
    const state = getState();

    if (state.settings.preferences.isPomodoroEnabled) {
      if (state.observer.pomodoroTracker.break.isActive) {
        dispatch(incrementPomodoroBreakTimeByOneSecond());
      } else {
        dispatch(incrementPomodoroWorkTimeByOneSecond());
      }
    }
    const processStateIndex = state.observer.processes.findIndex(
      (process) =>
        process.owner.processId === incomingProcess.owner.processId ||
        process.owner.name === incomingProcess.owner.name
    );

    if (processStateIndex === -1) {
      // The process not exist in the storage, create a new record for it
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
// .slice() will create a shallow copy of the state
export const allProcesses = (state: RootState) =>
  state.observer.processes
    .slice()
    .sort((prev, next) => +next.usageTime - +prev.usageTime);

export const totalScreenTime = (state: RootState) => state.observer.screenTime;

export const totalUsageTime = (state: RootState) =>
  state.observer.processes
    .map((process) => process.usageTime)
    .reduce((prev, next) => prev + next, 0);

export const getCurrentIteration = (state: RootState) => {
  let workOrBreak: 'work' | 'break' = 'work';
  let isLongBreak = false;
  if (state.observer.pomodoroTracker.break.isActive) {
    workOrBreak = 'break';
    isLongBreak = state.observer.pomodoroTracker.work.iteration % 4 === 0;
  }
  let adjustedLimit = state.observer.pomodoroTracker[workOrBreak].limit;
  if (isLongBreak) {
    adjustedLimit = state.observer.pomodoroTracker.break.longLimit;
  }
  return {
    type: workOrBreak,
    workIteration: state.observer.pomodoroTracker.work.iteration,
    breakIteration: state.observer.pomodoroTracker.break.iteration,
    limit: adjustedLimit,
    totalTime: state.observer.pomodoroTracker[workOrBreak].totalTime,
  };
};
