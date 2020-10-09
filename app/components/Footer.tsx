import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  totalUsageTime,
  totalScreenTime,
} from '../features/observer/observerSlice';
import CSS from './Footer.css';

export default function Footer() {
  const usageTotalTime = useSelector(totalUsageTime);
  const screenTotalTime = useSelector(totalScreenTime);

  const usagePercentage = useMemo(
    () => +((usageTotalTime / screenTotalTime) * 100).toFixed(5),
    [usageTotalTime, screenTotalTime]
  );
  const idlePercentage = useMemo(() => +(100 - usagePercentage).toFixed(5), [
    usagePercentage,
  ]);
  return (
    <div className={CSS.footerWrapper}>
      <div>{`Usage: ${usagePercentage} | Idle: ${idlePercentage}`}</div>
    </div>
  );
}
