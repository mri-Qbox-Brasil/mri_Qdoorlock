---@type DoorlockConfig
---@diagnostic disable-next-line: missing-fields
Config = {}

---Play sounds using game audio (sound natives) instead of through NUI. Switching renames every door's saved sound.
Config.NativeAudio = true

---Sprites used by [DrawSprite](https://docs.fivem.net/natives/?_0xE7FFAE5EBF23D890) when the lock icon is on.
Config.DrawSprite = {
    -- Unlocked
    [0] = { 'mpsafecracking', 'lock_open', 0, 0, 0.018, 0.018, 0, 255, 255, 255, 100 },

    -- Locked
    [1] = { 'mpsafecracking', 'lock_closed', 0, 0, 0.018, 0.018, 0, 255, 255, 255, 100 },
}

-- First values only: the panel (Ajustes tab) owns these from the first start, saved in data/settings.json.

---Trigger a notification on the client when the door state is successfully updated.
Config.Notify = false

---Create a persistent notification while in-range of a door, prompting to lock/unlock.
Config.DrawTextUI = false

---Draw the lock icon over nearby doors.
Config.ShowLockIcon = true

---Allow the specified ace principal to use 'command.doorlock'.
Config.CommandPrincipal = 'group.admin'

---Allow players with the 'command.doorlock' principal to use any door.
Config.PlayerAceAuthorised = false

---The default skill check difficulty when lockpicking a door.
Config.LockDifficulty = { 'easy', 'easy', 'medium' }

---Allow lockpicks to be used to lock an unlocked door.
Config.CanPickUnlockedDoors = false

---An array of items that function as lockpicks.
Config.LockpickItems = {
    'lockpick'
}

---Minimum delay (ms) between failed passcode attempts, per player, to throttle brute-forcing.
Config.PasscodeCooldown = 2000
