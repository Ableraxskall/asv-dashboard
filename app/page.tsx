'use client';

import { useRos } from '@/lib/useRos';
import MissionState from '@/components/MissionState';
import CameraFeed from '@/components/CameraFeed';
import ArenaMap from '@/components/ArenaMap';
import BatteryIndicator from '@/components/BatteryIndicator';
import KillSwitch from '@/components/KillSwitch';

export default function DashboardPage() {
  const { ros, status } = useRos();

  return (
    <main className="dashboard">
      <div className="header-row">
        <div>
          <h1>ASV Mission Dashboard</h1>
          <p className={`status status-${status}`}>rosbridge: {status}</p>
        </div>
        <BatteryIndicator ros={ros} />
      </div>

      <div className="layout">
        <MissionState ros={ros} />
        <KillSwitch ros={ros} />
        <ArenaMap ros={ros} />
        <CameraFeed />
      </div>
    </main>
  );
}
