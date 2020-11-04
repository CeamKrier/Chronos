import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BiReset } from 'react-icons/bi';

import {
  getCurrentIteration,
  resetPomodoroCounter,
} from '../features/observer/observerSlice';
import {
  showDialog,
  dialogConfirmedOrRejected,
  resetDialogResponse,
} from '../features/dialog/dialogSlice';

import CSS from './Footer.css';

export default function Footer(): JSX.Element {
  const dispatch = useDispatch();

  const currentPomodoroIteration = useSelector(getCurrentIteration);
  const userResponseToDialog = useSelector(dialogConfirmedOrRejected);

  const isWorkIteration = currentPomodoroIteration.type === 'work';

  useEffect(() => {
    if (userResponseToDialog) {
      // reset the current pomodoro counter
      dispatch(resetPomodoroCounter());
      dispatch(resetDialogResponse());
    }
  }, [userResponseToDialog, dispatch]);

  const handlePomodoroCounterResetClick = useCallback(() => {
    dispatch(
      showDialog({
        actionType: 'question',
        message: `Are you sure you want to reset your ${currentPomodoroIteration.type}-time?`,
        title: `Reset ${currentPomodoroIteration.type}-time`,
      })
    );
  }, [dispatch, currentPomodoroIteration.type]);

  const handlePomodoroCounterResetViaKey = useCallback(() => {
    dispatch(
      showDialog({
        actionType: 'question',
        message: 'Are you sure you want to reset your break-time?',
        title: 'Reset break-time',
      })
    );
  }, [dispatch]);

  return (
    <div className={CSS.footerWrapper}>
      <div className={CSS.workInfoColumn}>
        Work
        <span>{currentPomodoroIteration.workIteration}</span>
      </div>
      <div className={CSS.footerMainColumn}>
        <span className={CSS.pomodoroIterationType}>
          {isWorkIteration ? `Break Time in` : `Start Working in`}
        </span>
        <span className={CSS.pomodoroCountdown}>
          {new Date(
            (currentPomodoroIteration.limit -
              (currentPomodoroIteration.totalTime %
                currentPomodoroIteration.limit)) *
              1000
          )
            .toISOString()
            .substr(14, 5)}
        </span>
        <div className={CSS.pomodoroActionsWrapper}>
          <div
            className={CSS.pomodoroActionItem}
            onClick={handlePomodoroCounterResetClick}
            onKeyDown={handlePomodoroCounterResetViaKey}
            role="button"
            tabIndex={0}
          >
            <BiReset size="1.8em" />
            Reset
          </div>
        </div>
      </div>
      <div className={CSS.breakInfoColumn}>
        Break
        <span>{currentPomodoroIteration.breakIteration}</span>
      </div>
    </div>
  );
}
