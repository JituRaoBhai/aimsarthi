AimSarthi v4 - hosting and files

SET UP (GitHub Pages, from a phone)
1. Extract this zip. Create a Public GitHub repository, tap Add file > Upload files, select ALL extracted files, commit.
2. Settings > Pages > Deploy from a branch > main > / (root) > Save. Open https://YOUR-USERNAME.github.io/REPO/ and install it from Chrome's menu.
3. For accounts, follow FIREBASE-SETUP.txt. Without it the app still works, saving on each phone only.
After changing any file, reopen the app twice to see the update. The bottom of every screen shows the version.

FILES
exams.js         add a course or topics         strategies.js  add sourced topper entries
plandata.js      topic times by level, 1-month and 2-month times, priority %, foundation order
engine.js        roadmap logic and learning     reminders.js   reminder rules
cloud.js         all Firebase calls             account.js     login, account, feedback screens
firebase-config.js  your Firebase keys          firestore.rules  paste into Firestore Rules
app.js, styles.css, index.html, sw.js, manifest.json  the app itself
