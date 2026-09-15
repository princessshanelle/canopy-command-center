# Canopy cloud alarm setup

This version makes scheduled alarms work for Tasks, Calendar Events, and Application deadlines, including when the Canopy page is closed.

## Why the Render service must stay awake

The alarm scheduler runs in the Node backend and checks due reminders every 10 seconds. A free Render web service can spin down after 15 minutes without inbound traffic, so it cannot be used as a reliable alarm clock. The service also has an ephemeral filesystem on the free plan.

For reliable cloud alarms:

1. Open the existing Canopy Render web service.
2. Change the Compute plan from **Free** to the smallest paid web-service plan you are comfortable using.
3. Open **Disks** and add a persistent disk.
4. Use mount path: `/var/data`.
5. Use the smallest disk size that fits your needs (1 GB is plenty for this small app).
6. Add this environment variable:
   - `DATA_DIR` = `/var/data`
7. Keep `VAPID_CONTACT` as it is.
8. Deploy the updated backend.

The persistent disk keeps the reminder database and generated VAPID keys across restarts and deploys. Render documents that free web services spin down after 15 minutes of inactivity and lose local filesystem changes, while persistent disks are available for paid web services.

## Frontend setup

Replace `index.html` and `sw.js` in the GitHub Pages repository with the files in this package.

Then open Canopy once on the tablet:

1. Go to **Settings**.
2. Enable notifications.
3. Enter the Render backend URL.
4. Press **Connect & sync**.
5. Press **Send test notification**.
6. Create a test task/event/application with an alarm time a few minutes in the future.
7. Close Canopy and wait for the alarm.

## What gets an alarm

- Tasks with a date and time.
- Calendar events (events without a time use 09:00).
- Application deadlines (the application editor has an alarm-time field, default 09:00).
- Manual reminders.

The notification contains the actual subject, such as:

**Canopy Alarm**

`Application deadline: University Scholarship`

The notification is persistent where supported, can vibrate where supported, and has Open Canopy and Dismiss actions. Browser/OS notification permissions and device settings still control the final sound/vibration behavior.
