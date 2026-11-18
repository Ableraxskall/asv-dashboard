'use client';

import type ROSLIB from 'roslib';
import { useRosTopic } from '@/lib/useRos';
import { TOPICS } from '@/lib/rosConfig';

interface BatteryStateMsg {
  percentage: number;
  voltage: number;
}

export default function BatteryIndicator({ ros }: { ros: ROSLIB.Ros | null }) {
  const msg = useRosTopic<BatteryStateMsg>(ros, TOPICS.battery.name, TOPICS.battery.messageType);
  const pct = msg ? Math.round(msg.percentage * 100) : null;
  return (
    <div className="card">
      <h2>Battery</h2>
      <div className="battery-bar">
        <div className="battery-fill" style={{ width: pct !== null ? `${pct}%` : '0%' }} />
      </div>
      <p>{pct !== null ? `${pct}%` : 'waiting for data…'}</p>
    </div>
  );
}