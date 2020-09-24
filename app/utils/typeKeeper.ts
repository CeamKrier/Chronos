export interface Process {
  windowPid: number;
  windowName: string;
  windowClass: string;
  os: 'windows' | 'macos' | 'linux';
  idleTime: number;
  usageTime: number;
}
