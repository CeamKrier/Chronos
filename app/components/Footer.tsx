import React from 'react';
import { useSelector } from 'react-redux';
import { getCurrentIteration } from '../features/observer/observerSlice';
import CSS from './Footer.css';

export default function Footer(): JSX.Element {
  const currentPomodoroIteration = useSelector(getCurrentIteration);
  const isWorkIteration = currentPomodoroIteration.type === 'work';
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
      </div>
      <div className={CSS.breakInfoColumn}>
        Break
        <span>{currentPomodoroIteration.breakIteration}</span>
      </div>
    </div>
  );
}
