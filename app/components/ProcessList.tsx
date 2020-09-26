import React from 'react';
import { useSelector } from 'react-redux';
import { allProcesses } from '../features/observer/observerSlice';
import CSS from './ProcessList.css';

export default function ProcessList() {
  const processLog = useSelector(allProcesses);
  return (
    <div className={CSS.processListWrapper}>
      {processLog.map((process) => {
        return (
          <div className={CSS.processCard} key={process.windowPid}>
            <div className={CSS.processCardBody}>
              <div className={CSS.processCardBodyColumn}>
                <span>
                  Name:
                  {process.windowClass}
                </span>
                <span>
                  PID:
                  {process.windowPid}
                </span>
              </div>

              <div className={CSS.processCardBodyColumn}>
                <span>
                  Usage:
                  {process.usageTime}
                  seconds
                </span>
                <span>
                  Idle:
                  {process.idleTime}
                  seconds
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
