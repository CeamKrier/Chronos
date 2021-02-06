import React from 'react';

import { ProcessUsageBarType } from '../../utils/typeKeeper';
import CSS from './ProcessUsageBar.css';

export default function ProcessUsageBar({
  usageTime,
  idleTime,
  style,
  type,
}: ProcessUsageBarType) {
  const combinedUsageTime = usageTime + idleTime;
  const idlePercentage = +((idleTime / combinedUsageTime) * 100).toFixed(2);
  const usagePercentage = (100 - idlePercentage).toFixed(2);

  return (
    <div
      className={
        type === 'summary' ? CSS.processScaleBar : CSS.historicProcessScaleBar
      }
      style={{ ...style }}
    >
      <div
        className={CSS.processPercentage}
        style={{
          width: `${usagePercentage}%`,
        }}
      >
        {`${usagePercentage}%`}
      </div>
      <div className={CSS.processPercentagePointer} />
      <div
        className={CSS.processPercentage}
        style={{
          width: `${idlePercentage}%`,
        }}
      >
        {`${idlePercentage}%`}
      </div>
    </div>
  );
}
