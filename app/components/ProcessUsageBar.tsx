import React from 'react';

import { ProcessUsageBarType } from '../utils/typeKeeper';
import CSS from './ProcessUsageBar.css';

export default function ProcessUsageBar({
  usageTime,
  idleTime,
  style,
}: ProcessUsageBarType) {
  const combinedUsageTime = usageTime + idleTime;
  const idlePercentage = +((idleTime / combinedUsageTime) * 100).toFixed(2);
  const usagePercentage = (100 - idlePercentage).toFixed(2);

  return (
    <div className={CSS.processScaleBar} style={{ ...style }}>
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
