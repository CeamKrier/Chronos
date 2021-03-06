import { Result as ActiveWinResultType } from 'active-win';

type UsageMetricsType = {
  usageTime: number;
  idleTime: number;
};

export type ProcessType = ActiveWinResultType & UsageMetricsType;

// export interface ProcessType {
//   windowPid: number;
//   windowName: string;
//   windowClass: string;
//   os: 'windows' | 'macos' | 'linux';
//   idleTime: number;
//   usageTime: number;
// }

export interface SettingsType {
  isDrawerOpen?: boolean;
  preferences: SettingPreferenceType;
}

export interface SettingPreferenceType {
  launchAtBoot: boolean;
  isPomodoroEnabled: boolean;
  pomodoroWorkLimit: number;
  pomodoroBreakLimit: number;
  pomodoroLongBreakLimit: number;
}

export interface PomodoroTrackerType {
  work: {
    isActive: boolean;
    iteration: number;
    totalTime: number;
  };
  break: {
    isActive: boolean;
    iteration: number;
    totalTime: number;
  };
}

export interface DailyProcessSessionType {
  [dateKey: string]: {
    processes: Array<ProcessType>;
    screenTime: number;
    pomodoroTracker: PomodoroTrackerType;
  };
}

export interface StoreType {
  dailySessions: DailyProcessSessionType;
  settings: SettingsType;
}

export interface ConfirmationDialogTypes {
  isDialogOpen?: boolean;
  title: string;
  message: string;
  actionType: 'info' | 'question' | 'warning';
  dialogConfirmedOrRejected?: boolean | undefined;
}
export interface ProcessUsageBarType {
  usageTime: number;
  idleTime: number;
  style?: React.CSSProperties;
  type: 'summary' | 'historic';
}

export type TotalProcessUsageType = {
  [key: string]: {
    idleTime: number;
    usageTime: number;
    daysOfUsage: number;
    name: string;
    sessions: Array<{
      idleTime: number;
      usageTime: number;
      date: string;
    }>;
  };
};
