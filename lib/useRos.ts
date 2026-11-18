'use client';

import { useEffect, useState } from 'react';
import { Ros, Topic } from 'roslib';
import { ROSBRIDGE_URL } from './rosConfig';

export type RosConnectionStatus = 'connecting' | 'connected' | 'error' | 'closed';

export function useRos() {
  const [ros, setRos] = useState<Ros | null>(null);
  const [status, setStatus] = useState<RosConnectionStatus>('connecting');

  useEffect(() => {
    const rosInstance = new Ros({ url: ROSBRIDGE_URL });

    rosInstance.on('connection', () => setStatus('connected'));
    rosInstance.on('error', () => setStatus('error'));
    rosInstance.on('close', () => setStatus('closed'));

    setRos(rosInstance);

    return () => {
      rosInstance.close();
    };
  }, []);

  return { ros, status };
}

export function useRosTopic<T = any>(
  ros: Ros | null,
  topicName: string,
  messageType: string
): T | null {
  const [message, setMessage] = useState<T | null>(null);

  useEffect(() => {
    if (!ros) return;

    const topic = new Topic({ ros, name: topicName, messageType });
    const handler = (msg: any) => setMessage(msg as T);
    topic.subscribe(handler);

    return () => {
      topic.unsubscribe();
    };
  }, [ros, topicName, messageType]);

  return message;
}

export function usePublisher(ros: Ros | null, topicName: string, messageType: string) {
  return (value: Record<string, unknown>) => {
    if (!ros) return;
    const topic = new Topic({ ros, name: topicName, messageType });
    topic.publish(value as any);
  };
}

