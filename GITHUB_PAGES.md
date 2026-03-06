# GitHub Pages deployment

This project now includes a static version under `docs/` so it can be published with GitHub Pages without Flask.

## Files that matter

- `docs/index.html`: static app shell
- `docs/app.js`: client-side recommendation logic
- `docs/data/catalogs.json`: prebuilt datasets used by the browser
- `export_static_data.py`: rebuilds `docs/data/catalogs.json` from the current Python app data

## Before pushing

If you change scores, highlights, or dataset logic, regenerate the static catalog:

```bash
py export_static_data.py
```

## Publish on GitHub Pages

1. Push the repository to GitHub.
2. Open `Settings` in the repository.
3. Go to `Pages`.
4. In `Build and deployment`, choose `Deploy from a branch`.
5. Select your main branch and the `/docs` folder.
6. Save and wait for GitHub to publish the site.

GitHub will give you a URL like:

```text
https://your-user.github.io/your-repo/
```

## Local preview

You can preview the static site locally with:

```bash
py -m http.server 8000 -d docs
```

Then open `http://127.0.0.1:8000` in your browser.