import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';
import { ConfirmationDialogTypes } from '../../utils/typeKeeper';

const prepareInitialState = (): ConfirmationDialogTypes => {
  return {
    isDialogOpen: false,
    title: '',
    message: '',
    actionType: 'info',
    dialogConfirmedOrRejected: undefined,
  };
};

const DialogSlice = createSlice({
  name: 'dialog',
  initialState: prepareInitialState(),
  reducers: {
    showDialog: (state, action: PayloadAction<ConfirmationDialogTypes>) => {
      state.isDialogOpen = true;
      state.actionType = action.payload.actionType;
      state.message = action.payload.message;
      state.title = action.payload.title;
    },
    getUserResponseToDialog: (state, action: PayloadAction<boolean>) => {
      state.dialogConfirmedOrRejected = action.payload;
      state.isDialogOpen = false;
    },
    resetDialogResponse: (state) => {
      state.dialogConfirmedOrRejected = undefined;
    },
  },
});

export const {
  showDialog,
  getUserResponseToDialog,
  resetDialogResponse,
} = DialogSlice.actions;

export default DialogSlice.reducer;

export const dialogData = (state: RootState) => state.dialogBox;

export const dialogConfirmedOrRejected = (state: RootState) =>
  state.dialogBox.dialogConfirmedOrRejected;
