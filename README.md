# Recipe Quest v2

A local-first installable PWA that combines a personal recipe library with a cozy health-powered RPG loop.

## Included in v1

- Recipe library with search, favourites, ingredients, steps, notes and tags
- Automatic Health Point and coin rewards based on health qualities
- Meal logging
- Adventure quests gated by Health Points or healthy meal types
- Coins and cosmetic shop
- Inventory / collection
- Local save data
- Save export
- Installable PWA + offline cache
- No account, backend or API required

## Health scoring in this prototype

Positive:
- Vegetables +3
- Fruit +2
- Protein +3
- Whole grains +2
- Minimally processed +3

Negative:
- High added sugar -2
- Deep fried -2

Score is capped between 0 and 10 and maps to HP/coin rewards.

This is intentionally a gentle reward system. Less nutritious meals are not punished with negative points.

## Run locally

Because it uses a service worker, run it through a simple local web server rather than opening `index.html` directly.

Python:
```bash
python -m http.server 8080
```

Then open:
`http://localhost:8080`

## Deploy

You can upload the folder to a GitHub repository and deploy it using GitHub Pages, Netlify, Vercel or any static host.

## Suggested v2

- Ingredient pantry and "What can I cook?"
- Serving-size scaler
- Shopping list
- Weekly variety quests
- Recipe version history
- Image uploads
- Nutrition data / optional nutrition API
- Supabase account sync
- Shared household profile for Ben + Shan
- Larger branching adventure map


## v2 character update

- Implemented the supplied Soft & Friendly female cook as the main character avatar.
- Avatar appears on the Home dashboard and Profile/character card.
- Existing v1 local saves are migrated automatically to use the female avatar.

- v2.1: Added a subtle app version label above the bottom navigation.

## v2.2 update reliability fix

- Added cache-busting URLs to CSS, JavaScript, manifest, icon and avatar assets.
- Service worker now activates immediately.
- Old Recipe Quest caches are deleted automatically.
- Page navigation uses network-first loading so newly deployed builds appear after refresh.
- Verified female avatar assets and v2.2 version label are present in the package.

## v2.3 deployment packaging fix

This ZIP is FLAT. `index.html` is at the ZIP root.

When updating an existing repository, replace the old root files:
- index.html
- app.js
- styles.css
- sw.js
- manifest.webmanifest
- icon.svg
- assets/

Do not upload these files into a new `recipe_quest_app` subfolder unless your hosting root is configured to that folder.

The current running version is also shown in the top-right of the app header as `v2.3`.
