// How the control room talks to the 3 screens.
// A BroadcastChannel is a built-in browser "radio station": every page of this site
// that tunes in to the same name hears the messages, whether it is an iframe inside a
// MacBook or a screen you opened in its own tab ("Open full size").
import { useEffect, useState } from 'react';
import type { SimState } from './types';

const CHANNEL = 'solarskin-simulator';

type Message = { type: 'state'; state: SimState } | { type: 'hello' };

/** Control room side: send the state, and answer screens that just opened ("hello"). */
export function startBroadcasting(getState: () => SimState) {
  const channel = new BroadcastChannel(CHANNEL);
  const send = () => channel.postMessage({ type: 'state', state: getState() } satisfies Message);
  channel.onmessage = (e: MessageEvent<Message>) => {
    if (e.data.type === 'hello') send();
  };
  return { send, close: () => channel.close() };
}

/** Screen side: the latest simulation state (null until the control room answers). */
export function useSimState() {
  const [state, setState] = useState<SimState | null>(null);
  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (e: MessageEvent<Message>) => {
      if (e.data.type === 'state') setState(e.data.state);
    };
    channel.postMessage({ type: 'hello' } satisfies Message);
    return () => channel.close();
  }, []);
  return state;
}
