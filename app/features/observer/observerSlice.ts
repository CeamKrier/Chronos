import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';
import { Process } from '../../utils/typeKeeper';

const observerSlice = createSlice({
  name: 'observer',
  initialState: new Array<Process>(),
  reducers: {
    addNewProcess: (state, action: PayloadAction<Process>) => {
      state.push(action.payload);
    },
    incrementUsageTimeByOneSecond: (state, action: PayloadAction<number>) => {
      state[action.payload].usageTime =
        +(state[action.payload].usageTime || 0) + 1;
    },
    incrementIdleTimeByOneSecond: (state, action: PayloadAction<number>) => {
      state[action.payload].idleTime =
        +(state[action.payload].idleTime || 0) + 1;
    },
  },
});

export const {
  addNewProcess,
  incrementUsageTimeByOneSecond,
  incrementIdleTimeByOneSecond,
} = observerSlice.actions;

export const observeProcess = (incomingProcess: Process): AppThunk => {
  return (dispatch, getState) => {
    const state = getState();

    const processStateIndex = state.observer.findIndex(
      (process) => process.windowPid === incomingProcess.windowPid
    );

    if (processStateIndex === -1) {
      dispatch(addNewProcess(incomingProcess));
      return;
    }

    if (+incomingProcess.idleTime > 0) {
      dispatch(incrementIdleTimeByOneSecond(processStateIndex));
      return;
    }
    dispatch(incrementUsageTimeByOneSecond(processStateIndex));
  };
};

// export const incrementAsync = (delay = 1000): AppThunk => (dispatch) => {
//   setTimeout(() => {
//     dispatch(increment());
//   }, delay);
// };

export default observerSlice.reducer;

export const allProcesses = (state: RootState) => state.observer;

export const totalScreenTime = (state: RootState) =>
  state.observer
    .map((process) => +process.usageTime)
    .reduce((prev, next) => prev + next);

export const totalIdleTime = (state: RootState) =>
  state.observer
    .map((process) => +process.idleTime)
    .reduce((prev, next) => prev + next);
