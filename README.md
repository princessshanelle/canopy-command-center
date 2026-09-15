# 🌱 Canopy

Canopy is a cozy personal command center for university life, VERT, applications, learning, focus and intentional media use.

## New: Canopy Buddy 🐾
The mascot is now an interactive companion. You can:
- Feed apples and treats
- Pet it
- Play with it
- Give it water
- Let it sleep
- Talk, cheer and comfort it
- Watch hunger, happiness and energy change
- Earn Care XP and level it up
- Keep a small buddy journal
- See reactions and animated moods

The buddy state is saved locally with the rest of your Canopy data.

## Main features
- Dynamic tasks with dates, times, priorities and subtasks
- Calendar and events
- Application pipeline and requirements
- VERT build log + parts/sensor list
- Focus timer, reflections, streak and heatmap
- Growing mascot and milestones
- LinkedIn idea garden + draft box
- YouTube watch queue + suggestions
- Search
- Local data storage
- JSON export/import backup
- Installable PWA structure
- Responsive laptop/tablet layout

## Install on a tablet
Canopy is a Progressive Web App (PWA). A browser can install it as a home-screen app, but the service worker/install system requires a secure web address (HTTPS) or localhost.

### Easiest free route: GitHub Pages
1. Create a GitHub repository, for example `canopy-app`.
2. Upload **all files in this folder** to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Choose **Deploy from a branch**, select your main branch and `/ (root)`, then save.
5. Open the generated Pages address on your tablet.
6. On Android Chrome: browser menu → **Install app** / **Add to Home screen**.
7. On iPad/iPhone Safari: **Share → Add to Home Screen**.

Once installed, Canopy opens in a standalone app-like window.

### Moving your data
Canopy stores your data locally. On the old device use **Settings → Export backup**, then on the new device use **Import backup**.

## Laptop
For a quick local preview on Windows, run `start_canopy.bat`. For PWA installation, use an HTTPS host such as GitHub Pages.

## Note
This version does not yet use a cloud account, so tasks and buddy progress do not automatically sync between devices. Export/import is included to keep the data portable.

## Fix notes (this pass)
- Sidebar navigation buttons had no click handlers, so Applications, VERT Lab, Focus, **Buddy**, Grow, Watch and Settings were unreachable. Wired up.
- Subtask entry (Tasks and Applications) was splitting on a literal `\n` string instead of a real line break, so multi-line subtasks were saved as one item. Fixed.
- The sidebar's "Canopy level" text never updated. It now reflects the buddy's real level.
- The buddy's hunger/happiness/energy only ever went up — there was no decay, so `petMood()` (meant to reflect a sad/sleepy/happy buddy) was written but never used. Added a small daily decay and wired `petMood()` in as an ambient status check every ~45s.
- Removed a duplicated service-worker registration call and a harmless dead line in the Grow tab.

## This pass: personality, habits, and one bigger buddy
- Added **Duolingo** and **Workout** as task areas, plus a dedicated **Daily habits** card on the Today page with its own streaks.
- Consolidated the mascot to **one place** (the Buddy page) instead of a duplicate on the Home page. It's noticeably **bigger** now, and Home shows a small status teaser that links to it.
- Added **Talk / Cheer / Rest** buttons to the Buddy page (previously only on Home).
- Added a **Customize your buddy** panel: 4 fur colors, plus 5 accessories that unlock from what you actually do — headphones (7-day focus streak), an owl badge (7-day Duolingo streak), a wristband (7-day workout streak), a rocket pin (first submitted application), and a briefcase pin (first LinkedIn draft saved). You can equip up to 3 at once.
- Fixed a real bug where mood, growth-stage, and accessory visuals were all overwriting the same CSS class, so growth stages and accessories kept getting wiped out a few seconds after appearing. They now layer independently.
- Buddy stats now decay gently day to day (previously only ever went up).

## This pass: a new character
Replaced the bear-like design with a small **garden-bot** — a rounded screen-head with glowing teal LED eyes, side antenna panels, a glowing chest "core" light, and a little sprout growing from its antenna. Fits VERT (Versatile Eco-Farming *Robotic* Technology) much better than the old design. All moods, growth stages, accessories, and colors still work exactly as before — only the shape and styling changed, nothing structural.


