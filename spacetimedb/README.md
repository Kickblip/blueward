# Room module

Use Node.js 22.3+ and SpacetimeDB CLI/server 2.11.0 (matching the pinned SDK).

- `npm run rooms:build` checks and bundles the module.
- `npm run rooms:generate` rebuilds its generated TypeScript client bindings.
- `npm run rooms:test` builds the module and runs the room regressions. It starts a separate temporary server on a free local port, publishes a fresh test database with a temporary identity, and removes it afterward. It does not read your app credentials or touch your local room database.
- `npm run rooms:start` starts your local server on port 3100.
- `npm run rooms:publish:local` publishes the module to your local room database.

## One-time schema cutover

Participants now store only room membership. Profiles and preferences live in
accounts, including dummy profiles, which are deleted when kicked.

Removing the old participant columns is not supported by
[SpacetimeDB's automatic migration](https://spacetimedb.com/docs/databases/automatic-migrations/).
For this development cutover, when you are ready to discard the
existing local room data, run:

```sh
npm run rooms:publish:local -- --delete-data
```

This resets **all data in the local room database**, including rooms, memberships,
teams, stored preferences, and sessions. Existing room links stop working. Neon
data is unaffected. Keep the CLI confirmation prompt; the normal publish script
does not reset data automatically.

After publishing, reload the app and create a new room. Later compatible changes
use `npm run rooms:publish:local` normally. To retain existing SpacetimeDB rooms,
use a separate data migration instead of the reset command.
