AimSarthi - free hosting on GitHub Pages (works from a phone)

SET UP
1. Extract this zip (Files by Google: tap it, then Extract).
2. In Chrome open github.com and sign in. Create a Public repository named aimsarthi (free accounts need Public for Pages).
3. Add file > Upload files. Select ALL extracted files and commit. (To update later, upload the changed files again.)
4. Settings > Pages > Deploy from a branch > main > / (root) > Save. Wait a few minutes.
5. Open https://YOUR-USERNAME.github.io/aimsarthi/ in Chrome, menu > Install app. Share the link with friends.

FILES (where to change things later)
- exams.js       Add a course or topics: add an entry; t = { 'Subject': ['Topic', ...] }.
- strategies.js  Add sourced topper strategies. Never add what you cannot cite. verified:true only after you checked the source.
- reminders.js   Reminder rules (shared by the app and the service worker).
- app.js         App logic and screens.   styles.css  Look and feel.
- sw.js          Offline support and background reminders. manifest.json  Install details.
After editing, upload the changed files and reopen the app twice to see the update.

NOTES
- Each person's plan is saved only in the browser on their own phone.
- Reminders: allow notifications in Study reminders (Progress tab). Background reminders need Chrome on Android with the app installed; the browser picks the exact time.
