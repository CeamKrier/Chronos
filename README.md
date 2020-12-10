<p align="center"><img src="./internals/img/chronos.svg" alt="Chronos Image" width="400"/></p>

## Chronos

#### A desktop application that tracks screen time/idle time of used processes

[VirusTotal Scan Results](https://www.virustotal.com/gui/file/146cc13ff6497f767ac0b316e48b13615715db772538dbc4dd435f9c09171e66/detection)

## Features 🎨

- **Process Tracking**: Retrieve process information and details about their idle / usage time
- **Pomodoro Alarms:** Enable to get notifications about when to stop/start to work
- **Settings (WIP):** Defines settings related to processes, run on start-up etc.
- **Persistent Data:** Session information persist on your hard-drive
  - File Location:
    - **_Windows_**: `C:\Users\<Username>\AppData\Roaming\Chronos\config.json`
    - **_MacOS_**:
    - **_Linux_**:
- **Historical Session Analitics: (WIP)** Analyze your average screen-time, most used process etc.

## Development

```javascript
# install dependencies
yarn

# start dev environment
yarn dev

# pack the application to release
yarn package
```

## License

[MIT](https://github.com/mrgodhani/rss-reader/blob/master/LICENSE)
