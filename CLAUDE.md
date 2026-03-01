# wopr-plugin-twitter

`@wopr-network/wopr-plugin-twitter` — Twitter/X channel plugin for WOPR.

## Commands

```bash
pnpm build     # tsc
pnpm dev       # tsc --watch
pnpm check     # biome check + tsc --noEmit (run before committing)
pnpm lint:fix  # biome check --fix src/
pnpm format    # biome format --write src/
pnpm test      # vitest run
```

**Linter/formatter is Biome.** Never add ESLint/Prettier config.

## Architecture

```
src/
  index.ts              # Plugin entry — exports WOPRPlugin default
  twitter-client.ts     # Twitter API v2 wrapper with rate limiting
  channel-provider.ts   # Implements ChannelProvider interface
  stream-manager.ts     # Filtered stream for mentions/keywords
  media-handler.ts      # Media upload (images/video)
  logger.ts             # Winston logger instance
  types.ts              # Plugin-local types + re-exports
```

## Plugin Contract

This plugin imports ONLY from `@wopr-network/plugin-types` — never from wopr core internals.

The default export must satisfy `WOPRPlugin`. The plugin receives `WOPRPluginContext` at `init()` time.

## Key Conventions

- twitter-api-v2 ^1.18.2 for all Twitter API calls
- Winston for logging (not console.log)
- Node >= 24, ESM ("type": "module")
- Conventional commits with issue key: `feat: add streaming (WOP-1254)`
- `pnpm check` must pass before every commit

## Issue Tracking

All issues in **Linear** (team: WOPR). No GitHub issues. Issue descriptions start with `**Repo:** wopr-network/wopr-plugin-twitter`.
