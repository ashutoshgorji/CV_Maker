# CV_Maker

This repo is a chat tool for tailoring CV content to each job application.

## Workflow

1. The master CV lives in `master_cv.md`. It is the single source of truth for all experience, skills and achievements. It is copied from the user's "Master CV - Supply Chain" doc (https://claude.ai/code/artifact/134ce150-355d-4d07-8867-8b511ab76470); if the user says the doc changed, re-read it and update `master_cv.md`.
2. For each application, the user pastes a new job description in chat.
3. Rewrite the experience section from `master_cv.md` into ATS-friendly, high-impact bullet points tailored to that job description, and return the result in chat.
4. Do not edit `master_cv.md` unless the user asks to update it.

## Tailoring rules

- Pull the key skills, tools and terms from the job description and work them into bullets only where the master CV supports them. Never invent experience, tools, employers or numbers.
- Start every bullet with a strong action verb. Avoid repeating the same verb within one role.
- Use the pattern: action, what was done, result or scope.
- Keep only metrics that appear in the master CV. If a metric would help but is missing, insert a placeholder such as `[X%]` and tell the user.
- Order bullets within each role by relevance to the job description. Give older or less relevant roles fewer bullets.
- Keep each bullet to one or two lines.

## Style constraints (strict)

- Banned words: leverage, utilize, spearheaded, seamless, dynamic, synergy, transformative, fostered, testament (including other forms such as leveraged, utilizing, fostering).
- Banned phrases: proven track record, results-driven, detail-oriented, passionate professional, and similar generic clichés.
- No em dashes (—) or complex symbols. Use standard bullet points and clean sentences.
- Tone: direct, active, professional and human. No embellishment or dramatic language.

## Output format

For each role:

**Job Title | Company | Dates**
- Bullet
- Bullet

After the bullets, add a short list of job description keywords that were matched, and any important keywords that the master CV does not support (so the user can decide whether to add real experience for them).

Before replying, check the output against the banned words, banned phrases and em dash rule.
