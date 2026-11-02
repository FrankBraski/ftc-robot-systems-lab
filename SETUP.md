# Teacher setup: class progress tracking

Students sign in with Google. Each save goes to a Google Sheet that only you own, and the site's
**Class dashboard** (visible only to teacher accounts) reads it back.

```
Student browser ──(Google sign-in token + progress)──▶ Apps Script web app ──▶ Your Google Sheet
                                                         │
                                       checks the token with Google, so students can only write their own row
```

Setup takes about 15 minutes and has three parts. You only do it once.

---

## Part A: Get a Google sign-in Client ID

1. Go to <https://console.cloud.google.com/> and sign in with your teacher Google account.
2. Create a project (project picker at the top, then **New project**). Name it `Robot Systems Lab`.
3. Open **APIs & Services → OAuth consent screen** (also labeled **Google Auth Platform**). Click **Get started**.
   - App name: `Robot Systems Lab`
   - User support email: your email
   - Audience: **External**
   - Contact email: your email
   - Agree and **Create**.
4. Go to **Audience** and click **Publish app** so it is **In production**. Without this, only listed "test users" can sign in.
   This app only asks for name and email, so Google does not require a review.
5. Go to **Clients → Create client**.
   - Application type: **Web application**
   - Name: `Robot Systems Lab site`
   - **Authorized JavaScript origins → Add URI:** `https://frankbraski.github.io` (exactly this, with no trailing slash and no path)
   - Click **Create** and copy the **Client ID**. It ends in `.apps.googleusercontent.com`.

## Part B: Create the class Sheet and its script

1. Create a new Google Sheet. Name it something like `Robot Systems Lab: Class Progress`.
2. In the Sheet: **Extensions → Apps Script**.
3. Delete everything in `Code.gs` and paste in the contents of
   [`apps-script/Code.gs`](apps-script/Code.gs) from this repository.
4. At the top of the script, fill in:
   - `CLIENT_ID`: the Client ID from Part A
   - `TEACHER_EMAILS`: your Google email, in lowercase, e.g. `['you@gmail.com']`. Add co-coaches if you like.
5. Click **Save**. In the function menu, choose **setup**, then click **Run**.
   Google asks you to authorize. Choose your account, then **Advanced → Go to … (unsafe) → Allow**.
   The warning appears because the script is yours and unreviewed; it only touches this Sheet.
   A `Progress` tab with column headers appears in the Sheet.
6. Click **Deploy → New deployment**, click the gear icon, and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.

"Anyone" is required so students' browsers can reach it. The script still rejects any request
without a valid Google sign-in for this site, students can only write their own row, and only
emails in `TEACHER_EMAILS` can read the class list.

## Part C: Connect the site

Open `index.html`, find this near the top of the `<script>`, and paste in your two values:

```js
const CLASS={
  clientId:'',   // Google OAuth Client ID, ends in .apps.googleusercontent.com
  endpoint:''    // Apps Script web app URL, ends in /exec
};
```

Commit and push. Within a minute or two, the site shows **Sign in with Google**.
Sign in yourself first: you should see **Class dashboard** in the left menu.

---

## Good to know

- **School Google accounts:** if students use a school Google Workspace account, the school's
  admin may block sign-in to apps they haven't approved ("Access blocked"). Ask your admin to allow
  the app (Admin console → Security → API controls → App access control), or have students use
  another account.
- **What's stored:** each student's email, name, last-saved time, per-module status, and quiz
  answers. Nothing else. Delete a row to remove a student.
- **The Sheet is the source of truth.** Sort and filter it however you like, but don't edit the
  last column (progress data). The site rewrites a student's row each time they save.
- **Changing the script later:** edit the code, then **Deploy → Manage deployments → Edit (pencil) →
  Version: New version → Deploy**. The URL stays the same.
- **Sign-in lasts 1 hour.** After that, the page asks students to sign in again. Anything they do in the
  meantime is kept in the browser and saved on their next sign-in.
- **Not tamper-proof:** a determined student could edit their own row through the browser's developer tools.
  It is a progress tracker, not a secure exam.
