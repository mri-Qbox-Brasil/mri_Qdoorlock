--- Panel settings written over Config, on the server and on every client, so readers keep using Config
local RES <const> = GetCurrentResourceName()
local STATE_KEY <const> = RES .. ':settings'

---@param s table? the saved settings, one table per section
function ApplyDoorlockSettings(s)
    if type(s) ~= 'table' then return end

    if s.interaction then
        Config.Notify = s.interaction.notify
        Config.DrawTextUI = s.interaction.textUi
        Config.ShowLockIcon = s.interaction.lockIcon
    end

    if s.lockpick then
        Config.LockpickItems = s.lockpick.items
        Config.CanPickUnlockedDoors = s.lockpick.canPickUnlocked
        Config.LockDifficulty = s.lockpick.difficulty
    end

    if s.passcode then
        Config.PasscodeCooldown = s.passcode.cooldown
    end

    if s.access then
        Config.CommandPrincipal = s.access.principal
        Config.PlayerAceAuthorised = s.access.aceAuthorised
    end
end

if IsDuplicityVersion() then return end

ApplyDoorlockSettings(GlobalState[STATE_KEY])

-- the handler runs before GlobalState holds the new value: use the parameter
AddStateBagChangeHandler(STATE_KEY, 'global', function(_, _, value)
    ApplyDoorlockSettings(value)
    TriggerEvent(RES .. ':client:settingsApplied')
end)
