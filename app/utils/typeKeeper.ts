export interface ProcessType {
  windowPid: number;
  windowName: string;
  windowClass: string;
  os: 'windows' | 'macos' | 'linux';
  idleTime: number;
  usageTime: number;
}

export interface SettingsType {
  launchAtBoot: boolean;
  alertInfo: {
    enabled: boolean;
    limit: number;
  };
}

export interface DailyProcessSessionType {
  [dateKey: string]: {
    processes: Array<ProcessType>;
    screenTime: number;
  };
}

export interface StoreType {
  dailySessions: DailyProcessSessionType;
  settings: SettingsType;
}
