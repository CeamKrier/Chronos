import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  dialogData,
  getUserResponseToDialog,
} from '../features/dialog/dialogSlice';

import CSS from './ConfirmationDialog.css';

export default function ConfirmationDialog() {
  const { actionType, isDialogOpen, message, title } = useSelector(dialogData);
  const dispatch = useDispatch();
  const handleDialogActionButtonClick = useCallback(
    (target: 'cancel' | 'ok') => () => {
      switch (target) {
        case 'cancel':
          dispatch(getUserResponseToDialog(false));
          break;

        case 'ok':
          dispatch(getUserResponseToDialog(true));
          break;

        default:
          break;
      }
    },
    [dispatch]
  );

  const handleDialogActionButtonViaKey = useCallback(
    (target: 'cancel' | 'ok') => (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.keyCode !== 32) {
        return;
      }
      switch (target) {
        case 'cancel':
          dispatch(getUserResponseToDialog(false));
          break;

        case 'ok':
          dispatch(getUserResponseToDialog(true));
          break;
        default:
          break;
      }
    },
    [dispatch]
  );

  return (
    <div
      className={CSS.confirmationDialogWrapper}
      style={isDialogOpen ? { top: '3.5em' } : { top: '-2.5em' }}
    >
      <div className={CSS.contentWrapper}>
        <span className={CSS.titleSpan}>{title}</span>
        <span className={CSS.messageSpan}>{message}</span>
        <div className={CSS.actionButtonWrapper}>
          {actionType === 'question' && (
            <div
              className={CSS.actionButton}
              onClick={handleDialogActionButtonClick('cancel')}
              onKeyDown={handleDialogActionButtonViaKey('cancel')}
              role="button"
              tabIndex={0}
            >
              Cancel
            </div>
          )}
          <div
            className={`${CSS.actionButton} ${CSS.highlightActionButton}`}
            onClick={handleDialogActionButtonClick('ok')}
            onKeyDown={handleDialogActionButtonViaKey('ok')}
            role="button"
            tabIndex={0}
          >
            OK
          </div>
        </div>
      </div>
    </div>
  );
}
