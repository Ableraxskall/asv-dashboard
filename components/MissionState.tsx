'use client';

import type ROSLIB from 'roslib';
import { useRosTopic } from '@/lib/useRos';
import { TOPICS } from '@/lib/rosConfig';

interface MissionStateMsg {
  data: string;
}

export default function MissionState({ ros }: { ros: ROSLIB.Ros | null }) {
  const msg = useRosTopic<MissionStateMsg>(ros, TOPICS.missionState.name, TOPICS.missionState.messageType);
  return (
    <div className="card">
      <h2>Mission State</h2>
      <p className="state-value">{msg?.data ?? 'waiting for data…'}</p>
    </div>
  );
}