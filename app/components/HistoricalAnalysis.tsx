import React from 'react';
// import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
// import StringToColor from 'string-to-color';

import DataStore from '../utils/electronStore';
import {} from '../features/historical/historicalSlice';

import routes from '../constants/routes.json';

import CSS from './HistoricalAnalysis.css';

type TotalProcessUsageType = {
  [key: string]: { idleTime: number; usageTime: number; daysOfUsage: number };
};

export default function HistoricalAnalysis() {
  const Storage = DataStore();

  const data = Storage.get('dailySessions');
  const sessions = Object.keys(data);

  const totalProcessUsage: TotalProcessUsageType = {};
  let totalUsageTime = 0;

  sessions.forEach((session) => {
    data[session].processes.forEach((process) => {
      if (process.owner.name in totalProcessUsage) {
        totalProcessUsage[process.owner.name].usageTime += process.usageTime;
        totalProcessUsage[process.owner.name].idleTime += process.idleTime;
        totalProcessUsage[process.owner.name].daysOfUsage += 1;
      } else {
        totalProcessUsage[process.owner.name] = {
          idleTime: process.idleTime,
          usageTime: process.usageTime,
          daysOfUsage: 1,
        };
      }
    });
    totalUsageTime += data[session].screenTime;
  });

  return (
    <div className={CSS.historicalPageWrapper}>
      <div data-tid="backButton">
        <Link to={routes.HOME}>
          <i className="fa fa-arrow-left" />
        </Link>
      </div>
      <p>
        {`${sessions.length} day of session with ${Math.round(
          totalUsageTime / 60
        )} min screen time`}
      </p>
      <div className={CSS.processCardWrapper}>
        {Object.keys(totalProcessUsage).map((process) => (
          <div className={CSS.processCard} key={process}>
            <div className={CSS.processCardLeftSection}>
              <span>{`${process}`}</span>
            </div>
            <div className={CSS.procesCardRigthSection}>
              <span>{`${totalProcessUsage[process].usageTime} min active usage`}</span>
              <span>{`${totalProcessUsage[process].idleTime} min idle usage`}</span>
              <span>{`Used for: ${totalProcessUsage[process].daysOfUsage} days`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 
 * 
 * <p>{`Active Usage: ${
            totalProcessUsage[process].usageTime / 60
          } min`}</p>
          <p>{`Idle: ${totalProcessUsage[process].idleTime / 60} min`}</p>
          <p>{`Used for: ${totalProcessUsage[process].daysOfUsage} days`}</p>
 * 
 */
