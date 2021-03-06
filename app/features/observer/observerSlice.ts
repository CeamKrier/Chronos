import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ipcRenderer } from 'electron';
import DataStore, {
  AddNewProcessToStorage,
  UpdateProcessIdleTimeInStorage,
  UpdateProcessUsageTimeInStorage,
  UpdatePomodoroTotalWorkTime,
  UpdatePomodoroTotalBreakTime,
} from '../../utils/electronStore';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';
import {
  ProcessType,
  SettingsType,
  DailyProcessSessionType,
  SettingPreferenceType,
} from '../../utils/typeKeeper';

const Storage = DataStore();
// Timezone offset in miliseconds
const timezoneOffset = new Date().getTimezoneOffset() * 60000;
let date = new Date(Date.now() - timezoneOffset).toISOString().slice(0, 10);

const prepareInitialState = () => {
  const sessions = Storage.get('dailySessions');
  if (!sessions) {
    // Very first run of the app, create the config.json file with empty object
    Storage.set('settings', <SettingsType>{
      preferences: {
        launchAtBoot: true,
        isPomodoroEnabled: false,
        pomodoroWorkLimit: 1500,
        pomodoroBreakLimit: 300,
        pomodoroLongBreakLimit: 1500,
      },
    });

    Storage.set('dailySessions', <DailyProcessSessionType>{});
  }

  const todaysSession = sessions && sessions[date];

  if (!todaysSession) {
    Storage.set(`dailySessions.${date}`, {
      pomodoroTracker: {
        work: {
          isActive: true,
          iteration: 0,
          totalTime: 0,
        },
        break: {
          isActive: false,
          iteration: 0,
          totalTime: 0,
        },
      },
      screenTime: 0,
      processes: [],
    });
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
    incrementPomodoroWorkTimeByOneSecond: (
      state,
      action: PayloadAction<SettingPreferenceType>
    ) => {
      const totalTime = state.pomodoroTracker.work.totalTime + 1;
      state.pomodoroTracker.work.totalTime = totalTime;
      let isIteration = false;
      const isLongBreak = (state.pomodoroTracker.work.iteration + 1) % 4 === 0;

      if (totalTime % action.payload.pomodoroWorkLimit === 0) {
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
    incrementPomodoroBreakTimeByOneSecond: (
      state,
      action: PayloadAction<SettingPreferenceType>
    ) => {
      const totalTime = state.pomodoroTracker.break.totalTime + 1;
      state.pomodoroTracker.break.totalTime = totalTime;
      let isIteration = false;
      const isLongBreak = state.pomodoroTracker.work.iteration % 4 === 0;
      if (
        totalTime %
          action.payload[
            isLongBreak ? 'pomodoroLongBreakLimit' : 'pomodoroBreakLimit'
          ] ===
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
    resetPomodoroCounter: (state) => {
      if (state.pomodoroTracker.break.isActive) {
        state.pomodoroTracker.break.totalTime = 0;
        UpdatePomodoroTotalBreakTime(date, false, true);
      } else {
        state.pomodoroTracker.work.totalTime = 0;
        UpdatePomodoroTotalWorkTime(date, false, true);
      }
    },
    switchToNextDay: (state) => {
      state.processes = [];
      state.screenTime = 0;
    },
  },
});

export const {
  addNewProcess,
  incrementProcessUsageTimeByOneSecond,
  incrementProcessIdleTimeByOneSecond,
  incrementPomodoroBreakTimeByOneSecond,
  incrementPomodoroWorkTimeByOneSecond,
  resetPomodoroCounter,
  switchToNextDay,
} = observerSlice.actions;

export const observeProcess = (incomingProcess: ProcessType): AppThunk => {
  const currentDate = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);
  return (dispatch, getState) => {
    const state = getState();

    if (currentDate !== date) {
      date = currentDate;
      prepareInitialState();
      dispatch(switchToNextDay());
      return;
    }

    if (state.settings.preferences.isPomodoroEnabled) {
      if (state.observer.pomodoroTracker.break.isActive) {
        dispatch(
          incrementPomodoroBreakTimeByOneSecond(state.settings.preferences)
        );
      } else {
        dispatch(
          incrementPomodoroWorkTimeByOneSecond(state.settings.preferences)
        );
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
  let adjustedLimit =
    state.settings.preferences[
      workOrBreak === 'work' ? 'pomodoroWorkLimit' : 'pomodoroBreakLimit'
    ];
  if (isLongBreak) {
    adjustedLimit = state.settings.preferences.pomodoroLongBreakLimit;
  }
  return {
    type: workOrBreak,
    workIteration: state.observer.pomodoroTracker.work.iteration,
    breakIteration: state.observer.pomodoroTracker.break.iteration,
    limit: adjustedLimit,
    totalTime: state.observer.pomodoroTracker[workOrBreak].totalTime,
  };
};

export const pomodoroWorkLimit = (state: RootState) =>
  state.settings.preferences.pomodoroWorkLimit;

export const pomodoroShortBreakLimit = (state: RootState) =>
  state.settings.preferences.pomodoroBreakLimit;

export const pomodoroLongBreakLimit = (state: RootState) =>
  state.settings.preferences.pomodoroLongBreakLimit;
