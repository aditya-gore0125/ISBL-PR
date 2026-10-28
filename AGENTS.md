/# PROJECT RULES: Nandini Jewellers (repo ISBL)
Read this fully before doing anything. Follow it every session.

## STACK
Next.js 15.5 (App Router, plain JavaScript, no TypeScript), React 19, Tailwind 4, MongoDB + Mongoose 7, NextAuth 4 (credentials, JWT), Razorpay, Cloudinary (signed server uploads), Recharts, zod.
OS: Windows. Shell: PowerShell 5.1. Project is inside OneDrive.

## DESIGN
Colors: ivory #FBF6EF, gold #C29D5D, gold-dark #9C7A3F, blush #DDA8B2, charcoal #332822, maroon #7B2D3A.
Fonts: Fraunces (headings), Manrope (body).
Admin is dense and utilitarian. Everything must work at 320px with no horizontal scroll.

## NEVER DO
- No git commands (commit, add, push, reset, checkout, stash).
- Never call /api/seed or /api/seed-categories. The seed deletes all products.
- Never write to or delete from the database unless the task says so. Default is read-only.
- Never edit .env.local or print secrets.
- Never change MONGODB_URI, the DB name, auth, Razorpay, or order logic unless the task is about them.
- Never run `npm audit fix --force`. Never upgrade Next, React or Tailwind.
- No new dependencies without asking me first.
- Never delete public/logo.svg, public/hero-placeholder.svg, public/category-placeholder.svg.
- Never pass upload_preset to Cloudinary signed uploads.
- Never remove requireAdmin() from admin layout, pages or API routes.
- No unrelated refactors. Smallest change that works.
- Never put the logo image where a category or product fallback belongs.

## FILE RULES
- Read a file before editing it. Match existing patterns.
- create_file fails if the path exists. Check first, then edit or overwrite. Never retry the same create.
- When you edit a file, keep line endings consistent (CRLF in this repo). Re-check imports after any edit.
- After every edit, grep for identifiers you used but never imported or defined. A missing import can pass lint and build and only crash at request time.
- Delete every scratch file you create (scratch*.js, test_*.js, verify_*.js) before finishing.

## POWERSHELL RULES
- Don't use `node -e '...'` or any long one-line quoted command. Quoting breaks.
- Write scripts to a file, then run: node --env-file=.env.local scratch_x.js
- Use curl.exe, not curl. Use `Remove-Item -Recurse -Force`, not rm -rf.
- Print results as plain text or console.table. Don't summarize raw output.

## BUILD AND CACHE RULES (OneDrive causes EPERM and stale cache)
- Never run `npm run build` while `npm run dev` is running.
- Before any build: stop node (Get-Process node | Stop-Process -Force), delete .next, then build.
- If EPERM happens: clean and retry ONCE. If it fails again, STOP and tell me. Don't loop.
- If you see "Cannot read properties of undefined (reading 'call')": it is a stale .next cache. Delete .next and node_modules\.cache and restart. Don't edit code for it.
- Pause OneDrive sync if EPERM keeps happening.

## VERIFICATION RULES
- HTTP 200 proves nothing. Pages can render an error and still return 200.
- Verify real content: count rendered /product/ links, compare to DB counts.
- "Compiled successfully" doesn't catch missing variables. Request the real pages on the dev server and read the server log.
- Say what you did NOT verify. Never claim "done" for something you didn't run.
- Run eslint on changed files, then build once at the end.

## DATA RULES
- Categories and products match on category.name AND type (Ladies/Gents). Never match on slug alone. Ladies and Gents share names (Rings, Bracelet, Chain, Earrings).
- Category links must pass ?type=Ladies or ?type=Gents.
- Category image: category.image if set, else /category-placeholder.svg. Never the logo.
- Database: the cluster has "test" and "jewelry-store". Print which DB name the app is connected to before trusting any count.
- After category create/update/delete, call revalidatePath for "/", "/collections", and "/category/[slug]" (layout).

## WORKING STYLE
- Do one step at a time. Report each result in one line.
- On the first failure: stop, show the full error, give the root cause and the smallest fix.
- Find the root cause before editing. No guess-fixes.
- Ask me if something is unclear. Don't guess business details, addresses, prices or product data.
- Keep chat replies short. Tables over paragraphs.

## CREDIT-SAFETY (I run out of credits mid-task)
- Work in small steps. After EACH completed step, update PROGRESS.md in the repo root with:
  1. Done (files changed).
  2. In progress (what and where it stopped).
  3. Next steps.
  4. Known issues and unverified items.
- Never leave a file
