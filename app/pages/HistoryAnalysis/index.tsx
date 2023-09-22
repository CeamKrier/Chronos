import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { RiZzzLine } from 'react-icons/ri';
import { VscVmRunning } from 'react-icons/vsc';
import { ImStatsBars } from 'react-icons/im';
import { BsArrowLeftShort } from 'react-icons/bs';

import ProcessUsageBar from '../../components/ProcessUsageBar';
import Chart from '../../components/Chart';

import DataStore from '../../utils/electronStore';
import { TotalProcessUsageType } from '../../utils/typeKeeper';

import routes from '../../constants/routes.json';

import CSS from './HistoricalAnalysis.css';

const getFloor = (seconds: number) => {
  return Math.floor(seconds);
};

const secondsToHMS = (secs: number | string) => {
  const adjustedSeconds = typeof secs === 'string' ? parseInt(secs) : secs;
  const hours = Math.floor(adjustedSeconds / 3600);
  const minutes = Math.floor(adjustedSeconds / 60) % 60;
  const seconds = adjustedSeconds % 60;

  return [hours, minutes, seconds]
    .map((v) => (v < 10 ? '0' + v : v))
    .filter((v, i) => v !== '00' || i > 0)
    .join(':');
};
export default function HistoricalAnalysis() {
  const Storage = DataStore();

  const data = Storage.get('dailySessions');
  const sessions = Object.keys(data);

  const [currentProcess, setCurrentProcess] = useState(null);

  const convertDate = (inputFormat: Date) => {
    function pad(s: number) {
      return s < 10 ? '0' + s : s;
    }
    const d = new Date(inputFormat);
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
  };

  const getLastXDayOfSessions = (days = 10) => {
    const lastItem = sessions[sessions.length - 1];
    const arrayOfDays = [];

    for (let d = days; d > 0; d--) {
      const date = new Date(lastItem);
      date.setDate(date.getDate() - d);
      arrayOfDays.push(convertDate(date));
    }

    return arrayOfDays;
  };

  const lastTwoDayUsageRatio = useMemo(() => {
    const values = Object.values(data);

    if (values.length < 2) {
      return;
    }

    const today = values[values.length - 1].screenTime;
    const yesterday = values[values.length - 2].screenTime;

    const ratio = ((today / yesterday) * 100 - 100).toFixed(1);

    return {
      ratio,
      difference: today - yesterday,
      state: +ratio < 0 ? 'down' : 'up',
    };
  }, [data]);

  const lastTenDaySessionInfo = getLastXDayOfSessions();

  const populateProcessUsage = () => {
    const totalProcessUsage: TotalProcessUsageType = {};
    let totalUsageTime = 0;

    lastTenDaySessionInfo.forEach((session) => {
      if (data[session]) {
        data[session].processes.forEach((process) => {
          if (process.owner.name in totalProcessUsage) {
            totalProcessUsage[process.owner.name].usageTime +=
              process.usageTime;
            totalProcessUsage[process.owner.name].idleTime += process.idleTime;
            totalProcessUsage[process.owner.name].daysOfUsage += 1;
            totalProcessUsage[process.owner.name].name = process.owner.name;
            totalProcessUsage[process.owner.name].sessions.push({
              date: session,
              idleTime: process.idleTime,
              usageTime: process.usageTime,
            });
          } else {
            totalProcessUsage[process.owner.name] = {
              idleTime: process.idleTime,
              usageTime: process.usageTime,
              daysOfUsage: 1,
              name: process.owner.name,
              sessions: [
                {
                  idleTime: process.idleTime,
                  usageTime: process.usageTime,
                  date: session,
                },
              ],
            };
          }
        });
        totalUsageTime += data[session].screenTime;
      }
    });

    return { processUsageData: totalProcessUsage, totalUsageTime };
  };

  const { processUsageData, totalUsageTime } = populateProcessUsage();

  const retrieveTopTenProcesses = useCallback(() => {
    return Object.values(processUsageData)
      .sort(
        (prev, next) =>
          next.idleTime + next.usageTime - (prev.idleTime + prev.usageTime)
      )
      .slice(0, 10);
  }, [processUsageData]);

  const handleProcessDetailClick = useCallback(
    (processName) => () => {
      if (processName === currentProcess) {
        setCurrentProcess(null);
      } else {
        setCurrentProcess(processName);
      }
    },
    [currentProcess]
  );

  const renderMostUsedProcesses = useMemo(() => {
    return retrieveTopTenProcesses().map((process) => (
      <div className={CSS.processCard} key={process.name}>
        <div className={CSS.openHistoricView}>
          <ImStatsBars
            size="1.3em"
            onClick={handleProcessDetailClick(process.name)}
          />
        </div>
        <div className={CSS.processRow}>
          <div className={CSS.processCardLeftSection}>
            <span>{`${process.name}`}</span>
          </div>
          <div className={CSS.procesCardRigthSection}>
            <span>
              {`Daily Use (Avg.): ${getFloor(
                getFloor(
                  (process.usageTime + process.idleTime) / process.daysOfUsage
                ) / 60
              )} mins`}
            </span>
          </div>
        </div>

        <div className={CSS.processScaleTitleWrapper}>
          <span className={CSS.processUsageBarIcon}>
            <VscVmRunning size="1.4em" />
          </span>
          <div className={CSS.sessionInformationSection}>
            <span className={CSS.sessionInformationTotalDayTitle}>{`During ${
              process.daysOfUsage
            } ${process.daysOfUsage > 1 ? 'Days' : 'Day'}`}</span>
            <span className={CSS.sessionInformationTime}>
              {secondsToHMS(process.usageTime + process.idleTime)}
            </span>
          </div>
          <span className={CSS.processUsageBarIcon}>
            <RiZzzLine size="1.4em" />
          </span>
        </div>

        <ProcessUsageBar
          usageTime={process.usageTime}
          idleTime={process.idleTime}
          style={{ backgroundColor: '#FFAD00' }}
          type="historic"
        />
      </div>
    ));
  }, [handleProcessDetailClick, retrieveTopTenProcesses]);

  return (
    <div className={CSS.historicalPageWrapper}>
      <div className={CSS.homeButton} role="button" tabIndex={0}>
        <Link to={routes.HOME}>
          <BsArrowLeftShort size="2.25em" />
        </Link>
      </div>

      {lastTwoDayUsageRatio ? (
        <>
          {currentProcess ? (
            <div className={CSS.processDetailSection}>
              <span className={CSS.processDetailTitle}>
                {`Daily Usages - ${currentProcess}`}
              </span>
              <Chart
                type="bar"
                height={250}
                series={[
                  {
                    name: 'Active Usage',
                    data: processUsageData[
                      currentProcess!
                    ].sessions.map((val) => getFloor(val.usageTime / 60)),
                  },
                  {
                    name: 'Inactive Usage',
                    data: processUsageData[
                      currentProcess!
                    ].sessions.map((val) => getFloor(val.idleTime / 60)),
                  },
                ]}
                categories={processUsageData[currentProcess!].sessions.map(
                  (val) => val.date
                )}
              />
            </div>
          ) : (
            <div className={CSS.historicOverview}>
              <span>Daily Screen Time (Avg.)</span>
              <span className={CSS.totalScreenTimeText}>
                {secondsToHMS(getFloor(totalUsageTime / 10))}
              </span>
              <span className={CSS.screenTimeChangeRatioText}>
                Daily Change:{' '}
                <span
                  style={{
                    color:
                      lastTwoDayUsageRatio.state === 'up'
                        ? '#90B5EA'
                        : '#ADD1F2',
                  }}
                >
                  {lastTwoDayUsageRatio.ratio}% -
                  {secondsToHMS(Math.abs(lastTwoDayUsageRatio.difference))}
                </span>
              </span>
            </div>
          )}

          <div className={CSS.processListHeader}>
            <span>Most Used Processes - Last 10 Days</span>
          </div>

          <div className={CSS.processCardWrapper}>
            {renderMostUsedProcesses}
          </div>
        </>
      ) : (
        <div className={CSS.noHistoricDataWrapper}>
          <span className={CSS.noDataTitle}>There is not enough data to calculate historic changes</span>
          <span className={CSS.noDataSubTitle}>Historic analysis will be available once you have atleast 5 days of session</span>
        </div>
      )}
    </div>
  );
}
