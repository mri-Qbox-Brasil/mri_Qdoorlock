# mri_Qdoorlock 🚪

An advanced, highly optimized, and robust doorlock system for FiveM, heavily based on the foundation of `ox_doorlock` but with major architectural improvements and an integrated management UI.

## 🌟 Key Features

- **Drop-in replacement for `ox_doorlock`**: keeps the `ox_doorlock` database table, the `ox_doorlock:*` events and answers `exports.ox_doorlock` calls, so scripts written for ox_doorlock (housing, heists, MLO packs) keep working without changes. See [Compatibility](#-compatibility-with-ox_doorlock).
- **Automatic SQL Installation & Migration**: tables are created on first start. Existing `ox_doorlock` tables are upgraded in place (a `group_id` column is added), and servers coming from mri_Qdoorlock 1.21 or older have their `mri_qdoorlock` data moved back automatically.
- **Door Groups System**: Manage doors efficiently by assigning them to groups (zones/departments like MRPD, Pillbox, etc). Deleting a group cascades and cleanly deletes all associated doors.
- **Modern Management UI**: Built with **React 18**, **Vite**, **Zustand**, and **TailwindCSS**. Manage your doors, passcodes, permissions, and lockpick settings visually in-game.
- **Editable UI Source Code**: The `web/` folder contains all the source code. Developers can modify the UI, add new features, and rebuild it using `npm run build`.
- **High Performance**: Client-side logic utilizes `lib.grid` to ensure 0.00ms resmon when away from doors, only rendering nearby doors dynamically.
- **Advanced Permissions**: Lock/unlock doors using framework Jobs/Gangs, citizen IDs, specific inventory Items (keys), or numeric Passcodes.
- **Native Door System**: Integrates deeply with GTA V's native `DoorSystem`, ensuring perfect physics sync, sliding doors, and double-door support.
- **Lockpicking Minigame**: Built-in support for lockpicking doors that allow it, using skill checks.

## 🛠️ Requirements

- [oxmysql](https://github.com/overextended/oxmysql) (v2.4.0+)
- [ox_lib](https://github.com/overextended/ox_lib) (v3.30.4+)

### 🔌 Optional Integrations
- [t3_lockpick](https://github.com/T3development/t3_lockpick): The system automatically detects if you have this lockpick minigame installed and unlocks a new option in the UI, allowing you to seamlessly choose between the default `ox_lib` skillcheck and `t3_lockpick` for each door.

## 📥 Installation

1. Download the repository and place it in your `resources` folder.
2. Ensure you have `oxmysql` and `ox_lib` installed and started before `mri_Qdoorlock`.
3. Add `ensure mri_Qdoorlock` to your `server.cfg`.
4. Start your server. The script creates the `ox_doorlock` and `ox_doorlock_groups` tables, or upgrades an existing `ox_doorlock` table in place.
5. Remove the original `ox_doorlock` resource. Both must never run at the same time (see [Compatibility](#-compatibility-with-ox_doorlock)).

## 💻 Modifying the UI

The UI is built using Vite and React. The pre-built files are already included in `web/build`, so the script is **plug-and-play**.

If you wish to modify the interface:
1. Navigate to the `web` folder: `cd web`
2. Install dependencies: `npm install`
3. Start the dev server (optional): `npm run start`
4. Build for production: `npm run build`

This will output the new UI files to the `web/build` folder, which the FiveM resource reads.

## 🎮 In-Game Commands

- `/doorlock` - Opens the management UI (Requires ACE permission: `command.doorlock`).
- From the UI, you can toggle debug mode, create groups, add new doors, set passcodes, and teleport to specific doors.

## 🧩 API

All exports are also reachable as `exports.ox_doorlock` (see [Compatibility](#-compatibility-with-ox_doorlock)).

### Server exports

| Export | Description |
|---|---|
| `getDoor(id)` | Door data (id, name, state, coords, characters, groups, items, maxDistance, passcodeType, passcodeCoords) or `false`. |
| `getAllDoors()` | Array with every door, same shape as `getDoor`. |
| `getDoorFromName(name)` | First door whose name matches. |
| `editDoor(id, data)` | Merges `data` into the door, persists and broadcasts. Empty string clears a field. |
| `createDoor(data)` | Creates and persists a door. Needs `coords` or `doors` (double door). Returns the new id. |
| `removeDoor(id)` | Deletes the door from memory, database and every client. |
| `setDoorState(id, state)` | Locks (`1`) or unlocks (`0`). Returns whether it succeeded. |
| `registerHook(event, fn, options?)` | Registers a hook (see below). Returns the hook id. |
| `removeResourceHook(id?)` | Removes the calling resource's hooks, or only the given id. |

### Client exports

`useClosestDoor()`, `getClosestDoor()`, `getClosestDoorId()`, `getDoorIdFromEntity(entity)`, `pickClosestDoor()`.

### Server events

| Event | Description |
|---|---|
| `ox_doorlock:setState` (id, state) | Same as the export; when triggered by a player the door permissions are checked. |
| `ox_doorlock:stateChanged` (source, id, locked, item?) | Fired after a door changes state. |
| `ox_doorlock:loaded` | Fired once all doors are loaded from the database. |
| `ox_doorlock:RemoveDoorlock` (name) | Removes the door called `name` and every door named `name_*`. From a client it requires the `command.doorlock` ace. |

### Hooks

```lua
exports.ox_doorlock:registerHook('doorAuthorization', function(payload)
    -- payload.source, payload.door, payload.lockpick, payload.state, payload.authorised
    if payload.door.name:find('^ps_mloproperty') and IsTenant(payload.source, payload.door) then
        return true
    end
end, { nameFilter = '^ps_mloproperty' })
```

A hook that returns a non-nil value grants access on top of the door's own rules. It cannot revoke access the door already granted. Options: `nameFilter` (Lua pattern matched against the door name) and `print` (log every call).

## 🔌 Plugin API (mri_Qadmin Integration)

**mri_Qdoorlock** is fully capable of operating as an embedded iframe plugin inside the **mri_Qadmin** panel.
When accessed via the admin panel (embedded mode), it:
- **Automatic Styling**: Dynamically parses the admin's Hex UI Colors and injects them internally as proper HSL Tailwind Variables (`--primary`, `--background`), syncing the theme in real-time.
- **NUI Communication Bridge**: Redirects NUI callback logic (like `fetchNui`) through the `BroadcastChannel` to fix native iframe context loss.
- **Data Hydration**: Initializes state dynamically without native commands via the `requestData` callback, fetching doors, groups, sounds, and active debug states upon mount.
- **Smart UI Yielding**: Automatically closes the parent `mri_Qadmin` panel via `window.parent.postMessage({ type: 'mri-plugin/request-close' }, '*')` when triggering actions that require in-game raycasting or physical interactions, such as:
  - Teleporting to a Door or Group
  - Duplicating a Door
- Provides a completely seamless administrative experience without the need to type `/doorlock` separately.

## 🔁 Compatibility with ox_doorlock

mri_Qdoorlock is designed to replace `ox_doorlock` without touching the scripts that depend on it:

- **Resource name**: the manifest declares `provide 'ox_doorlock'`, so `GetResourceState('ox_doorlock')` and `dependency 'ox_doorlock'` in other resources resolve to mri_Qdoorlock.
- **Exports**: every export (`getDoor`, `getAllDoors`, `getDoorFromName`, `editDoor`, `setDoorState`, `useClosestDoor`, `getClosestDoor`, `getClosestDoorId`, `getDoorIdFromEntity`, `pickClosestDoor`) is registered under both `exports.mri_Qdoorlock` and `exports.ox_doorlock`.
- **Events and callbacks**: all names are unchanged (`ox_doorlock:setState`, `ox_doorlock:editDoorlock`, `ox_doorlock:stateChanged`, `ox_doorlock:loaded`, ...).
- **Database**: doors live in the `ox_doorlock` table with the original `id`, `name` and `data` columns. Scripts that read or write that table directly keep working. Groups add a `group_id` column and the `ox_doorlock_groups` table.

The code does not depend on the folder name, so installing it in a folder called `ox_doorlock` also works. You only lose the `mri_Qdoorlock` name in txAdmin and logs. The MRI integration glue lives in `mri/` (see `mri/README.md`).

**Never run the original `ox_doorlock` and mri_Qdoorlock at the same time.** Both would answer the same exports and events, and doors would be handled twice.

### Upgrading from mri_Qdoorlock 1.21 or older

Those versions stored doors in `mri_qdoorlock` and `mri_qdoorlock_groups`. On the first start of this version the data is copied into `ox_doorlock` and `ox_doorlock_groups` (existing rows with the same id are overwritten with the mri_Qdoorlock data, which is the most recent), and the old tables are renamed to `mri_qdoorlock_migrated` and `mri_qdoorlock_groups_migrated` as a backup. Drop them once you have confirmed everything works.

## 👏 Credits

This project was originally forked from and built upon the incredible work of the **[Overextended](https://github.com/overextended)** team, specifically their `ox_doorlock` resource. All foundational credit goes to them for creating such an optimized and robust system for the FiveM community.

## 📝 License

This project retains the original GPL-3.0-or-later license from Overextended. Modifications by `.mur4i` `.gordela`
