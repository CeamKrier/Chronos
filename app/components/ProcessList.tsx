import React from 'react';
import { useSelector } from 'react-redux';
import { RiZzzLine } from 'react-icons/ri';
import { VscVmRunning } from 'react-icons/vsc';
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
                <span className={CSS.processName}>{process.windowClass}</span>
                {/* <span>
                  PID:
                  {process.windowPid}
                </span> */}
              </div>

              <div className={CSS.processCardBodyColumn}>
                <span className={CSS.processSpanElement}>
                  <VscVmRunning size="1.4em" />
                  {` ${new Date((process.usageTime || 0) * 1000)
                    .toISOString()
                    .substr(11, 8)}`}
                </span>
                <span className={CSS.processSpanElement}>
                  <RiZzzLine size="1.4em" />
                  {` ${new Date((process.idleTime || 0) * 1000)
                    .toISOString()
                    .substr(11, 8)}`}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
