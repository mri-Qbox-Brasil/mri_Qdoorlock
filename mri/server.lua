local function registerPlugin()
    if GetResourceState('mri_Qadmin') ~= 'started' then return end
    local ok, result = pcall(function()
        return exports['mri_Qadmin']:RegisterPlugin({
            id = 'doorlock',
            label = 'Portas',
            icon = 'door-closed',
            resource = cache.resource,
            htmlPath = 'web/build/index.html',
            requiredPerms = { 'command.doorlock' },
            description = 'Gerenciamento de portas e acessos do servidor',
        })
    end)
    if not ok or result == false then
        print(('[mri_Qdoorlock] Failed to register plugin in mri_Qadmin: %s'):format(tostring(result)))
    end
end

-- Qadmin already up covers our restart; pluginsReady covers Qadmin starting or restarting later.
registerPlugin()
AddEventHandler('mri_Qadmin:server:pluginsReady', registerPlugin)

local function addGroupOptions(options, groups, kind)
    for name, group in pairs(type(groups) == 'table' and groups or {}) do
        local grades = {}
        for level, grade in pairs(type(group) == 'table' and type(group.grades) == 'table' and group.grades or {}) do
            grades[#grades + 1] = { value = tonumber(level) or 0, label = type(grade) == 'table' and grade.name or tostring(level) }
        end
        table.sort(grades, function(a, b) return a.value < b.value end)
        options[#options + 1] = { value = name, label = type(group) == 'table' and group.label or name, kind = kind, grades = grades }
    end
end

-- Jobs and gangs with their grades, for the door's group picker.
lib.callback.register('mri_Qdoorlock:server:groupOptions', function(source)
    if not IsPlayerAceAllowed(source, 'command.doorlock') or GetResourceState('qbx_core') ~= 'started' then return {} end
    local options = {}
    addGroupOptions(options, exports.qbx_core:GetJobs(), 'job')
    addGroupOptions(options, exports.qbx_core:GetGangs(), 'gang')
    table.sort(options, function(a, b) return tostring(a.label):lower() < tostring(b.label):lower() end)
    return options
end)

-- Job types (leo, ems) with the jobs in each, for the door and door group pickers.
lib.callback.register('mri_Qdoorlock:server:jobTypeOptions', function(source)
    if not IsPlayerAceAllowed(source, 'command.doorlock') or GetResourceState('qbx_core') ~= 'started' then return {} end
    local byType = {}
    for _, job in pairs(exports.qbx_core:GetJobs() or {}) do
        if type(job) == 'table' and type(job.type) == 'string' and job.type ~= '' then
            byType[job.type] = byType[job.type] or {}
            table.insert(byType[job.type], job.label or job.type)
        end
    end
    local options = {}
    for jobType, jobs in pairs(byType) do
        table.sort(jobs)
        options[#options + 1] = { value = jobType, label = jobType, jobs = jobs }
    end
    table.sort(options, function(a, b) return a.value < b.value end)
    return options
end)

-- Every character (online or not) by name, for the door's character picker.
lib.callback.register('mri_Qdoorlock:server:characterOptions', function(source)
    if not IsPlayerAceAllowed(source, 'command.doorlock') or GetResourceState('qbx_core') ~= 'started' then return {} end
    local options = {}
    for _, row in ipairs(MySQL.query.await('SELECT citizenid, charinfo FROM players') or {}) do
        local ok, info = pcall(json.decode, row.charinfo or '')
        local name = ok and type(info) == 'table' and ('%s %s'):format(info.firstname or '', info.lastname or ''):match('^%s*(.-)%s*$') or ''
        options[#options + 1] = { value = row.citizenid, label = name ~= '' and name or row.citizenid }
    end
    table.sort(options, function(a, b) return a.label:lower() < b.label:lower() end)
    return options
end)

-- Forwards the suite color convars to clients live (client/utils.lua passes them to the NUI).
AddConvarChangeListener('mri:color', function(name)
    if name ~= 'mri:color' then return end
    local color = GetConvar('mri:color', '#00E699')
    if not color:match('^#%x%x%x%x%x%x$') then return end
    TriggerClientEvent('mri_Qdoorlock:accentColorChanged', -1, color)
end)

AddConvarChangeListener('mri:backgroundColor', function(name)
    if name ~= 'mri:backgroundColor' then return end
    local color = GetConvar('mri:backgroundColor', '')
    if color ~= '' and not color:match('^#%x%x%x%x%x%x$') then return end
    TriggerClientEvent('mri_Qdoorlock:backgroundColorChanged', -1, color)
end)
