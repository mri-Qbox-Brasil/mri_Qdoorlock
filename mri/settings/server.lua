--- Options edited in the panel's Ajustes tab; data/settings.json stays off files{} and out of git
local RES <const> = GetCurrentResourceName()
local FILE <const> = 'data/settings.json'
local STATE_KEY <const> = RES .. ':settings'
local DIFFICULTIES <const> = { easy = true, medium = true, hard = true }

local function copyList(list)
    local out = {}
    for i, v in ipairs(type(list) == 'table' and list or {}) do out[i] = v end
    return out
end

--- First run starts from config.lua, so a server that edited it keeps its values
local DEFAULTS <const> = {
    interaction = {
        notify = Config.Notify == true,
        textUi = Config.DrawTextUI == true,
        lockIcon = Config.ShowLockIcon ~= false,
    },
    lockpick = {
        items = copyList(Config.LockpickItems),
        canPickUnlocked = Config.CanPickUnlockedDoors == true,
        difficulty = copyList(Config.LockDifficulty),
    },
    passcode = { cooldown = tonumber(Config.PasscodeCooldown) or 2000 },
    access = {
        principal = type(Config.CommandPrincipal) == 'string' and Config.CommandPrincipal or 'group.admin',
        aceAuthorised = Config.PlayerAceAuthorised == true,
    },
}

-- lists taken whole from the panel (then cleaned), never merged key by key
local WHOLE <const> = {
    [DEFAULTS.lockpick.items] = true,
    [DEFAULTS.lockpick.difficulty] = true,
}

local current = {}

--- Copy of the defaults taking, per key, the new value or else the previous one, only when it keeps the default's type
local function merge(defaults, new, previous)
    local out = {}
    for k, v in pairs(defaults) do
        local n, p
        if type(new) == 'table' then n = new[k] end
        if type(previous) == 'table' then p = previous[k] end
        if type(v) == 'table' and WHOLE[v] then
            out[k] = type(n) == 'table' and n or type(p) == 'table' and p or v
        elseif type(v) == 'table' then
            out[k] = merge(v, n, p)
        elseif type(n) == type(v) then
            out[k] = n
        elseif type(p) == type(v) then
            out[k] = p
        else
            out[k] = v
        end
        if type(out[k]) == 'number' then out[k] = math.max(math.floor(out[k]), 0) end
    end
    return out
end

local CLEAN <const> = {
    lockpick = function(s)
        local items, seen = {}, {}
        for _, name in ipairs(s.items) do
            if type(name) == 'string' and name ~= '' and not seen[name] then
                seen[name] = true
                items[#items + 1] = name:sub(1, 64)
            end
        end
        s.items = items

        local difficulty = {}
        for _, level in ipairs(s.difficulty) do
            if DIFFICULTIES[level] and #difficulty < 6 then difficulty[#difficulty + 1] = level end
        end
        s.difficulty = #difficulty > 0 and difficulty or copyList(DEFAULTS.lockpick.difficulty)
    end,
    access = function(s)
        if not s.principal:match('^[%w_%.:%-]+$') then s.principal = DEFAULTS.access.principal end
    end,
}

local function publish()
    ApplyDoorlockSettings(current)
    GlobalState[STATE_KEY] = current
end

-- Loads before server/main.lua, so its lib.addCommand already grants the saved principal.
local function load()
    local ok, saved = pcall(json.decode, LoadResourceFile(RES, FILE) or '')
    current = merge(DEFAULTS, ok and saved or nil)
    for section, clean in pairs(CLEAN) do clean(current[section]) end
    publish()
end
load()

-- The panel changed who manages doors: move the command.doorlock grant.
local function movePrincipal(previous)
    local principal = Config.CommandPrincipal
    if previous == principal then return end
    lib.removeAce(previous, 'command.doorlock')
    lib.addAce(principal, 'command.doorlock')
end

local function save(section, values)
    if not DEFAULTS[section] or type(values) ~= 'table' then return false end
    current[section] = merge(DEFAULTS[section], values, current[section])
    if CLEAN[section] then CLEAN[section](current[section]) end
    if not SaveResourceFile(RES, FILE, json.encode(current, { indent = true }), -1) then return false end
    local previous = Config.CommandPrincipal
    publish()
    movePrincipal(previous)
    return true
end

local function isAdmin(source)
    return IsPlayerAceAllowed(source, 'command.doorlock')
end

lib.callback.register('mri_Qdoorlock:server:getSettings', function(source)
    if not isAdmin(source) then return false end
    return current
end)

lib.callback.register('mri_Qdoorlock:server:saveSettings', function(source, section, values)
    if not isAdmin(source) then return false end
    return type(section) == 'string' and save(section, values)
end)

-- Items for the lockpick picker.
lib.callback.register('mri_Qdoorlock:server:itemOptions', function(source)
    if not isAdmin(source) or GetResourceState('ox_inventory') ~= 'started' then return {} end
    local options = {}
    for name, item in pairs(exports.ox_inventory:Items() or {}) do
        options[#options + 1] = { value = name, label = type(item) == 'table' and item.label or name }
    end
    table.sort(options, function(a, b) return tostring(a.label):lower() < tostring(b.label):lower() end)
    return options
end)
