import { LimitReset } from '@app/model/common';

export interface Counter {

  id: string;
  name: string;
  limit: number;
  resets: LimitReset;
  icon: string;
  value: number;
  lastReset: number;
  lastUpdate: number;

}
