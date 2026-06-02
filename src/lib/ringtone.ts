import { registerPlugin } from '@capacitor/core';

export interface RingtonePlugin {
  setRingtone(options: { path: string }): Promise<void>;
}

const Ringtone = registerPlugin<RingtonePlugin>('Ringtone');

export default Ringtone;