## Install Canopy on Android phone/tablet
This project is a Progressive Web App, so you do not need to publish it to Google Play to use it like an app.

### 1. Put the project online
Use GitHub Pages (recommended because it gives Canopy an HTTPS address):
1. Sign in to GitHub.
2. Create a new repository, e.g. `canopy-app`.
3. Open the repository and upload these files to the repository root:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `icon-192.png`
   - `icon-512.png`
4. Open the repository's **Settings**.
5. In the left menu, open **Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Select your main branch and **/(root)**, then click **Save**.
8. Wait until GitHub Pages says the site is published.
9. Open the Pages URL on your phone/tablet. It will look like `https://YOUR-USERNAME.github.io/canopy-app/`.

### 2. Install on Android
1. Open the GitHub Pages URL in Chrome.
2. Wait for Canopy to finish loading.
3. Open Chrome's **⋮** menu.
4. Choose **Install app** if it appears.
5. If you see **Add to Home screen** instead, choose that and confirm.
6. Canopy will appear on the home screen like an app.
7. Open it from the new icon. It should launch in standalone app mode rather than as a normal browser tab.

### 3. Install on iPhone/iPad
1. Open the GitHub Pages URL in **Safari**.
2. Tap the **Share** button.
3. Choose **Add to Home Screen**.
4. Keep the name as Canopy (or edit it).
5. Tap **Add**.
6. Open Canopy from the new home-screen icon.

### 4. Important: data does not automatically sync
Canopy currently saves your tasks, buddy progress and other information in the device's local browser storage. Installing it on another device does not automatically copy that data.
- On the old device: **Settings → Export backup**.
- Send the exported JSON backup to the new device.
- On the new device: **Settings → Import backup**.
- Confirm the import.

### 5. Updating Canopy later
When you edit `index.html`, `manifest.json`, `sw.js`, or the icons:
1. Upload/replace the changed files in the GitHub repository.
2. Wait for GitHub Pages to redeploy.
3. Close Canopy completely on your phone/tablet.
4. Reopen it while connected to the internet so the service worker can fetch the new version.
5. If an older version still appears, open the Pages site once in the browser and refresh it, then reopen the installed app.

### 6. What you cannot do with this version
This ZIP is not a native Android APK or iOS App Store package. It is a PWA. That is actually the simplest route for this project because one web version can be installed on Android phones, Android tablets, iPhones and iPads without maintaining separate native apps.

## New: real scheduled device reminders ☁️

This build includes an optional tiny Node backend in `backend/`. It stores reminder dates/times and Web Push subscriptions, then checks every 30 seconds and sends a push notification to registered phones/tablets.

### Run the backend
1. Install Node.js 18+.
2. Open a terminal in `backend/`.
3. Run `npm install`.
4. Run `npm start`.
5. Keep the server running, or deploy it to a Node-friendly host.
6. Open Canopy over HTTPS, go to **Settings → Cloud reminders**, enter the backend URL, and choose **Connect & sync**.
7. Allow notifications when prompted.

The server generates and persists VAPID keys in `backend/data/canopy.json` on first start. Do not commit that file or share it publicly.

**Important:** the backend must remain running for scheduled pushes. Free hosts that sleep/scale to zero can delay reminders. For dependable reminders, use a host that keeps a small Node process running or move the scheduler to a managed cron/edge service.

Canopy still keeps its local data and works without the backend. When connected, tasks with a date and time are mirrored to the backend automatically.

### Tablet-size validation
The layout now has a dedicated tablet breakpoint for roughly 551–1180px:
- Tasks and Applications stay as two-column cards without horizontal overflow.
- VERT and Focus grids collapse gracefully when space gets tighter.
- Grow/Buddy cards keep their controls inside their cards.
- Navigation becomes horizontally scrollable on narrow tablets/phones.
- Calendar cells reduce their height and wrap event labels instead of forcing a wide page.
- Main content removes the desktop max-width constraint on tablets.


## Cloud alarms

See `RENDER_ALARM_SETUP.md` for the required Render configuration for reliable alarms while Canopy is closed.
