import React, { useState, useCallback } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import ApexChart from 'react-apexcharts';
import { RiZzzLine } from 'react-icons/ri';
import { VscVmRunning } from 'react-icons/vsc';
import { ImStatsBars } from 'react-icons/im';
import { BsArrowLeftShort } from 'react-icons/bs';

import ProcessUsageBar from './ProcessUsageBar';

import DataStore from '../utils/electronStore';
import {} from '../features/historical/historicalSlice';

import routes from '../constants/routes.json';

import CSS from './HistoricalAnalysis.css';

type TotalProcessUsageType = {
  [key: string]: {
    idleTime: number;
    usageTime: number;
    daysOfUsage: number;
    name: string;
  };
};

const getCeil = (seconds: number) => {
  return Math.ceil(seconds);
};

export default function HistoricalAnalysis() {
  const Storage = DataStore();

  const data = Storage.get('dailySessions');
  const sessions = Object.keys(data);

  const [currentProcess, setCurrentProcess] = useState(null);

  const populateProcessUsage = () => {
    const totalProcessUsage: TotalProcessUsageType = {};
    let totalUsageTime = 0;

    sessions.forEach((session) => {
      if (data[session]) {
        data[session].processes.forEach((process) => {
          if (process.owner.name in totalProcessUsage) {
            totalProcessUsage[process.owner.name].usageTime +=
              process.usageTime;
            totalProcessUsage[process.owner.name].idleTime += process.idleTime;
            totalProcessUsage[process.owner.name].daysOfUsage += 1;
            totalProcessUsage[process.owner.name].name = process.owner.name;
          } else {
            totalProcessUsage[process.owner.name] = {
              idleTime: process.idleTime,
              usageTime: process.usageTime,
              daysOfUsage: 1,
              name: process.owner.name,
            };
          }
        });
      }
      totalUsageTime += data[session].screenTime;
    });

    return { processUsageData: totalProcessUsage, totalUsageTime };
  };

  const { processUsageData } = populateProcessUsage();

  const retrieveTopTenProcesses = () => {
    return Object.values(processUsageData)
      .sort(
        (prev, next) =>
          next.idleTime + next.usageTime - (prev.idleTime + prev.usageTime)
      )
      .slice(0, 10);
  };

  const handleProcessDetailClick = useCallback(
    (processName) => () => {
      setCurrentProcess(processName);
    },
    []
  );

  return (
    <div className={CSS.historicalPageWrapper}>
      <div className={CSS.homeButton} role="button" tabIndex={0}>
        <Link to={routes.HOME}>
          <BsArrowLeftShort size="2.25em" />
        </Link>
      </div>

      <div className={CSS.processDetailSection}>
        <span className={CSS.processDetailTitle}>
          {`Last 15 Days - ${currentProcess || 'Overall'}`}
        </span>
        <ApexChart
          type="bar"
          height={250}
          series={[
            {
              name: 'Active Usage',
              data: [44, 55, 41, 67, 22, 43],
            },
            {
              name: 'Inactive Usage',
              data: [13, 23, 20, 8, 13, 27],
            },
          ]}
          options={{
            colors: ['#88CAFF', '#C6A07F'],
            chart: {
              type: 'bar',
              foreColor: '#E2E3E5',
              stacked: true,
              toolbar: {
                show: false,
              },
              zoom: {
                enabled: false,
              },
            },
            tooltip: {
              theme: 'dark',
            },
            plotOptions: {
              bar: {
                horizontal: false,
              },
              colors: ['red'],
            },
            dataLabels: {
              style: {
                colors: ['#E2E3E5'],
              },
            },
            xaxis: {
              type: 'datetime',
              categories: [
                '01/01/2011 GMT',
                '01/02/2011 GMT',
                '01/03/2011 GMT',
                '01/04/2011 GMT',
                '01/05/2011 GMT',
                '01/06/2011 GMT',
              ],
            },
            legend: {
              position: 'bottom',
              offsetY: 7,
            },
            fill: {
              opacity: 0.8,
            },
          }}
        />
      </div>

      <div className={CSS.processListHeader}>
        <span>Most Used Process</span>
      </div>
      {/* <p>
        {`${sessions.length} day of session with ${Math.round(
          totalUsageTime / 60
        )} min screen time`}
      </p> */}
      <div className={CSS.processCardWrapper}>
        {retrieveTopTenProcesses().map((process) => (
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
                <span>{`Duration: ${process.daysOfUsage} days`}</span>
                <span>
                  {`Average Daily Usage: ${getCeil(
                    getCeil(process.usageTime / 60) / process.daysOfUsage
                  )}`}
                </span>
              </div>
            </div>

            <div className={CSS.processScaleTitleWrapper}>
              <span>
                <VscVmRunning size="1.4em" />
              </span>
              <div className={CSS.sessionInformationSection}>
                <span className={CSS.sessionInformationTime}>
                  {new Date((process.usageTime + process.idleTime) * 1000)
                    .toISOString()
                    .substr(11, 8)}
                </span>
              </div>
              <span>
                <RiZzzLine size="1.4em" />
              </span>
            </div>

            <ProcessUsageBar
              usageTime={process.usageTime}
              idleTime={process.idleTime}
              style={{ backgroundColor: '#FFAD00' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
