# Guestbook moderation

## What changed
- New stamps go to `guestbook_pending/` in Firebase (public write-allowed, but only for new entries).
- Only approved stamps (in `guestbook/`) appear in the public gallery.
- The submitter sees their own pending stamp immediately (tracked via localStorage `gb-my-pending`, marked "pending" with a dashed outline).
- Admin mode unlocks approve/reject on pending and delete on approved.

## Admin activation
1. Draw the pattern on the guestbook stamp grid: outer ring black, ring white, ring orange, ring white, 2x2 blue center.
2. Type `sammy001` in the name field.
3. Click Stamp. Instead of submitting, the page will prompt for admin email + password.
4. Enter the Firebase Auth credentials. An ADMIN badge appears top-right. Click it to exit.

Admin persists across refreshes via Firebase auth. When admin is active, Drift cursor recording is suppressed (`?norecord=1` on the WebSocket URL).

## Deployment steps (when ready)

1. **Deploy Firebase security rules.** Firebase Console → Realtime Database → Rules → paste contents of `firebase-rules.json` → Publish.
2. **Merge the branch.** `git checkout main && git merge guestbook-moderation && git push`.

## Known caveats
- **blog.sanyamgarg.com also writes to `guestbook/`.** After deploying rules, the blog's submit flow will fail (public writes to `guestbook/` are blocked). Either update the blog to write to `guestbook_pending/` too, or temporarily relax the rule.
- **main_visitor_count** is preserved in the rules (public read/write) so the visitor counter keeps working.
- Any other paths in the Firebase DB not listed in `firebase-rules.json` will default-deny once these rules publish. Check the Firebase Console for other paths before deploying.

## Pattern hash
`e7825154f47cc7fd221c47e4ed733bf03b5c687390ac6e3a6a5eefd8ba76ce8b`
is `sha256(pixels.map(lowercase).join("|") + "::" + "sammy001")`.
