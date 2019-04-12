import { LimitReset } from '@app/model/common';

export interface Todo {

  id: string;
  name: string;
  resets: LimitReset;
  icon: string;
  items: TodoItem[];
  lastReset: number;
  lastUpdate: number;

}

export interface TodoItem {

  checked: boolean;
  value: string;

}
