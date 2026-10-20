# Claude Design export

Files exported from the Opsell design system in Claude Design on 2026-10-17, committed as-is.
Do not hand-edit them: change the design system in Claude Design, re-export, and replace these files.

The walking skeleton ([#67](https://github.com/Opsell1/opsell/issues/67)) moves them into `packages/ui`.
The Tailwind v3 preset from the same export is left out, since the web app uses Tailwind v4 through `opsell-tailwind.css`.
The `LOCATIONS` constant in `status.ts` is demo data and moves to the demo scenario ([#123](https://github.com/Opsell1/opsell/issues/123)).
Where `status.ts` disagrees with the spec ([#66](https://github.com/Opsell1/opsell/issues/66)), the spec wins until the next export fixes it.
