/**
 * Robot Systems Lab: class progress backend.
 *
 * Paste this into the Apps Script editor of a Google Sheet
 * (Extensions > Apps Script), fill in the two settings below,
 * then Deploy > New deployment > Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * See SETUP.md in the repository for the full walkthrough.
 */

// ---- Settings -------------------------------------------------------------
// The OAuth Client ID from Google Cloud (ends in .apps.googleusercontent.com).
const CLIENT_ID = 'PASTE-YOUR-CLIENT-ID.apps.googleusercontent.com';
// Google accounts that may open the Class dashboard. Lowercase.
const TEACHER_EMAILS = ['teacher@example.com'];
// ---------------------------------------------------------------------------

const SHEET_NAME = 'Progress';
const MODULES = [
  ['chassis', '01 Chassis'], ['drivetrain', '02 Drivetrain'], ['intake', '03 Intake'],
  ['shooter', '04 Shooter'], ['autonomous', '05 Autonomous'], ['starts', '06 Starting Positions'],
  ['vision', '07 Computer Vision'], ['apriltags', '08 AprilTags']
];
const HEADERS = ['Email', 'Name', 'Last saved', 'Overall %']
  .concat(MODULES.map(m => m[1]))
  .concat(['Progress data (do not edit)']);
const COL_JSON = HEADERS.length;

function doGet() {
  return json({ ok: true, service: 'robot-systems-lab' });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'bad_request' }); }

  const who = verifyGoogleToken(req.idToken);
  if (!who) return json({ ok: false, error: 'auth' });
  const isTeacher = TEACHER_EMAILS.map(s => s.toLowerCase()).indexOf(who.email) !== -1;
  const sh = getSheet();

  if (req.action === 'load') {
    const row = findRow(sh, who.email);
    const progress = row ? safeParse(sh.getRange(row, COL_JSON).getValue()) : null;
    return json({ ok: true, isTeacher: isTeacher, progress: progress,
                  sheetUrl: isTeacher ? SpreadsheetApp.getActiveSpreadsheet().getUrl() : '' });
  }

  if (req.action === 'save') {
    const progress = req.progress || {};
    const summary = req.summary || {};
    const mods = summary.modules || {};
    const data = JSON.stringify(progress);
    if (data.length > 45000) return json({ ok: false, error: 'too_large' });
    const values = [who.email, who.name, new Date(), Number(summary.overall) || 0]
      .concat(MODULES.map(m => String(mods[m[0]] || '').slice(0, 40)))
      .concat([data]);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const row = findRow(sh, who.email) || sh.getLastRow() + 1;
      sh.getRange(row, 1, 1, values.length).setValues([values]);
    } finally {
      lock.releaseLock();
    }
    return json({ ok: true });
  }

  if (req.action === 'roster') {
    if (!isTeacher) return json({ ok: false, error: 'forbidden' });
    const last = sh.getLastRow();
    const rows = last < 2 ? [] : sh.getRange(2, 1, last - 1, COL_JSON).getValues()
      .filter(r => r[0])
      .map(r => ({ email: r[0], name: r[1], progress: safeParse(r[COL_JSON - 1]) }));
    return json({ ok: true, rows: rows });
  }

  return json({ ok: false, error: 'unknown_action' });
}

// Ask Google to confirm the sign-in token is real, unexpired, and issued for this site.
function verifyGoogleToken(token) {
  if (!token) return null;
  const res = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token),
                                { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return null;
  const t = JSON.parse(res.getContentText());
  if (t.aud !== CLIENT_ID) return null;
  if (String(t.email_verified) !== 'true') return null;
  if (Number(t.exp) * 1000 < Date.now()) return null;
  return { email: String(t.email).toLowerCase(), name: t.name || '' };
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

function findRow(sh, email) {
  const last = sh.getLastRow();
  if (last < 2) return 0;
  const emails = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < emails.length; i++) {
    if (String(emails[i][0]).toLowerCase() === email) return i + 2;
  }
  return 0;
}

function safeParse(s) {
  try { return s ? JSON.parse(s) : null; } catch (e) { return null; }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Run this once from the editor (select "setup", press Run) to create the sheet
// and approve permissions before deploying.
function setup() {
  getSheet();
  UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=x', { muteHttpExceptions: true });
}
