if not LoadResourceFile(cache.resource, 'web/build/index.html') then
	error(
		'Unable to load UI. Build ox_doorlock or download the latest release.\n	^3https://github.com/overextended/ox_doorlock/releases/latest/download/ox_doorlock.zip^0')
end

if not lib.checkDependency('oxmysql', '2.4.0') then return end
if not lib.checkDependency('ox_lib', '3.30.4') then return end

-- lib.versionCheck('overextended/ox_doorlock')
require 'server.convert'

local utils = require 'server.utils'
local doors = {}
local groups = {}


local function encodeData(door)
	local double = door.doors

	return json.encode({
		auto = door.auto,
		autolock = door.autolock,
		coords = door.coords,
		doors = double and {
			{
				coords = double[1].coords,
				heading = double[1].heading,
				model = double[1].model,
			},
			{
				coords = double[2].coords,
				heading = double[2].heading,
				model = double[2].model,
			},
		},
		characters = door.characters,
		groups = door.groups,
		heading = door.heading,
		items = door.items,
		lockpick = door.lockpick,
		hideUi = door.hideUi,
		holdOpen = door.holdOpen,
		lockSound = door.lockSound,
		maxDistance = door.maxDistance,
		doorRate = door.doorRate,
		model = door.model,
		state = door.state,
		unlockSound = door.unlockSound,
		passcode = door.passcode,
		passcodeType = door.passcodeType,
		passcodeCoords = door.passcodeCoords,
		lockpickDifficulty = door.lockpickDifficulty,
		lockpickSystem = door.lockpickSystem,
		doorGroupId = door.doorGroupId
	})
end

local function getDoor(door)
	door = type(door) == 'table' and door or doors[door]
	if not door then return false end
	return {
		id = door.id,
		name = door.name,
		state = door.state,
		coords = door.coords,
		characters = door.characters,
		groups = door.groups,
		items = door.items,
		maxDistance = door.maxDistance,
		passcodeType = door.passcodeType,
		passcodeCoords = door.passcodeCoords,
	}
end

exports('getDoor', getDoor)

