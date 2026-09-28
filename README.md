# MogTown: A Data Analytics Social-Deduction Game

Seven organizations. Four rounds. One question: **Why are sales exploding while profits are falling?**

MogTown is a mobile-first, 60-minute classroom simulation for undergraduate Accounting Information Systems / Data Analytics. Teams use different evidence to describe events, test explanations, forecast outcomes, and recommend action. TrendTok is the shared fictional news feed, not a team.

- **Game:** https://hunternbh.github.io/mogtown-da-game/
- **Repository:** https://github.com/hunternbh/mogtown-da-game
- **Printable instructor guide:** [instructor.html](instructor.html) or [one-page PDF](print/mogtown-instructor-guide.pdf)
- **Seven group worksheets:** [choose a group](worksheet.html) or [all seven versions as a PDF](print/mogtown-seven-group-worksheets.pdf)
- **Facilitation notes:** [FACILITATOR_GUIDE.md](FACILITATOR_GUIDE.md)

## Run a class in 60 minutes

1. Divide the class into seven roughly equal groups: GlowLab, JawMax Labs, MirrorAI, PrimeEra AI, CloutHouse, MogTown Consumer Protection Agency, and Mayor's Economic Council.
2. Give each group its matching worksheet and role access code from the instructor guide. Use one phone or computer and a calculator per group. Assign an analyst, recorder, spokesperson, and questioner; combine jobs in smaller groups.
3. Students choose their organization and enter its code. The role briefing and Round 1 open together. A team-specific link, such as `index.html?role=glowlab`, preselects the organization and still requires its code.
4. Release the shared Round 2, Round 3, and Round 4 codes in order. Each team enters the code on its own device.
5. In every round, complete exactly two worksheet boxes: **Our answer** and **Our public class statement**. Allow each group 30 seconds to share its statement, within that round's time.
6. Release the final reveal after initial recommendations. Teams update the same Round 4 boxes using the new evidence, then hand in their worksheets.

| Stage | Time | Question |
| --- | --- | --- |
| Setup | 5 min | Read the case, character, and end goal; log in. |
| 1 · Descriptive | 10 min | What happened? |
| 2 · Diagnostic | 12 min | Why might it have happened? |
| 3 · Predictive | 12 min | What is likely to happen next? |
| 4 · Prescriptive | 12 min | What should we do? |
| Final reveal and update | 9 min | Does the new evidence change our recommendation? |

The four rounds use eight answer boxes per group in total. The final update does not add another section or set of boxes. Round times include the seven 30-second public statements.

**MogTown Truth Rule:** Teams may frame or selectively disclose unlocked evidence. They may not fabricate data or contradict an unlocked metric. Direct questions about unlocked metrics require truthful answers.

## Sessions and printable materials

The selected role and successfully unlocked rounds are restored after a refresh in the same browser tab using session storage. Use **Switch team** to log out before giving a device to another group. A new tab or browser may require the codes again; browser session restoration behavior can vary. If session storage is unavailable, play can continue in the current page, but a refresh may lose progress.

Each group worksheet includes the shared case, its character and end goal, and two empty boxes per round. There are no name/date fields or separate final-reveal boxes. Students write on the printed sheets; the worksheet page does not store answers. The instructor page is a printable guide to allocation, access codes, timing, and facilitation.

Printable pages use black text and borders on white paper, with Calibri as the preferred font. The PDFs embed Calibri. Print on Letter paper at 100% scale, or fit to page for A4. Turn off browser headers and footers when printing HTML. The worksheet PDF follows the group order above, with two pages per group (14 pages total).

## Access codes and private materials

The instructor HTML guide and instructor PDF intentionally publish the seven group role access codes for classroom setup. Anyone who reads those guides can use a group's code to open its role briefing; role selection is a classroom access step, not a security boundary. The worksheets and this README contain no actual codes.

Future round and final reveal codes remain in the local, Git-ignored `instructor/` folder. Release only the shared code for the current stage. The folder also contains editable private clue sources, the full facilitator debrief, an arithmetic answer key, and encryption maintenance tools. Keep a separate private backup: cloning the public repository does not recover that kit.

Do not force-add the instructor folder or copy private source JSON into `data/`. Private role and future-round payloads use AES-GCM with browser-native Web Crypto: role briefings use the role code; future public updates use a round code; future role evidence uses both; the final update uses its reveal code. **This is classroom obfuscation, not high-security authentication.** The browser retains the access information needed to restore the current session.

## Local preview

Plain HTML, CSS, and JavaScript; no build step, npm installation, accounts, external fonts, tracking, or backend. All artwork and game data are local. A modern browser with Web Crypto is required.

From the repository folder, run:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000/`. Use localhost for testing or HTTPS when deployed; opening `index.html` through `file://` will not reliably support Fetch and Web Crypto. The loopback binding keeps the local preview, including ignored instructor files, on your computer.

## GitHub Pages deployment

1. Push the public project files to `hunternbh/mogtown-da-game`, branch `main`.
2. In **Settings → Pages**, choose **Deploy from a branch**, **main**, and **/ (root)**.
3. After deployment completes, share `https://hunternbh.github.io/mogtown-da-game/`.

The `.nojekyll` file keeps this a plain static site. Relative asset and data URLs work under the repository subpath. After content changes, test all group logins, sequential round unlocks, the final reveal, and the publication audit before class.

## File map

- `index.html`, `styles.css`, `app.js` — student interface, session state, and decryption.
- `assets/*.png` — supplied game and organization artwork.
- `data/manifest.json` — public role names and payload paths.
- `data/common/round1.json` — opening public TrendTok content.
- `data/common/*.enc.json`, `data/roles/*.enc.json` — encrypted updates and role content.
- `worksheet.html`, `worksheet.js`, `worksheet-prompts.json` — seven group worksheets, each with eight blank boxes.
- `instructor.html`, `instructor.css`, `instructor.js` — printable facilitation guide, including group role codes.
- `print.css`, `print/*.pdf` — shared print styling and downloadable instructor/worksheet PDFs.
- `FACILITATOR_GUIDE.md` — public facilitation notes without codes or unreleased evidence.
- `instructor/` — ignored future release codes, private content, and teaching/maintenance materials.
