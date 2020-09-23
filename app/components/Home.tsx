import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';
import { ipcRenderer } from 'electron';

export default function Home(): JSX.Element {
  
  const [currentProcess, setCurrentProcess] = useState<any>() 

  useEffect(() => {
    handleStartObserver()
    return handleStopObserver
  }, [])

  ipcRenderer.on('activeProcess', (event, data) => {
    console.log('Message received');
    console.log(data)
    setCurrentProcess(data);
  });

  const handleStopObserver = () => {
    ipcRenderer.send('stopObserving')
  }

  const handleStartObserver = () => {
    ipcRenderer.send('startObserving')
  }

  return (
    <div className={styles.container} data-tid="container">
      <h2>Home</h2>
      <Link to={routes.COUNTER}>to Counter</Link>
      <button onClick={handleStopObserver}>Stop Observing</button>
      <button onClick={handleStartObserver}>Start Observing</button>
      <div>
        {JSON.stringify(currentProcess)}
      </div>
    </div>
  );
}