exports('getAllDoors', function()
	local allDoors = {}

	for _, door in pairs(doors) do
		allDoors[#allDoors+1] = getDoor(door)
	end

	return allDoors
end)

exports('getDoorFromName', function(name)
	for _, door in pairs(doors) do
		if door.name == name then
			return getDoor(door)
		end
	end
end)

exports('editDoor', function(id, data)
	local door = doors[id]

	if door then
		for k, v in pairs(data) do
			if k ~= 'id' then
				local current = door[k]
				local t1 = type(current)
				local t2 = type(v)

				if t1 ~= 'nil' and v ~= '' and t1 ~= t2 then
					error(("Expected '%s' for door.%s, received %s (%s)"):format(t1, k, t2, v))
				end

				door[k] = v ~= '' and v or nil
			end
		end

		MySQL.update('UPDATE mri_qdoorlock SET name = ?, data = ?, group_id = ? WHERE id = ?', { door.name, encodeData(door), door.doorGroupId, id })
		TriggerClientEvent('ox_doorlock:editDoorlock', -1, id, door)
	end
end)

local soundDirectory = Config.NativeAudio and 'audio/dlc_oxdoorlock/oxdoorlock' or 'web/build/sounds'
local fileFormat = Config.NativeAudio and '%.wav' or '%.ogg'
local sounds = utils.getFilesInDirectory(soundDirectory, fileFormat)

lib.callback.register('ox_doorlock:getSounds', function()
	return sounds
end)

local function createDoor(id, door, name)
	local double = door.doors
	door.id = id
	door.name = name

	local rand = math.random(100000, 999999)

	if double then
		for i = 1, 2 do
			double[i].hash = joaat(('ox_door_%s_%s_%s'):format(id, i, rand))

			local coords = double[i].coords
			double[i].coords = vector3(coords.x, coords.y, coords.z)
		end

		if not door.coords then
			door.coords = double[1].coords - ((double[1].coords - double[2].coords) / 2)
		end
	else
		door.hash = joaat(('ox_door_%s_%s'):format(id, rand))
	end

	door.coords = vector3(door.coords.x, door.coords.y, door.coords.z)

	if not door.state then
		door.state = 1
	end

	if type(door.items?[1]) == 'string' then
		local items = {}

		for i = 1, #door.items do
			items[i] = {
				name = door.items[i],
				remove = false,
			}
		end

		door.items = items
		MySQL.update('UPDATE mri_qdoorlock SET data = ? WHERE id = ?', { encodeData(door), id })
	end

	doors[id] = door
	return door
end

local isLoaded = false
local ox_inventory = exports.ox_inventory

SetTimeout(0, function()
	if GetPlayer then return end

	function GetPlayer(_) end
end)

function RemoveItem(playerId, item, slot)
	local player = GetPlayer(playerId)

	if player then ox_inventory:RemoveItem(playerId, item, 1, nil, slot) end
end

---@param player table
---@param items string[] | { name: string, remove?: boolean, metadata?: string }[]
---@param removeItem? boolean
---@return string?
function DoesPlayerHaveItem(player, items, removeItem)
	local playerId = player.source or player.PlayerData.source

	for i = 1, #items do
		local item = items[i]
		local itemName = item.name or item
		local data = ox_inventory:Search(playerId, 'slots', itemName, item.metadata)[1]

		if data and data.count > 0 then
			if removeItem or item.remove then
				ox_inventory:RemoveItem(playerId, itemName, 1, nil, data.slot)
			end

			return itemName
		end
	end
end

local function isAuthorised(playerId, door, lockpick, state)
	if Config.PlayerAceAuthorised and IsPlayerAceAllowed(playerId, 'command.doorlock') then
		return true
	end

	-- e.g. add_ace group.police "doorlock.mrpd locker rooms" allow
	-- add_principal fivem:123456 group.police
	-- or add_ace identifier.fivem:123456 "doorlock.mrpd locker rooms" allow
	if IsPlayerAceAllowed(playerId, ('doorlock.%s'):format(door.name)) then
		return true
	end

	-- Se a porta não tiver NENHUMA permissão definida, ela é pública
	if not door.characters and not door.groups and not door.items and not door.passcode then
		return true
	end

	local player = GetPlayer(playerId)
	local authorised = door.passcode or false --[[@as boolean | string | nil]]

	if player then
		if lockpick then
			return DoesPlayerHaveItem(player, Config.LockpickItems)
		end

		if door.characters and table.contains(door.characters, GetCharacterId(player)) then
			return true
		end

		if door.groups then
			authorised = IsPlayerInGroup(player, door.groups) and true or nil
		end

		if not authorised and door.items then
			authorised = DoesPlayerHaveItem(player, door.items) or nil
		end

		if authorised ~= nil and door.passcode then
			if state == 1 then
				authorised = true
			else
				authorised = door.passcode == lib.callback.await('ox_doorlock:inputPassCode', playerId)
			end
		end
	end

	return authorised
end

local sql = LoadResourceFile(cache.resource, 'sql/mri_Qdoorlock.sql')

MySQL.ready(function()
	local tables = MySQL.query.await("SHOW TABLES LIKE 'mri_qdoorlock'")
	local isFirstInstall = not tables or #tables == 0

	if isFirstInstall then
		print("^2[mri_Qdoorlock] Installing database tables for the first time...^0")
	end

	if sql then
		for query in string.gmatch(sql, "([^;]+)") do
			if query:match("%S") then
				MySQL.query.await(query)
			end
		end
	end

	if isFirstInstall then
		print("^2[mri_Qdoorlock] Database installation completed successfully!^0")
		
		-- Integração / Migração Automática do ox_doorlock
		local oxTables = MySQL.query.await("SHOW TABLES LIKE 'ox_doorlock'")
		if oxTables and #oxTables > 0 then
			print("^3[mri_Qdoorlock] ox_doorlock database detected! Starting automatic migration...^0")
			
			local oxGroupsTables = MySQL.query.await("SHOW TABLES LIKE 'ox_doorlock_groups'")
			if oxGroupsTables and #oxGroupsTables > 0 then
				MySQL.query.await([[
					INSERT IGNORE INTO `mri_qdoorlock_groups` (`id`, `name`, `coords`)
					SELECT `id`, `name`, `coords` FROM `ox_doorlock_groups`
				]])
			end

			MySQL.query.await([[
				INSERT IGNORE INTO `mri_qdoorlock` (`id`, `name`, `data`)
				SELECT `id`, `name`, `data` FROM `ox_doorlock`
			]])
			
			print("^2[mri_Qdoorlock] Migration completed! All doors and groups from ox_doorlock have been copied.^0")
		end
	end


	while Config.DoorList do Wait(100) end

	local response = MySQL.query.await('SELECT `id`, `name`, `data`, `group_id` FROM `mri_qdoorlock`')
	local groupsResponse = MySQL.query.await('SELECT `id`, `name`, `coords` FROM `mri_qdoorlock_groups`')

	if groupsResponse then
		for i = 1, #groupsResponse do
			local group = groupsResponse[i]
			if type(group.coords) == 'string' then
				group.coords = json.decode(group.coords)
			end
			groups[group.id] = group
		end
	end

	for i = 1, #response do
		local door = response[i]
		local doorData = json.decode(door.data)
		doorData.doorGroupId = door.group_id
		createDoor(door.id, doorData, door.name)
	end

	isLoaded = true

	TriggerEvent('ox_doorlock:loaded')
end)

---@param id number
---@param state 0 | 1 | boolean
---@param lockpick? boolean
---@return boolean
local function setDoorState(id, state, lockpick)
	local door = doors[id]

	state = (state == 1 or state == 0) and state or (state and 1 or 0)

	if door then
		local authorised = not source or source == '' or isAuthorised(source, door, lockpick, state)

		if authorised then
			door.state = state
			TriggerClientEvent('ox_doorlock:setState', -1, id, state, source)

			if door.autolock and state == 0 then
				SetTimeout(door.autolock * 1000, function()
					if door.state ~= 1 then
						door.state = 1

						TriggerClientEvent('ox_doorlock:setState', -1, id, door.state)
						TriggerEvent('ox_doorlock:stateChanged', nil, door.id, door.state == 1)
					end
				end)
			end

			TriggerEvent('ox_doorlock:stateChanged', source, door.id, state == 1,
				type(authorised) == 'string' and authorised)

			return true
		end

		if source then
			lib.notify(source,
				{ type = 'error', icon = 'lock', description = state == 0 and 'cannot_unlock' or 'cannot_lock' })
		end
	end

	return false
end

RegisterNetEvent('ox_doorlock:setState', setDoorState)
exports('setDoorState', setDoorState)

lib.callback.register('ox_doorlock:getDoors', function()
	while not isLoaded do Wait(100) end

	return doors, sounds, groups
end)

RegisterNetEvent('ox_doorlock:editDoorlock', function(id, data)
	local source = source

	if type(id) == 'table' then
		id = false
	else
		id = tonumber(id) or id
	end

	if IsPlayerAceAllowed(source, 'command.doorlock') then
		if data then
			if not data.coords then
				local double = data.doors
				data.coords = double[1].coords - ((double[1].coords - double[2].coords) / 2)
			end

			if not data.name then
				data.name = tostring(data.coords)
			end
		end

		if id then
			if data then
				MySQL.update('UPDATE mri_qdoorlock SET name = ?, data = ?, group_id = ? WHERE id = ?',
					{ data.name, encodeData(data), data.doorGroupId, id })
				data = createDoor(id, data, data.name)
			else
				MySQL.update('DELETE FROM mri_qdoorlock WHERE id = ?', { id })
				doors[id] = nil
			end

			TriggerClientEvent('ox_doorlock:editDoorlock', -1, id, data)
		else
			local insertId = MySQL.insert.await('INSERT INTO mri_qdoorlock (name, data, group_id) VALUES (?, ?, ?)',
				{ data.name, encodeData(data), data.doorGroupId })
			local door = createDoor(insertId, data, data.name)

			TriggerClientEvent('ox_doorlock:setState', -1, door.id, door.state, false, door)
		end
	end
end)

RegisterNetEvent('ox_doorlock:breakLockpick', function()
	local player = GetPlayer(source)
	return player and DoesPlayerHaveItem(player, Config.LockpickItems, true)
end)

lib.addCommand('doorlock', {
	help = locale('create_modify_lock'),
	params = {
		{
			name = 'closest',
			help = locale('command_closest'),
			optional = true,
		},
	},
	restricted = Config.CommandPrincipal
}, function(source, args)
	TriggerClientEvent('ox_doorlock:triggeredCommand', source, args.closest)
end)

RegisterNetEvent('ox_doorlock:editGroup', function(id, data)
	local source = source
	if not IsPlayerAceAllowed(source, 'command.doorlock') then return end

	if id then
		id = tonumber(id) or id
		if data then
			data.id = id
			MySQL.update('UPDATE mri_qdoorlock_groups SET name = ?, coords = ? WHERE id = ?',
				{ data.name, json.encode(data.coords), id })
			groups[id] = data
		else
			MySQL.update('DELETE FROM mri_qdoorlock_groups WHERE id = ?', { id })
			groups[id] = nil
			-- Delete all doors in this group
			for doorId, door in pairs(doors) do
				if door.doorGroupId == id then
					doors[doorId] = nil
					TriggerClientEvent('ox_doorlock:editDoorlock', -1, doorId, nil)
				end
			end
		end
	else
		local insertId = MySQL.insert.await('INSERT INTO mri_qdoorlock_groups (name, coords) VALUES (?, ?)',
			{ data.name, json.encode(data.coords) })
		id = insertId
		data.id = insertId
		groups[insertId] = data
	end

	TriggerClientEvent('ox_doorlock:updateGroup', -1, id, data)
end)

local function registerPlugin()
    if GetResourceState('mri_Qadmin') ~= 'started' then return end
    local ok, result = pcall(function()
        return exports['mri_Qadmin']:RegisterPlugin({
            id = 'doorlock',
            label = 'Portas',
            icon = 'door-closed',
            resource = 'mri_Qdoorlock',
            htmlPath = 'web/build/index.html',
            requiredPerms = { 'command.doorlock' },
            description = 'Gerenciamento de portas e acessos do servidor',
        })
    end)
    if not ok or result == false then
        print(('[mri_Qdoorlock] Failed to register plugin in mri_Qadmin: %s'):format(tostring(result)))
    end
end

CreateThread(function()
    local deadline = GetGameTimer() + 10000
    while GetResourceState('mri_Qadmin') ~= 'started' and GetGameTimer() < deadline do
        Wait(200)
    end
    registerPlugin()
end)

AddEventHandler('onResourceStart', function(resourceName)
    if resourceName == 'mri_Qadmin' then
        Wait(500)
        registerPlugin()
    end
end)
