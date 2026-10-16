# CV Maker

Write your CV as plain text and get a PDF in the same layout as the FlowCV "PT Serif" resume
(A4, date column on the left, round photo top right).

## Option 1: in the browser (easiest)

1. Open `index.html` in Chrome or Edge (double-click it, or use the GitHub Pages link if enabled).
2. Paste or type your CV text on the left. The preview on the right updates as you type.
3. Click **Photo** to add your picture (or drag an image onto the page).
4. Click **Download PDF** → choose **Save as PDF** → turn off "Headers and footers" → Save.

Your text and photo are saved automatically in your browser only; nothing is uploaded.
Use **Save .txt** / **Open** to keep a copy of your text as a file.

## Option 2: command line

```bash
npm install
node make-pdf.js my-cv.txt              # -> my-cv.pdf
node make-pdf.js my-cv.txt out.pdf --photo photo.jpg
```

You can also put `photo: photo.jpg` in the text file (path relative to the text file).

## Text format

```text
# Full Name
email: you@example.com
phone: +49 170 0000000
location: Hamburg, Germany
linkedin: linkedin.com/in/you
birthday: 01.01.1995

## Skills
**SAP / ERP:** SAP S/4HANA, production orders, MRP

## Experience
### 03.2024 – Present | Job Title | Company, City, Country
Optional line of plain text
- Bullet point
- Another bullet point

## Education
### 10.2018 – 07.2020 | M.Sc. Industrial Engineering | University, Germany

## Languages
**English** - Business Fluent (C1) || **German** - Fluent (B1)
```

| You write | You get |
|---|---|
| `# Name` | Name at the top |
| `email:` `phone:` `location:` `linkedin:` `birthday:` `website:` | Contact line with icon (any other `key: value` is shown as plain text) |
| `## Title` | Section heading |
| `### date \| title \| place` | Entry with the date in the left column (place is optional) |
| `- text` | Bullet point |
| `**bold**`, `*italic*` | Bold, italic |
| `left \|\| right` | Two columns |
| `// note` | Ignored |

See `example-cv.txt` for a full example.

Tip: you can ask an AI assistant to "rewrite my CV in this format" and paste the result straight in.

Fonts: PT Serif (SIL Open Font License, see `fonts/OFL.txt`).
