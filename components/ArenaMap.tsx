'use client';

import { useEffect, useRef } from 'react';
import type ROSLIB from 'roslib';
import { useRosTopic } from '@/lib/useRos';
import { TOPICS } from '@/lib/rosConfig';

interface NavSatFixMsg {
  latitude: number;
  longitude: number;
}

interface ImuMsg {
  orientation: { x: number; y: number; z: number; w: number };
}

const CANVAS_SIZE = 400;
const METERS_PER_DEG_LAT = 111320;
const PIXELS_PER_METER = 14; // tuned for the real 24m x 12m arena

// Fixed GPS reference point matching the Gazebo world's <spherical_coordinates>
// origin — i.e. world (0,0,0), which is the pool center. Using this fixed point
// instead of "wherever the boat started" means the hardcoded arena layout below
// always lines up with the live boat marker, regardless of where the boat spawns.
const WORLD_ORIGIN = { lat: -33.724223, lon: 150.679736 };

// --- Static arena layout, in meters, centered on the pool (from figs.py / make_world.py) ---
const POOL = { width: 24.0, height: 12.0 };

const DOCKS = [
  { x: -10.5, y: 0, w: 3.0, h: 4.0 }, // Spot 1
  { x: 10.5, y: 0, w: 3.0, h: 4.0 },  // Spot 2
];

const GREEN_BUOYS: [number, number][] = [
  [-6.0, 1.6], [-3.0, 1.75], [0.0, 0.15], [3.0, 1.75], [6.0, 1.6],
];
const RED_BUOYS: [number, number][] = [
  [-6.0, -0.4], [-3.0, -1.75], [0.0, -1.35], [3.0, -1.75], [6.0, -0.4],
];
const OBSTACLES: [number, number, 'Y' | 'K'][] = [
  [-4.5, 0.8, 'Y'], [-1.5, -0.875, 'K'], [1.5, 0.125, 'K'], [4.5, -0.2, 'Y'],
];
const ITEMS: [string, number, number][] = [
  ['cube', -11.1, 0.0], ['sphere', -9.8, 1.0], ['prism', -9.8, -1.0],
];

function yawFromQuaternion(q: { x: number; y: number; z: number; w: number }) {
  const sinyCosp = 2 * (q.w * q.z + q.x * q.y);
  const cosyCosp = 1 - 2 * (q.y * q.y + q.z * q.z);
  return Math.atan2(sinyCosp, cosyCosp);
}

// Converts a (meters-east, meters-north) offset from the pool center into canvas pixels.
function toCanvas(xMeters: number, yMeters: number) {
  return {
    px: CANVAS_SIZE / 2 + xMeters * PIXELS_PER_METER,
    py: CANVAS_SIZE / 2 - yMeters * PIXELS_PER_METER,
  };
}

export default function ArenaMap({ ros }: { ros: ROSLIB.Ros | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gps = useRosTopic<NavSatFixMsg>(ros, TOPICS.gps.name, TOPICS.gps.messageType);
  const imu = useRosTopic<ImuMsg>(ros, TOPICS.imu.name, TOPICS.imu.messageType);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = '#0b3d5c';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Pool boundary
    const poolTopLeft = toCanvas(-POOL.width / 2, POOL.height / 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(poolTopLeft.px, poolTopLeft.py, POOL.width * PIXELS_PER_METER, POOL.height * PIXELS_PER_METER);

    // Docks
    ctx.fillStyle = 'rgba(150, 110, 80, 0.6)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    for (const d of DOCKS) {
      const topLeft = toCanvas(d.x - d.w / 2, d.y + d.h / 2);
      const w = d.w * PIXELS_PER_METER;
      const h = d.h * PIXELS_PER_METER;
      ctx.fillRect(topLeft.px, topLeft.py, w, h);
      ctx.strokeRect(topLeft.px, topLeft.py, w, h);
    }

    // Lane buoys + obstacles
    const drawDot = (x: number, y: number, color: string) => {
      const { px, py } = toCanvas(x, y);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    };
    GREEN_BUOYS.forEach(([x, y]) => drawDot(x, y, '#2ea84f'));
    RED_BUOYS.forEach(([x, y]) => drawDot(x, y, '#d13327'));
    OBSTACLES.forEach(([x, y, cc]) => drawDot(x, y, cc === 'Y' ? '#f2c230' : '#1a1a1a'));

    // Item pickup spots (Spot 1)
    ctx.fillStyle = '#f2c230';
    ITEMS.forEach(([, x, y]) => {
      const { px, py } = toCanvas(x, y);
      ctx.fillRect(px - 3, py - 3, 6, 6);
    });

    // Live boat marker
    if (gps) {
      const metersPerDegLon = METERS_PER_DEG_LAT * Math.cos((WORLD_ORIGIN.lat * Math.PI) / 180);
      const dx = (gps.longitude - WORLD_ORIGIN.lon) * metersPerDegLon;
      const dy = (gps.latitude - WORLD_ORIGIN.lat) * METERS_PER_DEG_LAT;
      const { px, py } = toCanvas(dx, dy);

      const yaw = imu ? yawFromQuaternion(imu.orientation) : 0;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-yaw);
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(7, 8);
      ctx.lineTo(-7, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }, [gps, imu]);

  return (
    <div className="card">
      <h2>Arena Map</h2>
      <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />
      {!gps && <p>waiting for position data…</p>}
    </div>
  );
}