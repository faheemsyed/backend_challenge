const { Worker } = require('worker_threads');
const path = require('path');
const requestTracker = require('./requestTracker');

const generateNewWorker = (workerName) => {
  console.log(`Creating new ${workerName}`);
  const worker = new Worker(path.join(__dirname, '../workers', workerName));
  worker.lastActivity = Date.now(); // Monitor how long worker is idle

  worker.on('message', (data) => {
    const { response, requestId } = data;
    requestTracker[requestId](response);
    delete requestTracker[requestId];
    worker.lastActivity = Date.now(); // update last activity
  });
  worker.on('error', () => {
    console.error(`Worker ${workerName} encountered an error. Terminating worker`);
    worker.terminate();
  });

  const terminateIdleWorkers = () => {
    const intervalId = setInterval(() => {
      if (Date.now() - worker.lastActivity >= 15 * 60 * 1000) { // Compare if worker has been idle for 15 minutes or longer
        console.log(`Terminating idle worker: ${workerName}`);
        worker.terminate();
      }
    }, 30 * 1000); // Check every minute

    // Clear the interval after worker is terrminated
    worker.on('exit', () => {
      clearInterval(intervalId);
      console.log(`Stopped idle check for worker: ${workerName}`);
    })
  };

  terminateIdleWorkers();
  return worker;
}

module.exports = generateNewWorker;