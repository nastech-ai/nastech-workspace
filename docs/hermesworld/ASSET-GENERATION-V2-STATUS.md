# NasTechWorld Asset Generation V2 Status

Branch: `feat/asset-generation-v2`

## Status

Image generation is blocked before any images are produced because the NasTech image generation tool is enabled but its provider credential is not configured in this runtime.

Tool error:

```text
functions.image_generate: ValueError: FAL_KEY environment variable not set
```

No generated raster assets were committed from this run. This avoids shipping synthetic placeholders while claiming they came from imagegen.

## Intended output paths

- Zone variants and selected zone heroes: `public/assets/nastechworld/zones/v2/`
- NPC portraits: `public/avatars/v2/`
- Icon sprite sheet and manifest: `public/assets/nastechworld/icons/sprite-v1.png` and `sprite-v1.json`
- Video poster: `public/assets/nastechworld/video/world-demo-poster-v2.jpg`

## Prompt source

Use `docs/nastechworld/PROMPT-LIBRARY.md` for the exact repeatable prompts and style lock values.

## Resume command

After setting `FAL_KEY` in the NasTech runtime environment, rerun the asset generation lane against this branch and commit the generated assets.

