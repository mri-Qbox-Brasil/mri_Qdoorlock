# mri_Qdoorlock 🚪

An advanced, highly optimized, and robust doorlock system for FiveM, heavily based on the foundation of `ox_doorlock` but with major architectural improvements and an integrated management UI.

## 🌟 Key Features

- **Automatic SQL Installation**: No more manual database imports! The script automatically detects if the database exists and installs the necessary tables on the first server startup.
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
4. Start your server. The script will automatically create the `mri_qdoorlock` and `mri_qdoorlock_groups` tables in your database.

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

## 👏 Credits

This project was originally forked from and built upon the incredible work of the **[Overextended](https://github.com/overextended)** team, specifically their `ox_doorlock` resource. All foundational credit goes to them for creating such an optimized and robust system for the FiveM community.

## 📝 License

This project retains the original GPL-3.0-or-later license from Overextended. Modifications by `.mur4i` `.gordela`
