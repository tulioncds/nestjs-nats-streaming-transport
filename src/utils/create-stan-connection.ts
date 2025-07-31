import * as nats from 'nats';
import * as stan from 'node-nats-streaming';
import { TransportConnectOptions } from '../interfaces';
import { Stan } from 'node-nats-streaming';

export const createConnection = async (
  clusterID: string,
  clientID: string,
  connectOptions: TransportConnectOptions,
  onReconnect: (sc: Stan) => void
): Promise<Stan> => {
  const nc = await nats.connect({
    servers: connectOptions.servers,
    encoding: 'binary',
    reconnect: connectOptions.reconnect,
    maxPingOut: connectOptions.maxPingOut,
    maxReconnectAttempts: connectOptions.maxReconnectAttempts,
    reconnectTimeWait: connectOptions.reconnectTimeWait,
    verbose: connectOptions.verbose,
    waitOnFirstConnect: connectOptions.waitOnFirstConnect,
    pingInterval: connectOptions.pingInterval
  });

  let sc = stan.connect(clusterID, clientID, { nc });
  nc.on('reconnect', () => {
    sc = stan.connect(clusterID, clientID, { nc });
    sc.on('connect', () => {
      onReconnect(sc);
    });
  });

  return new Promise((resolve, reject) => {
    sc.on('connect', () => resolve(sc));
    sc.on('error', err => reject(err));
  });
};


