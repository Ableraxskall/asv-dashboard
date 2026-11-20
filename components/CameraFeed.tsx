'use client';

import { WEB_VIDEO_SERVER_URL, CAMERA_TOPIC } from '@/lib/rosConfig';

export default function CameraFeed() {
  const streamUrl = `${WEB_VIDEO_SERVER_URL}/stream?topic=${CAMERA_TOPIC}`;

  return (
    <div className="card">
      <h2>Camera</h2>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={streamUrl}
        alt="WAM-V front camera feed"
        className="camera-feed"
        style={{
          width: '100%',
          height: 'auto',
          aspectRatio: '4 / 3',
          objectFit: 'cover',
          borderRadius: '8px',
        }}
      />
    </div>
  );
}
