AimSarthi — free hosting on GitHub Pages with optional Firebase accounts

WHAT'S NEW IN v4
- Plans are built with hard caps: no day can ever exceed 80% of the hours you told
  AimSarthi you have. Sundays are mock days, Saturdays are spaced revision. Sessions
  are split into 20–90 minute blocks so a 4-hour day is 3 real sessions, not one 4-hour blob.
- The generator learns from topper entries. It reads EVERY sourced entry for the exam you
  picked, takes the median hours/day and median months, the most-cited resources, and the
  revision cadence, and only uses them if enough entries exist (see "How this roadmap was
  built" card in the Roadmap tab). One entry is never trusted on its own.
- Rajasthan 2nd Grade English Teacher exam added with Hindi topic names.
- Optional Firebase accounts: username + password + favourite-number question.
  Account card at the top of the Library tab (change password, recovery email, favourite number).
- "Report a problem or suggestion" button sends a message straight to your Firestore.

SET UP — 1: Host on GitHub Pages
1. Extract this zip.
2. github.com → sign in → New public repository → name it aimsarthi → Create.
3. Add file → Upload files → select ALL files → Commit.
4. Settings → Pages → Source: Deploy from a branch → main → / (root) → Save. Wait ~2 min.
5. Open https://YOUR-USERNAME.github.io/aimsarthi/ in Chrome → menu → Install app.

SET UP — 2: Turn on Firebase accounts (optional but recommended)
1. console.firebase.google.com → Add project → name it (e.g. aimsarthi).
2. In the project: Authentication → Get started → Sign-in method → Email/Password → Enable.
3. Firestore Database → Create database → Production mode → pick a region.
4. Firestore → Rules → paste the rules below → Publish.
5. Project settings (gear) → Your apps → Web (</>) → register app → copy the config object.
6. Paste those values into firebase-config.js (replacing the PASTE_ placeholders).
7. Upload firebase-config.js to GitHub (or just re-upload all changed files).

FIRESTORE SECURITY RULES (paste in Firestore → Rules → Publish)

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /{doc=**} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
    match /usernames/{name} {
      // Public read is needed so "forgot password" can find your recovery email.
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
      allow update, delete: if request.auth != null && resource.data.uid == request.auth.uid;
    }
    match /reports/{id} {
      allow create: if true;                 // anyone may send a report
      allow read, update, delete: if false;  // only you (Admin SDK) can read them
    }
  }
}

READING USER DATA FROM YOUR DEVELOPER APP
Every signed-in user writes a summary at:
  users/{uid}/meta/summary
containing username, exam, examDate, daysUsed, streak, tasksDone, tasksPartial,
tasksTotal, plannedMins, studiedMins, topperEntries, lastSeen, version.
The client SDK cannot read other users' documents (the rules above block it). To read
them from your own developer tool, use the Firebase Admin SDK with a service account,
or temporarily relax the rules — never ship relaxed rules to users.

Reports you receive are in the `reports` collection: kind, message, username, uid,
createdAt, userAgent, language, page path.

FILES (where to change things later)
- exams.js           Add a course or topics: add an entry; t = { 'Subject': ['Topic', ...] }.
- strategies.js      Add sourced topper strategies. Never add what you cannot cite.
                     verified:true only after you checked the source.
- auth.js            Accounts, profile changes, reports.
- firebase-config.js Your Firebase project config.
- reminders.js       Reminder rules (shared by the app and the service worker).
- app.js             App logic, plan generator and topper-learning layer.
- styles.css         Look and feel.        sw.js   Offline cache + background reminders.
- manifest.json      Install details.

NOTES
- Users who never sign in get the app exactly as before: everything saved in their browser only.
- The favourite number is stored as a SHA-256 hash, never in plain text.
- Reminders: allow notifications in Progress → Study reminders. Background reminders need
  Chrome on Android with the app installed; the browser picks the exact time.
- After editing any file, upload it to GitHub and open the app twice to see the update.