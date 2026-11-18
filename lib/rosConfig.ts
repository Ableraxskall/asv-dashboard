export const ROSBRIDGE_URL = process.env.NEXT_PUBLIC_ROSBRIDGE_URL ?? 'ws://localhost:9090';
export const WEB_VIDEO_SERVER_URL = process.env.NEXT_PUBLIC_WEB_VIDEO_SERVER_URL ?? 'http://localhost:8080';
export const CAMERA_TOPIC = '/wamv/sensors/cameras/front_left_camera_sensor/image_raw'; // confirm via `ros2 topic list`

export const TOPICS = {
  gps: {
  name: '/wamv/sensors/gps/gps/fix',
  messageType: 'sensor_msgs/msg/NavSatFix',
  },
  imu: {
  name: '/wamv/sensors/imu/imu/data',
  messageType: 'sensor_msgs/msg/Imu',
  },
  missionState: {
    name: '/mission/state', // TODO: likely doesn't exist yet — coordinate with Control
    messageType: 'std_msgs/msg/String',
  },
  battery: {
    name: '/wamv/sensors/battery/state', // TODO: confirm this exists in your arena
    messageType: 'sensor_msgs/msg/BatteryState',
  },
  killSwitch: {
    name: '/wamv/kill_switch', // TODO: confirm — may need to create this
    messageType: 'std_msgs/msg/Bool',
  },
};