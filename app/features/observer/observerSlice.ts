import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';
import { Process } from '../../utils/typeKeeper';

const observerSlice = createSlice({
  name: 'observer',
  initialState: {
    screenTime: 0,
    processes: new Array<Process>(),
  },
  reducers: {
    addNewProcess: (state, action: PayloadAction<Process>) => {
      if (action.payload.idleTime > 0) {
        state.screenTime = +action.payload.idleTime;
      }
      state.processes.push(action.payload);
      // state.screenTime += 1;
    },
    incrementProcessUsageTimeByOneSecond: (
      state,
      action: PayloadAction<number>
    ) => {
      state.processes[action.payload].usageTime =
        +(state.processes[action.payload].usageTime || 0) + 1;
      state.screenTime += 1;
    },
    incrementProcessIdleTimeByOneSecond: (
      state,
      action: PayloadAction<number>
    ) => {
      state.processes[action.payload].idleTime =
        +(state.processes[action.payload].idleTime || 0) + 1;
      state.screenTime += 1;
    },
  },
});

export const {
  addNewProcess,
  incrementProcessUsageTimeByOneSecond,
  incrementProcessIdleTimeByOneSecond,
} = observerSlice.actions;

export const observeProcess = (incomingProcess: Process): AppThunk => {
  return (dispatch, getState) => {
    const state = getState();
    const processStateIndex = state.observer.processes.findIndex(
      (process) => process.windowPid === incomingProcess.windowPid
    );

    if (processStateIndex === -1) {
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
