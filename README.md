# MogTown: A Data Analytics Social-Deduction Game

Seven organizations. Four rounds. One question: **Why are sales exploding while profits are falling?**

MogTown is a mobile-first classroom simulation for undergraduate Accounting Information Systems / Data Analytics. Teams assemble incomplete evidence, question each other's interpretations, calculate forecasts, and defend decisions. TrendTok is the shared fictional news feed, not a team.

- **Game:** https://hunternbh.github.io/mogtown-da-game/
- **Repository:** https://github.com/hunternbh/mogtown-da-game
- **Instructor console:** [instructor.html](instructor.html)
- **Printable team worksheet:** [worksheet.html](worksheet.html)
- **Public facilitator guide:** [FACILITATOR_GUIDE.md](FACILITATOR_GUIDE.md)

## Run a class

1. Assign the seven organizations: GlowLab, JawMax Labs, MirrorAI, PrimeEra AI, CloutHouse, MogTown Consumer Protection Agency, and Mayor's Economic Council.
2. Give each team its private role code from your local `instructor/instructor-secrets.txt`. Codes use an organization prefix plus four digits (`organization-####`). Do not publish or project the role-code list.
3. Students open the game on one phone per team, choose their organization, and enter its code. Their confidential briefing and Round 1 open together.
4. Release the shared Round 2, Round 3, and Round 4 codes in order. Students enter each code on their device. Each unlock adds the public TrendTok update and their organization's private evidence.
5. Hear recommendations before releasing the final reveal code. Ask teams whether the new evidence changes their decision.

**MogTown Truth Rule:** Teams may frame or selectively disclose unlocked evidence. They may not fabricate data or contradict an unlocked metric. Direct questions about unlocked metrics require truthful answers.

| Round | Question | Team output | Suggested time |
| --- | --- | --- | --- |
| 1 · Descriptive | What happened? | 3 observations, 2 calculations, 1 strange pattern, 1 unanswered question | 10 min |
| 2 · Diagnostic | Why might it happen? | Hypothesis, evidence, alternative explanation, missing causal evidence | 15 min |
| 3 · Predictive | What is likely next? | Calculation, assumption, key driver, uncertainty | 12 min |
| 4 · Prescriptive | What should we do? | Action, evidence, expected result, trade-off, KPIs | 13 min |

Allow 5 minutes for login, 5 minutes for recommendation preparation, and 20–30 minutes for the hearing and final reveal. PrimeEra AI is a healthy-aging and presentation service for older consumers; comparisons across organizations require attention to different customers, product mixes, and channels.

## Student sessions and worksheet notes

The selected role and successfully unlocked rounds are restored after a refresh in the same browser tab using session storage. Use the game's **Switch team** control to log out before giving the device to a different team. A new tab or browser may require the codes again; browser session restoration behavior can vary. If session storage is unavailable, play can continue in the current page, but a refresh may lose progress.

The worksheet can be printed blank or filled in before printing / saving as PDF. Its typed notes exist only in that page and are not saved across refreshes. The instructor console contains no built-in codes; it shows only a code the instructor manually enters, clears it on activity changes or navigation, and does not save it.

## Local preview

Plain HTML, CSS, and JavaScript; no build step, npm installation, accounts, external fonts, tracking, or backend. All artwork and game data are local. A modern browser with Web Crypto is required.

From the repository folder, run:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000/`. Use localhost for local testing, or HTTPS on a deployed host; opening `index.html` directly through `file://` will not work reliably with Fetch and Web Crypto. The loopback binding keeps the local preview on your computer, including the ignored private instructor files.

## GitHub Pages deployment

1. Push the public project files to `hunternbh/mogtown-da-game`, branch `main`.
2. In the GitHub repository, open **Settings → Pages**.
3. Choose **Deploy from a branch**, then **main** and **/ (root)**, and save.
4. After deployment completes, share `https://hunternbh.github.io/mogtown-da-game/`.

The `.nojekyll` file keeps this a plain static site. Relative asset and data URLs work under the repository subpath.

Before each class, check a login, each round release, and the final reveal using your private codes. Test again after changing encrypted content. Private maintenance scripts and an arithmetic answer key are provided only in the local, ignored `instructor/` folder.

## Private instructor materials

The entire `instructor/` directory is excluded from Git. It contains the role/round codes, spoiler-filled facilitator guide, editable content sources, arithmetic answer key, and encryption maintenance tools. These files are intentionally absent from the public repository. Keep a separate private backup; cloning the public repository does not recover the instructor kit.

Do not force-add the directory, copy private source JSON into `data/`, or include plaintext clue answers in public documentation. The root `FACILITATOR_GUIDE.md` is safe to publish and explains facilitation without revealing future evidence.

Private role and future-round payloads use AES-GCM with browser-native Web Crypto. Role briefings use the role code; later public updates use a round code; later role evidence uses both. The final update requires its reveal code. **This is classroom obfuscation, not high-security authentication.** The app retains the access information needed to restore the current session in the browser; do not use this design for sensitive real-world data.

## File map

- `index.html`, `styles.css`, `app.js` — student interface, session state, and decryption.
- `assets/*.png` — supplied game and organization artwork.
- `data/manifest.json` — public role names and payload paths.
- `data/common/round1.json` — opening public TrendTok content.
- `data/common/*.enc.json`, `data/roles/*.enc.json` — encrypted updates and confidential role content.
- `worksheet.html` — responsive editable worksheet with a white print layout.
- `instructor.html`, `instructor.css`, `instructor.js` — optional timer and manual code display.
- `FACILITATOR_GUIDE.md` — public, spoiler-free facilitation instructions.
- `instructor/` — ignored private teaching and maintenance materials.
