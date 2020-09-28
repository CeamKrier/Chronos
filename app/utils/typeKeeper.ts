export interface ProcessType {
  windowPid: number;
  windowName: string;
  windowClass: string;
  os: 'windows' | 'macos' | 'linux';
  idleTime: number;
  usageTime: number;
}

export interface StoreType {
  [key: string]: {
    processes: Array<ProcessType>;
    screenTime: number;
  };
}
