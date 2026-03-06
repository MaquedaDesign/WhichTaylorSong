# Prompt for AI Scoring

> **This section is a task description for AI models.** Read it carefully before producing any output.

## What you need to do

Analyze the lyrics of each song listed in this file and produce a **CSV file** scoring every song on **6 dimensions**, using the same methodology as an academic study of Taylor Swift's discography.

The existing dataset (`taylorswift` Python package, `Grades.csv`) covers 149 songs from *Taylor Swift* (2006) through *Evermore* (2020). Every song in that file was scored by human researchers on these same 6 dimensions. The songs below are the ones **absent from that dataset** — your job is to extend it.

---

## The 6 Dimensions

Each dimension is scored as an **integer from −3 to +3** (no decimals, no half-values).

Think of each dimension as a slider question that the *narrator of the song* would answer about themselves. Score from the narrator's point of view as honestly as the lyrics allow.

| Column name | Slider question | −3 means… | +3 means… |
|---|---|---|---|
| **SelfFeel** | "How do you feel about yourself?" | Lots of problems, all my fault | I'm awesome, life is awesome! |
| **Stages** | "What is your emotional state right now?" | Really angry / deeply depressed | Actively making yourself & others happy |
| **Seriousness** | "How would you describe your relationship?" | Serious problems / painful end (or toxic/fake) | Married / forever committed (deep genuine bond) |
| **FutureProspects** | "What does the future of your relationship look like?" | Never speaking again / no future | Getting married / together forever |
| **MaleFeel** | "What are the **other person's** feelings about you?" | They hate me / completely indifferent | They have openly declared their love |
| **Togetherness** | "How much time do you spend together?" | Significant barriers, never together | Everything, always together |

> **Note on MaleFeel**: this column captures the **other person's feelings *toward* the narrator**, NOT the narrator's feelings about the other person. For songs with no specific romantic subject (anthems, industry commentary, grief songs), use 0.

> **Note on non-romantic songs**: for songs about fame, grief, family, or general life (not a specific romantic relationship), score each dimension as best you can from the narrator's perspective. Use 0 where a dimension is clearly not applicable.

---

## Calibration Examples

These songs ARE in the existing dataset — use them to calibrate your scores:

| Song | Album | Self | Stages | Serio | Future | Male | Together |
|---|---|---|---|---|---|---|---|
| Love Story | Fearless | 1 | 3 | 3 | 3 | 3 | 1 |
| Picture to Burn | Taylor Swift | 3 | −3 | −3 | −3 | 0 | −3 |
| White Horse | Fearless | −3 | −3 | −2 | −3 | 3 | −3 |
| Fearless | Fearless | 3 | 1 | 1 | 2 | 2 | 2 |
| All Too Well | Red | −1 | −3 | −2 | −2 | −2 | −1 |
| Begin Again | Red | −1 | 2 | 2 | 2 | 2 | 1 |
| Shake It Off | 1989 | 3 | 2 | 0 | 0 | 0 | −2 |
| Clean | 1989 | 0 | 0 | −3 | −3 | 0 | −1 |
| Lavender Haze* | Midnights | 3 | 3 | 2 | 2 | 3 | 3 |
| Anti-Hero* | Midnights | −2 | −2 | −1 | −1 | 0 | 0 |

*Calibration scores for Midnights are from a separate AI scoring round, not the original study.

---

## Output Format

Produce a CSV file with **exactly these 8 columns** and one row per song:

```
Title,Album,SelfFeel,Stages,Seriousness,FutureProspects,MaleFeel,Togetherness
```

- All score values must be integers: −3, −2, −1, 0, 1, 2, or 3.
- Enclose any title or album containing a comma in double quotes (e.g. `"So Long, London"`).
- Use the **exact album names** from the list below.
- Score every song — do not skip any.

---

# Missing Songs — Taylor Swift Dataset

The current dataset (`taylorswift` package) contains **149 songs** spanning the albums from *Taylor Swift* (2006) through *Evermore* (2020). The following albums and songs are **absent from the dataset** and have not been scored, since the original study did not cover them.

---

## Taylor's Version — Vault Tracks Only

The re-recordings of the original albums are not listed here (the originals are already in the dataset). Only the **"From the Vault"** tracks unique to each Taylor's Version are missing.

### Fearless (Taylor's Version) — 6 Vault Tracks

| # | Title |
|---|-------|
| 1 | You All Over Me (feat. Maren Morris) |
| 2 | Mr. Perfectly Fine |
| 3 | We Were Happy |
| 4 | That's When (feat. Keith Urban) |
| 5 | Don't You |
| 6 | Bye Bye Baby |

---

### Speak Now (Taylor's Version) — 6 Vault Tracks

