# Personal site

A minimal static site for product concepts, thoughts, and investment memos. No build step.

## Add a post

1. Write a Markdown file in `content/concepts/`, `content/thoughts/`, or `content/memos/`.
2. Add an entry to `content/posts.json` with the same `section` and `slug` (the file name without `.md`).

Concepts also take `type` (`"feature"` with `"app": "Spotify"`, or `"product"`).

Optional fields: `subtitle` (gray line under a card), `cover` (path to an image, e.g. `content/img/foo.jpg`; without one a colored cover is generated), `mark` (big text on the generated cover), `palette` (0 to 5, picks the generated cover color), `status` (concepts), `ticker` and `memo` (a key/value box shown at the top of memos), `tags` (become the filter chips), `readTime`.

## Preview locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish for free with GitHub Pages

Repo Settings → Pages → Deploy from branch → pick the branch and `/ (root)`. Your site appears at `https://<username>.github.io/<repo>/`. You can attach a custom domain in the same screen.

## Shelf (music, books, papers, films)

Edit `content/shelf.json`. Each row has a `kind`: `cd`, `book`, `paper` or `film`. Each item takes `title`, `by`, `year`, `note` (your line on why it stuck), and optionally `color` / `ink` for the generated cover or spine.

- **Real covers:** put an image in `content/img/shelf/` and set `"cover": "content/img/shelf/name.jpg"` (square for CDs, 2:3 for films).
- **Papers:** also take `venue` and `link`. For the rounded screenshot, save a crop of the paper's first page (title + abstract, roughly 4:3) to `content/img/shelf/` and set it as `cover`. The rounded corners and shadow are added automatically.

## Ideas

Add a line to `content/ideas.json` with `title`, `date`, and an optional `note`. When an idea becomes a concept, add `"concept": "<concept-slug>"` and it links to it.
