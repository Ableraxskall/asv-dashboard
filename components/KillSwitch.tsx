'use client';

import { useState } from 'react';
import type ROSLIB from 'roslib';
import { usePublisher } from '@/lib/useRos';
import { TOPICS } from '@/lib/rosConfig';

export default function KillSwitch({ ros }: { ros: ROSLIB.Ros | null }) {
  const [engaged, setEngaged] = useState(false);
  const publish = usePublisher(ros, TOPICS.killSwitch.name, TOPICS.killSwitch.messageType);

  const toggle = () => {
    const next = !engaged;
    setEngaged(next);
    publish({ data: next });
  };

  return (
    <div className="card">
      <h2>Kill Switch</h2>
      <button onClick={toggle} className={engaged ? 'kill-button engaged' : 'kill-button'}>
        {engaged ? 'ENGAGED — click to release' : 'Engage kill switch'}
      </button>
    </div>
  );
}