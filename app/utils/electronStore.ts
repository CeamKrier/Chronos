import Store from 'electron-store';
import { Process } from './typeKeeper';

interface StoreType {
  [key: string]: {
    processes: Array<Process>;
    screenTime: number;
  };
}

const config: {
  store: Store<StoreType> | undefined;
} = {
  store: undefined,
};

export default function () {
  if (!config.store) {
    config.store = new Store();
  }
  return config.store;
}

export const AddNewProcessToStorage = (key: string, payload: Process) => {
  const oldSession = config.store?.get(key);
  if (!oldSession) {
    config.store?.set(key, {
      processes: [payload],
      screenTime: 0,
    });
  } else {
    oldSession.processes.push(payload);
    config.store?.set(key, oldSession);
  }
};

export const UpdateProcessUsageTimeInStorage = (
  key: string,
  payload: { sessionIndex: number; usageTime: number }
) => {
  const oldSession = config.store?.get(key);
  if (!oldSession) {
    return;
  }
  oldSession.screenTime += 1;
  oldSession.processes[payload.sessionIndex].usageTime = payload.usageTime;
  config.store?.set(key, oldSession);
};

export const UpdateProcessIdleTimeInStorage = (
  key: string,
  payload: { sessionIndex: number; idleTime: number }
) => {
  const oldSession = config.store?.get(key);
  if (!oldSession) {
    return;
  }
  oldSession.screenTime += 1;
  oldSession.processes[payload.sessionIndex].idleTime = payload.idleTime;
  config.store?.set(key, oldSession);
};

// const f = {
//   '19-02-1995': {
//     processes: [
//       {
//         windowPid: '123',
//         windowName: 'asd.exe',
//         windowClass: 'ass.eexe',
//         os: 'win',
//         idleTime: '23',
//         usageTime: '34',
//       },
//     ],
//     screenTime: '123',
//   },
// };

// const schema = {
//   type: 'object',
//   default: {},
//   patternProperties: {
//     ['^[0-9]{4}[-]{1}[0-9]{2}[-]{1}[0-9]{2}']: {
//       type: 'object',
//       default: {},
//       properties: {
//         processes: {
//           type: 'array',
//           default: [],
//           items: {
//             $ref: '#/definitions/process',
//           },
//         },
//         screenTime: {
//           type: 'integer',
//           default: 0,
//         },
//       },
//       definitions: {
//         process: {
//           type: 'object',
//           default: {},
//           required: [
//             'windowPid',
//             'windowName',
//             'windowClass',
//             'os',
//             'idleTime',
//           ],
//           properties: {
//             windowPid: {
//               type: 'string',
//               default: '',
//             },
//             windowName: {
//               type: 'string',
//               default: '',
//             },
//             windowClass: {
//               type: 'string',
//               default: '',
//             },
//             os: {
//               type: 'string',
//               enum: ['windows', 'macos', 'linux'],
//             },
//             idleTime: {
//               type: 'integer',
//               default: 0,
//             },
//             usageTime: {
//               type: 'integer',
//               default: 0,
//             },
//           },
//         },
//       },
//     },
//   },
// };
