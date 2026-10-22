# DailyHelper MVP

A responsive, beginner-friendly daily organizer that runs in a web browser. This first MVP includes tasks, expense tracking in Kenyan shillings, and notes. It uses browser `localStorage`, so saved data stays in the current browser on the current device.

## Run it

1. Download and extract `dailyhelper-mvp.zip`.
2. Open the extracted folder.
3. Double-click `index.html` to open the app in a modern browser.

No Node.js, installation, account, or API key is required for this first version. An internet connection is only needed to load the optional Google Fonts; the app's core features work without them.

## Features

- Add, complete, filter, and delete tasks; optionally set a due date.
- Add and delete expenses with a category, date, and amount in KSh.
- Add, edit, and delete notes.
- Dashboard summaries for open/completed tasks, current-month spending, notes, and recent expenses.
- Responsive layout for mobile and desktop.
- Data persists between visits in the same browser using localStorage.

## Important limitations of this MVP

- There is no user login or cloud database yet.
- Data does not automatically sync across devices or browsers.
- Browser data can be lost if site data is cleared. Export/backup is not yet included.
- Reminders are currently represented by task due dates; scheduled push notifications are not implemented.
- This MVP has not been independently security-audited or production-tested.

## Suggested next steps

1. Test the main flows on desktop and mobile.
2. Add Supabase authentication and a database for secure, cross-device sync.
3. Add reminder notifications and a backup/export feature.
4. Deploy the static frontend to a hosting provider such as Vercel or Netlify.
5. Add automated tests and review security/privacy before a public launch.
