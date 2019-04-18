import { LimitReset } from './common.model';

export interface Goal {

  id: string;
  target: number;
  icon: string;
  name: string;
  resets: LimitReset;
  lastReset: number;
  lastUpdate: number;
  items: GoalItem[];

}

export interface GoalItem {

  value: number;
  memo?: string;

}