| # | Title |
|---|-------|
| 1 | Electric Touch (feat. Fall Out Boy) |
| 2 | When Emma Falls in Love |
| 3 | I Can See You |
| 4 | Castles Crumbling (feat. Hayley Williams) |
| 5 | Foolish One |
| 6 | Timeless |

---

### Red (Taylor's Version) — 9 Vault Tracks

| # | Title |
|---|-------|
| 1 | Better Man |
| 2 | Nothing New (feat. Phoebe Bridgers) |
| 3 | Babe |
| 4 | Message in a Bottle |
| 5 | I Bet You Think About Me (feat. Chris Stapleton) |
| 6 | Forever Winter |
| 7 | Run (feat. Ed Sheeran) |
| 8 | The Very First Night |
| 9 | All Too Well (10 Minute Version) |

---

### 1989 (Taylor's Version) — 5 Vault Tracks

| # | Title |
|---|-------|
| 1 | 'Slut!' |
| 2 | Say Don't Go |
| 3 | Now That We Don't Talk |
| 4 | Suburban Legends |
| 5 | Is It Over Now? |

---

## Midnights (2022) — Complete Album Missing

### Standard Edition (13 tracks)

| # | Title |
|---|-------|
| 1 | Lavender Haze |
| 2 | Maroon |
| 3 | Anti-Hero |
| 4 | Snow on the Beach (feat. Lana Del Rey) |
| 5 | You're on Your Own, Kid |
| 6 | Midnight Rain |
| 7 | Question...? |
| 8 | Vigilante Shit |
| 9 | Bejeweled |
| 10 | Labyrinth |
| 11 | Karma |
| 12 | Sweet Nothing |
| 13 | Mastermind |

### 3am Edition — Bonus Tracks (7 tracks)

| # | Title |
|---|-------|
| 1 | The Great War |
| 2 | Bigger Than the Whole Sky |
| 3 | Paris |
| 4 | High Infidelity |
| 5 | Glitch |
| 6 | Would've, Could've, Should've |
| 7 | Dear Reader |

### Additional Bonus Tracks

| # | Title |
|---|-------|
| 1 | Hits Different |
| 2 | You're Losing Me (From the Vault) |

---

## The Tortured Poets Department (2024) — Complete Album Missing

### Standard Edition (16 tracks)

| # | Title |
|---|-------|
| 1 | Fortnight (feat. Post Malone) |
| 2 | The Tortured Poets Department |
| 3 | My Boy Only Breaks His Favorite Toys |
| 4 | Down Bad |
| 5 | So Long, London |
| 6 | But Daddy I Love Him |
| 7 | Fresh Out the Slammer |
| 8 | Florida!!! (feat. Florence and the Machine) |
| 9 | Guilty as Sin? |
| 10 | Who's Afraid of Little Old Me? |
| 11 | I Can Fix Him (No Really I Can) |
| 12 | loml |
| 13 | I Can Do It with a Broken Heart |
| 14 | The Smallest Man Who Ever Lived |
| 15 | The Alchemy |
| 16 | Clara Bow |

### The Anthology Edition — Bonus Tracks (15 tracks)

| # | Title |
|---|-------|
| 1 | The Black Dog |
| 2 | imgonnagetyouback |
| 3 | The Albatross |
| 4 | Chloe or Sam or Sophia or Marcus |
| 5 | How Did It End? |
| 6 | So High School |
| 7 | I Hate It Here |
| 8 | thanK you aIMee |
| 9 | I Look in People's Windows |
| 10 | The Prophecy |
| 11 | Cassandra |
| 12 | Peter |
| 13 | The Bolter |
| 14 | Robin |
| 15 | The Manuscript |

---

## The Life of a Showgirl (2025) — Complete Album Missing

| # | Title |
|---|-------|
| 1 | The Fate of Ophelia |
| 2 | Elizabeth Taylor |
| 3 | Opalite |
| 4 | Father Figure |
| 5 | Eldest Daughter |
| 6 | Ruin the Friendship |
| 7 | Actually Romantic |
| 8 | Wi$h Li$t |
| 9 | Wood |
| 10 | CANCELLED! |
| 11 | Honey |
| 12 | The Life of a Showgirl (feat. Sabrina Carpenter) |

---

## Summary

| Album | Missing Tracks |
|-------|---------------|
| Fearless (Taylor's Version) — Vault only | 6 |
| Speak Now (Taylor's Version) — Vault only | 6 |
| Red (Taylor's Version) — Vault only | 9 |
| 1989 (Taylor's Version) — Vault only | 5 |
| Midnights (standard + 3am + bonus) | 22 |
| The Tortured Poets Department (standard + Anthology) | 31 |
| The Life of a Showgirl | 12 |
| **Total missing songs** | **91** |
