import React from 'react';
import { useSelector } from 'react-redux';
import { RiZzzLine } from 'react-icons/ri';
import { VscVmRunning } from 'react-icons/vsc';
import {
  allProcesses,
  totalScreenTime,
} from '../features/observer/observerSlice';
import CSS from './ProcessList.css';

// const normalizeProcessName = (rawName: string) => {
//   // Process might be Chrome, VS Code as xxxx - xxxx - Google Chrome
//   if (rawName.includes(' - ')) {
//     const splittedName = rawName.split(' - ');
//     if (splittedName[0] === 'Developer Tools') {
//       return splittedName[0];
//     }
//     return splittedName[splittedName.length - 1];
//   }
//   return rawName;
// };

const colorPalette = [
  '#005CE6',
  '#4791FF',
  '#40A077',
  '#50B988',
  '#91D4BC',
  '#F3FFC6',
  '#C3EB78',
  '#B6174B',
  '#CD7E7C',
  '#E0AFA0',
  '#FFAC81',
  '#FF928B',
  '#FEC3A6',
  '#EFE9AE',
  '#CDEAC0',
];

export default function ProcessList() {
  const processLog = useSelector(allProcesses);
  const screenTime = useSelector(totalScreenTime);

  return (
    <div className={CSS.processListWrapper}>
      {processLog.map((process, index) => {
        return (
          <div className={CSS.processCard} key={process.id}>
            <div className={CSS.processCardBody}>
              <div
                className={CSS.processColorIndicator}
                style={{ background: colorPalette[index] }}
              />
              <div className={CSS.processCardBodyColumn}>
                <span className={CSS.processName}>{process.owner.name}</span>
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
            {/* <div
              className={CSS.usagePercentageIndicator}
              style={{
                width: `${((process.usageTime / screenTime) * 100).toFixed(1)}%`,
              }}
            ></div> */}
          </div>
        );
      })}
    </div>
  );
}
