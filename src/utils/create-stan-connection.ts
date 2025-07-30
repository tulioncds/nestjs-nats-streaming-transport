import * as nats from 'nats';
import * as stan from 'node-nats-streaming';
import { TransportConnectOptions } from '../interfaces';
import { Stan } from 'node-nats-streaming';
import { generate } from 'shortid';

export const createConnection = async (
  clusterID: string,
  clientID: string,
  connectOptions: TransportConnectOptions,
): Promise<Stan> => {
  const nc = await nats.connect({
    servers: connectOptions.servers,
    reconnect: connectOptions.reconnect,
    maxPingOut: connectOptions.maxPingOut,
	  maxReconnectAttempts: connectOptions.maxReconnectAttempts,
    reconnectTimeWait: connectOptions.reconnectTimeWait,
    verbose: connectOptions.verbose,
    waitOnFirstConnect: connectOptions.waitOnFirstConnect,
    pingInterval: connectOptions.pingInterval
  });
  const sc = stan.connect(clusterID, clientID + '-' + generate(), { nc });
  return new Promise((resolve, reject) => {
    sc.on('connect', () => resolve(sc));
    sc.on('error', err => reject(err));
  });
};


