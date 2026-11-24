# Personal site

A minimal static site for product concepts, thoughts, and investment memos. No build step.

## Add a post

1. Write a Markdown file in `content/concepts/`, `content/thoughts/`, or `content/memos/`.
2. Add an entry to `content/posts.json` with the same `section` and `slug` (the file name without `.md`).

Optional fields: `subtitle` (gray line under a card), `cover` (path to an image, e.g. `content/img/foo.jpg`; without one a colored cover is generated), `mark` (big text on the generated cover), `palette` (0 to 5, picks the generated cover color), `status` (concepts), `ticker` and `memo` (a key/value box shown at the top of memos), `tags` (become the filter chips), `readTime`.

## Preview locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish for free with GitHub Pages

Repo Settings → Pages → Deploy from branch → pick the branch and `/ (root)`. Your site appears at `https://<username>.github.io/<repo>/`. You can attach a custom domain in the same screen.
