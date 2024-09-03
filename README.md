### Task 1 - Identify and fix the issue with getCatsInfo API
The getCatsInfo API works fine for the first few requests, but after a few requests, it stops responding. Your task is to identify the root cause of this issue and implement a fix. Additionally, you should document the reason for the issue and the fix applied in the README.md file,along with list of files changed.

## Accepentance Criteria
- The getCatsInfo API should work without any issues for any number of requests.
- The fix and list of files changed should be documented in the README.md
- If you have any additional suggestions (or) best practices, please document them as well in README.md

# Changes Made:
    - getCatsWorker.js
        - line 8 'data.value.key' changed to 'data.key'
        - line 23 'setTimeout(() => refreshToken(data), 5000);' changed to 'setInterval(() => refreshToken(data), 5000);'
# Cause:
    - The issue was caused by the 'refreshToken' function passing 'data.value.key' as a parameter to 'invokeTokenService' function instead of 'data.key'.
        'data.value' is not defined so this causes an error.
        refreshToken() throws an error if token refresh fails, but doesn't handle what happens afterwards.
        Since the error remains unhandled, it leads to an abrupt connection reset as seen by the bug described above ie. API stops responding.

# Solution + Suggestions:
    - The solution is to change 'data.value.key' to 'data.key' to fix the bug.
        Error handling is also suggested to prevent future issues as well as make debugging easier.
    - The 'refreshToken' function is meant to refresh the token every 5 seconds to prevent expiry.
        But the refreshToken function is only called once within the 'generateToken' function using setTimeout.
        To properly refresh the token every 5 seconds continously (until worker has been terminated) the setTimeout in line 23 should be changed to setInterval
        'setTimeout(() => refreshToken(data), 5000);' changed to 'setInterval(() => refreshToken(data), 5000);'
        This will properly refresh the token every 5 seconds.
    - Highly recommend using jwt (jsonwebtoken) for tokens as it is (basically) internet standard.
# Todo:
    - Uncomment setInterval(() => refreshToken(data), 5000);  inside generateToken function
        - Commented because it's easier to work on the next tasks