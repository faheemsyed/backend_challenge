# Task 1 - Identify and fix the issue with getCatsInfo API
The getCatsInfo API works fine for the first few requests, but after a few requests, it stops responding. Your task is to identify the root cause of this issue and implement a fix. Additionally, you should document the reason for the issue and the fix applied in the README.md file,along with list of files changed.
### Accepentance Criteria
- The getCatsInfo API should work without any issues for any number of requests.
- The fix and list of files changed should be documented in the README.md
- If you have any additional suggestions (or) best practices, please document them as well in README.md

### Changes Made:
    - getCatsWorker.js
        - line 8 'data.value.key' changed to 'data.key'
        - line 23 'setTimeout(() => refreshToken(data), 5000);' changed to 'setInterval(() => refreshToken(data), 5000);'
### Cause:
    - The issue was caused by the 'refreshToken' function passing 'data.value.key' as a parameter to 'invokeTokenService' function instead of 'data.key'.
        'data.value' is not defined so this causes an error.
        refreshToken() throws an error if token refresh fails, but doesn't handle what happens afterwards.
        Since the error remains unhandled, it leads to an abrupt connection reset as seen by the bug described above ie. API stops responding.
### Solution + Suggestions:
    - The solution is to change 'data.value.key' to 'data.key' to fix the bug.
        Error handling is also suggested to prevent future issues as well as make debugging easier.
    - The 'refreshToken' function is meant to refresh the token every 5 seconds to prevent expiry.
        But the refreshToken function is only called once within the 'generateToken' function using setTimeout.
        To properly refresh the token every 5 seconds continously (until worker has been terminated) the setTimeout in line 23 should be changed to setInterval
        'setTimeout(() => refreshToken(data), 5000);' changed to 'setInterval(() => refreshToken(data), 5000);'
        This will properly refresh the token every 5 seconds.
    - Highly recommend using jwt (jsonwebtoken) for tokens as it is (basically) internet standard.
### Todo:
    - Uncomment setInterval(() => refreshToken(data), 5000);  inside generateToken function
        - Commented because it's easier to work on the next tasks




# Task 2 - Add correlationId header to all the requests and response
In order to track the requests, we would need a correlationId header in all the requests and response.
- Validate every incoming request
- Since the users of the API can pass correlationId header, if its passed use that, else generate a new id
- Add the correlationId header to response headers as well.
- Document the list of files changed in the README.md.
### Accepentance Criteria
- All the requests and response should have correlationId header.
- Document the list of files changed in the README.md

### Changes Made:
    - package.json
        - Added dependency on uuid package.
    - index.js
        - Added fastify onRequest hook and logic to attach correlationId to response header + Generate new correlationId if needed.
        - Updated routes to pass correlationId to worker.
    - getCatsWorker.js
        - Updated response to track correlationId and send back to parent with requested API data
    - getDogsWOrker.js
        - Updated response to track correlationId and send back to parent with requested API data
### Solution + Suggestions:
    - correlationId is requested in the header to track/log all the incoming requests and reply with the same correlationId. To do this we will need to add a 'onRequest' hook.
        According to Fastify's documentation it looks like the 'onRequest' hook is called as soon as Fastify receives the request, before any other processing takes place.
        If the correlationId is present we will attach it to the response header.
        If the correlationId is NOT present we will generate it using uuid library and attach it to the header.
        The correlationId will be passed to the API calls (/getCatsInfo, /getDogsInfo) to track the response.
### Todo: (ALL COMPLETE - EXCEPT MOCHA CHAI TESTING)
    - Creat fastify 'onRequest' hook in index.js
        if(request.headers.correlationId)
            attach to response header
        else
            generate correlationId using uuid
            attach to response header
    - For getCatsInfo route send correlationId to getCatsWorker.
    - For getDogsInfo route send correlationId to getDogsWorker.

    - In getCatsInfo.js include correlationId in the API response and the error handling
    - In getDogsInfo.js include correlationId in the API response and the error handling

    - Add Mocha Chai auto testing if I have time




# Task 3 - Terminate the idle worker and recreate when needed
Worker threads are used to process the requests. If the worker thread is idle i.e., any API haven't received the requests in last 15 minutes, it should be terminated. Generate a new worker when a new request comes.
- Implement the logic to terminate the worker thread if it is idle for 15 minutes.
- Create a new worker thread whenever a new request comes.
- Log the worker thread termination and creation in the console.
### Accepentance Criteria
- Worker thread should be terminated if it is idle for 15 minutes.
- Whenever a new request comes, a new worker thread should be created.
- Logs should be printed in the console for worker thread termination and creation.
- Explain the approach and document the list of files changed in the README.md

### Changes Made:
    - index.js
        - /getCatsInfo
        - /getDogsInfo
    - generateNewWorker.js
        - Added 'terminateIdleWorkers' inside 'generateNewWorker' function with setInterval to repeatedly check if worker needs to be terminated.
        - Added 'lastActivity' property to monitor worker idletime.
        - Added logic to clear setInterval after worker is terminated.
        - Added logs for when worker is created or terminated.
### Solution + Suggestions:
    - The request is to terminate a worker thread if it's been idle for 15 minutes. To do this we will set an interval in generateNewWorker function to run every few minutes to check workers idletime.
        If the worker has been idle for 15 minutes or longer we'll use worker.terminate() and kill the thread. We will need to add a property to the worker to monitor its idle time.
        On creation of the worker or when the worker is used (/getCatsInfo or /getDogsInfo routes are used) we'll update/refresh the idle time.
        After a worker is terminated we'll need to make sure the setInterval is cleared to prevent an infinite loop.
        If the route is used after the worker is terminated, we will need to create the worker again. This logic will probably have to be in index.js
        Finally, we'll need to log the creation and termination of all workers.
### Todo: (ALL COMPLETE)
    - index.js
        - /getCatsInfo route check to see if worker has been terminated (getCatsWorker.threadId === -1) then generateNewWorker('getCatsWorker');
        - /getDogsInfo route check to see if worker has been terminated (getDogsWorker.threadId === -1) then generateNewWorker('getDogsWorker');
    generateNewWorker.js
        - Log the creation of a new worker in console.
        - Create lastActivity property for worker and set to Date.now()
        - Every time worker receives message update lastActivity property to refresh idletime
        - Create terminateIdleWOrkers function to terminate workers that have been idle for >= 15 mins.
            - Create logic in terminateIdleWOrkers to use setInterval and check if worker needes to be terminated every (1 minute?).
            - Log the termination of a worker in console.
        - Create logic for worker on 'exit' to clear setInterval after worker is terminated to prevent the logic running even after worker.terminate().