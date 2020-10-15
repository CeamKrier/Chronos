import React from 'react';
import { useSelector } from 'react-redux';
import { RiZzzLine } from 'react-icons/ri';
import { VscVmRunning } from 'react-icons/vsc';
import StringToColor from 'string-to-color';
import {
  allProcesses,
  totalScreenTime,
} from '../features/observer/observerSlice';
import CSS from './ProcessList.css';

export default function ProcessList() {
  const processLog = useSelector(allProcesses);
  const screenTime = useSelector(totalScreenTime);

  return (
    <div className={CSS.processListWrapper}>
      {processLog.map((process) => {
        return (
          <div className={CSS.processCard} key={process.id}>
            <div className={CSS.processCardBody}>
              <div
                className={CSS.processColorIndicator}
                style={{ background: StringToColor(process.owner.name) }}
              />
              <div className={CSS.processCardBodyColumn}>
                <span className={CSS.processName}>
                  {process.owner.name.length > 15
                    ? `${process.owner.name.substring(0, 15)}..`
                    : process.owner.name}
                </span>
                <span>
                  {`Active Usage: ${(
                    (process.usageTime / screenTime) *
                    100
                  ).toFixed(1)}%`}
                </span>
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
