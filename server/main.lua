if not LoadResourceFile(cache.resource, 'web/build/index.html') then
	error('Unable to load UI. Build the web folder or download the latest mri_Qdoorlock release.\n	^3https://github.com/mri-Qbox-Brasil/mri_Qdoorlock/releases/latest^0')
end

if not lib.checkDependency('oxmysql', '2.4.0') then return end
if not lib.checkDependency('ox_lib', '3.30.4') then return end

-- lib.versionCheck('overextended/ox_doorlock')
local TriggerEventHooks = require 'server.hooks'

local utils = require 'server.utils'
local doors = {}
local groups = {}
local passcodeCooldowns = {}

-- Returns a copy of the door without the real passcode. Regular players only need
-- to know whether a passcode exists (hasPasscode) — the value stays server-side so
-- it can't be read out of the client-side `doors` table.
local function sanitizeDoor(door)
	if not door or not door.passcode then return door end

	local copy = {}
	for k, v in pairs(door) do copy[k] = v end
	copy.passcode = nil
	copy.hasPasscode = true
	return copy
end

-- Broadcasts door data, sending the real passcode only to players allowed to manage
-- doors (they need it to edit). Everyone else receives the sanitized version.
local function broadcastDoorData(sendFull, sendSafe, door)
	if not door or not door.passcode then
		return sendFull(-1)
	end

	local safe = sanitizeDoor(door)

	for _, pid in ipairs(GetPlayers()) do
		local target = tonumber(pid)

		if IsPlayerAceAllowed(target, 'command.doorlock') then
			sendFull(target)
		else
			sendSafe(target, safe)
		end
	end
end


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
		jobTypes = door.jobTypes,
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

		MySQL.update('UPDATE ox_doorlock SET name = ?, data = ?, group_id = ? WHERE id = ?', { door.name, encodeData(door), door.doorGroupId, id })
		broadcastDoorData(
			function(target) TriggerClientEvent('ox_doorlock:editDoorlock', target, id, door) end,
			function(target, safe) TriggerClientEvent('ox_doorlock:editDoorlock', target, id, safe) end,
			door)
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
		MySQL.update('UPDATE ox_doorlock SET data = ? WHERE id = ?', { encodeData(door), id })
	end

	doors[id] = door
	return door
end

exports('createDoor', function(data)
	if type(data) ~= 'table' then
		error('Expected table for door data')
	end

	if not data.coords then
		local double = data.doors

		if not double then
			error('Door data requires coords or doors')
		end

		data.coords = double[1].coords - ((double[1].coords - double[2].coords) / 2)
	end

	if not data.name then
		data.name = tostring(data.coords)
	end

	local insertId = MySQL.insert.await('INSERT INTO ox_doorlock (name, data, group_id) VALUES (?, ?, ?)',
		{ data.name, encodeData(data), data.doorGroupId })
	local door = createDoor(insertId, data, data.name)

	broadcastDoorData(
		function(target) TriggerClientEvent('ox_doorlock:setState', target, door.id, door.state, false, door) end,
		function(target, safe) TriggerClientEvent('ox_doorlock:setState', target, door.id, door.state, false, safe) end,
		door)

	return door.id
end)

local function removeDoor(id)
	if not doors[id] then return false end

	MySQL.update('DELETE FROM ox_doorlock WHERE id = ?', { id })
	doors[id] = nil
	TriggerClientEvent('ox_doorlock:editDoorlock', -1, id, nil)

	return true
end

exports('removeDoor', function(id)
	if not doors[id] then
		error(('No door found with id %s'):format(id))
	end

	return removeDoor(id)
end)

local isLoaded = false
local ox_inventory = exports.ox_inventory

SetTimeout(0, function()
	if not GetPlayerJobType then
		-- Only qbx_core has job types (leo, ems): elsewhere the type rule never matches.
		function GetPlayerJobType(_) end
	end

	if GetPlayer then return end

	function GetPlayer(_) end
end)

--- Job/gang name -> minimum grade, from the panel
local function cleanGrades(list)
	if type(list) ~= 'table' then return nil end
	local out, any = {}, false
	for name, grade in pairs(list) do
		if type(name) == 'string' and name ~= '' then
			out[name:sub(1, 64)] = math.max(math.floor(tonumber(grade) or 0), 0)
			any = true
		end
	end
	return any and out or nil
end

--- List of job types (leo, ems), from the panel
local function cleanTypes(list)
	if type(list) ~= 'table' then return nil end
	local out, seen = {}, {}
	for _, value in ipairs(list) do
		if type(value) == 'string' and value ~= '' and not seen[value] then
			seen[value] = true
			out[#out + 1] = value:sub(1, 32)
		end
	end
	return #out > 0 and out or nil
end

local function cleanAccess(access)
	if type(access) ~= 'table' then return nil end
	local out = { groups = cleanGrades(access.groups), jobTypes = cleanTypes(access.jobTypes) }
	return (out.groups or out.jobTypes) and out or nil
end

local function hasJobType(player, types)
	if not types then return false end
	local jobType = GetPlayerJobType(player)
	return jobType ~= nil and table.contains(types, jobType)
end

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

	-- The door group's rule opens every door in it, on top of the door's own rules.
	local access = door.doorGroupId and groups[door.doorGroupId]?.access

	-- No rule at all, on the door or its group: a public door.
	if not door.characters and not door.groups and not door.items and not door.passcode and not door.jobTypes and not access then
		return true
	end

	local player = GetPlayer(playerId)
	local authorised = door.passcode or false --[[@as boolean | string | nil]]

	if player then
		if lockpick then
			if not door.lockpick or (state == 1 and not Config.CanPickUnlockedDoors) then return false end

			-- Small margin over maxDistance for ped position sync lag.
			if #(GetEntityCoords(GetPlayerPed(playerId)) - door.coords) > (door.maxDistance or 2.0) + 2.0 then return false end

			return DoesPlayerHaveItem(player, Config.LockpickItems)
		end

		if door.characters and table.contains(door.characters, GetCharacterId(player)) then
			return true
		end

		if door.groups or door.jobTypes or access then
			authorised = ((door.groups and IsPlayerInGroup(player, door.groups))
				or (access?.groups and IsPlayerInGroup(player, access.groups))
				or hasJobType(player, door.jobTypes)
				or hasJobType(player, access?.jobTypes)) and true or nil
		end

		if not authorised and door.items then
			authorised = DoesPlayerHaveItem(player, door.items) or nil
		end
	end

	if authorised ~= nil and door.passcode then
		if state == 1 then
			authorised = true
		else
			-- Throttle passcode attempts to prevent brute-forcing.
			local now = GetGameTimer()
			local readyAt = passcodeCooldowns[playerId]

			if readyAt and now < readyAt then
				return false
			end

			authorised = door.passcode == lib.callback.await('ox_doorlock:inputPassCode', playerId)

			if authorised then
				passcodeCooldowns[playerId] = nil
			else
				passcodeCooldowns[playerId] = now + (Config.PasscodeCooldown or 2000)
			end
		end
	end

	local hookResult = TriggerEventHooks('doorAuthorization', {
		source = playerId,
		door = door,
		lockpick = lockpick,
		state = state,
		authorised = authorised,
	})

	if hookResult ~= nil then
		return authorised or hookResult
	end

	return authorised
end

local sql = LoadResourceFile(cache.resource, 'sql/ox_doorlock.sql')

local function tableExists(name)
	local count = MySQL.scalar.await(
		'SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
		{ name })
	return (count or 0) > 0
end

local function columnExists(tableName, column)
	local count = MySQL.scalar.await(
		'SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
		{ tableName, column })
	return (count or 0) > 0
end

local function foreignKeyExists(tableName, column)
	local count = MySQL.scalar.await(
		'SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL',
		{ tableName, column })
	return (count or 0) > 0
end

local function installSchema()
	local firstInstall = not tableExists('ox_doorlock')

	if firstInstall then
		print('^2[mri_Qdoorlock] Installing database tables for the first time...^0')
	end

	if sql then
		for query in string.gmatch(sql, '([^;]+)') do
			if query:match('%S') then
				MySQL.query.await(query)
			end
		end
	end

	if not columnExists('ox_doorlock_groups', 'access') then
		MySQL.query.await('ALTER TABLE `ox_doorlock_groups` ADD COLUMN `access` longtext DEFAULT NULL')
	end

	if not columnExists('ox_doorlock', 'group_id') then
		print('^3[mri_Qdoorlock] Existing ox_doorlock table found, adding the group_id column...^0')
		MySQL.query.await('ALTER TABLE `ox_doorlock` ADD COLUMN `group_id` int(11) unsigned DEFAULT NULL, ADD KEY `fk_ox_doorlock_group` (`group_id`)')
	end

	if not foreignKeyExists('ox_doorlock', 'group_id') then
		MySQL.query.await('ALTER TABLE `ox_doorlock` ADD CONSTRAINT `fk_ox_doorlock_group` FOREIGN KEY (`group_id`) REFERENCES `ox_doorlock_groups` (`id`) ON DELETE CASCADE')
	end

	if firstInstall then
		print('^2[mri_Qdoorlock] Database installation completed successfully!^0')
	end
end

local function migrateLegacyTables()
	if not tableExists('mri_qdoorlock') then return end

	print('^3[mri_Qdoorlock] Legacy mri_qdoorlock tables found, moving doors and groups into ox_doorlock...^0')

	local hasGroups = tableExists('mri_qdoorlock_groups')

	if hasGroups then
		MySQL.query.await([[
			INSERT INTO `ox_doorlock_groups` (`id`, `name`, `coords`)
			SELECT `id`, `name`, `coords` FROM `mri_qdoorlock_groups`
			ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `coords` = VALUES(`coords`)
		]])
	end

	MySQL.query.await([[
		INSERT INTO `ox_doorlock` (`id`, `name`, `data`, `group_id`)
		SELECT `id`, `name`, `data`, `group_id` FROM `mri_qdoorlock`
		ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `data` = VALUES(`data`), `group_id` = VALUES(`group_id`)
	]])

	local suffix = tableExists('mri_qdoorlock_migrated') and ('_migrated_%s'):format(os.time()) or '_migrated'
	local renames = { ('`mri_qdoorlock` TO `mri_qdoorlock%s`'):format(suffix) }

	if hasGroups then
		renames[#renames + 1] = ('`mri_qdoorlock_groups` TO `mri_qdoorlock_groups%s`'):format(suffix)
	end

	MySQL.query.await('RENAME TABLE ' .. table.concat(renames, ', '))

	print(('^2[mri_Qdoorlock] Migration completed! Old tables kept as mri_qdoorlock%s for backup.^0'):format(suffix))
end

MySQL.ready(function()
	installSchema()
	migrateLegacyTables()

	local response = MySQL.query.await('SELECT `id`, `name`, `data`, `group_id` FROM `ox_doorlock`')
	local groupsResponse = MySQL.query.await('SELECT `id`, `name`, `coords`, `access` FROM `ox_doorlock_groups`')

	if groupsResponse then
		for i = 1, #groupsResponse do
			local group = groupsResponse[i]
			if type(group.coords) == 'string' then
				group.coords = json.decode(group.coords)
			end
			local ok, access = pcall(json.decode, group.access or '')
			group.access = ok and cleanAccess(access) or nil
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
				-- Only the most recent unlock's timer should re-lock the door, otherwise
				-- unlocking repeatedly stacks timers that all fire.
				door.autolockToken = (door.autolockToken or 0) + 1
				local token = door.autolockToken

				SetTimeout(door.autolock * 1000, function()
					if door.autolockToken == token and door.state ~= 1 then
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
				{ type = 'error', icon = 'lock', description = locale(state == 0 and 'cannot_unlock' or 'cannot_lock') })
		end
	end

	return false
end

RegisterNetEvent('ox_doorlock:setState', setDoorState)
exports('setDoorState', setDoorState)

AddEventHandler('playerDropped', function()
	passcodeCooldowns[source] = nil
end)

lib.callback.register('ox_doorlock:getDoors', function(source)
	while not isLoaded do Wait(100) end

	if IsPlayerAceAllowed(source, 'command.doorlock') then
		return doors, sounds, groups
	end

	local safe = {}
	for id, door in pairs(doors) do
		safe[id] = sanitizeDoor(door)
	end

	return safe, sounds, groups
end)

-- Only the saved fields: the client sends its whole door (entity, distance, zone) and that must not spread.
local function cleanDoor(data)
	local clean = json.decode(encodeData(data))
	clean.name = type(data.name) == 'string' and data.name ~= '' and data.name:sub(1, 64) or nil
	clean.doorGroupId = tonumber(data.doorGroupId)
	return clean
end

---@return number|false id of the saved door, false when refused
local function editDoorlock(source, id, data)
	if not IsPlayerAceAllowed(source, 'command.doorlock') then return false end

	id = type(id) ~= 'table' and (tonumber(id) or id) or false

	if data then
		data = cleanDoor(data)

		if not data.coords then
			local double = data.doors
			if not double or not double[1]?.coords or not double[2]?.coords then return false end
			local a, b = double[1].coords, double[2].coords
			data.coords = { x = (a.x + b.x) / 2, y = (a.y + b.y) / 2, z = (a.z + b.z) / 2 }
		end

		if not data.name then
			data.name = ('%.2f, %.2f, %.2f'):format(data.coords.x, data.coords.y, data.coords.z)
		end
	end

	if id then
		if not doors[id] then return false end

		if data then
			MySQL.update.await('UPDATE ox_doorlock SET name = ?, data = ?, group_id = ? WHERE id = ?',
				{ data.name, encodeData(data), data.doorGroupId, id })
			data = createDoor(id, data, data.name)
		else
			MySQL.update.await('DELETE FROM ox_doorlock WHERE id = ?', { id })
			doors[id] = nil
		end

		broadcastDoorData(
			function(target) TriggerClientEvent('ox_doorlock:editDoorlock', target, id, data) end,
			function(target, safe) TriggerClientEvent('ox_doorlock:editDoorlock', target, id, safe) end,
			data)

		return id
	end

	if not data then return false end

	local insertId = MySQL.insert.await('INSERT INTO ox_doorlock (name, data, group_id) VALUES (?, ?, ?)',
		{ data.name, encodeData(data), data.doorGroupId })
	local door = createDoor(insertId, data, data.name)

	broadcastDoorData(
		function(target) TriggerClientEvent('ox_doorlock:setState', target, door.id, door.state, false, door) end,
		function(target, safe) TriggerClientEvent('ox_doorlock:setState', target, door.id, door.state, false, safe) end,
		door)

	return door.id
end

RegisterNetEvent('ox_doorlock:editDoorlock', function(id, data)
	editDoorlock(source, id, data)
end)

-- The panel waits for the save, so its answer already carries the fresh list.
lib.callback.register('mri_Qdoorlock:server:editDoor', editDoorlock)

RegisterNetEvent('ox_doorlock:breakLockpick', function()
	local player = GetPlayer(source)
	return player and DoesPlayerHaveItem(player, Config.LockpickItems, true)
end)

RegisterNetEvent('ox_doorlock:RemoveDoorlock', function(name)
	local source = source

	if source and source ~= '' and source ~= 0 and not IsPlayerAceAllowed(source, 'command.doorlock') then return end
	if type(name) ~= 'string' or name == '' then return end

	local prefix = name .. '_'

	for id, door in pairs(doors) do
		if door.name == name or door.name:sub(1, #prefix) == prefix then
			removeDoor(id)
		end
	end
end)

local function teleportPlayer(playerId, coords)
	if not coords or not IsPlayerAceAllowed(playerId, 'command.doorlock') then return end

	SetEntityCoords(GetPlayerPed(playerId), coords.x, coords.y, coords.z, false, false, false, false)
end

RegisterNetEvent('ox_doorlock:teleportToDoor', function(id)
	teleportPlayer(source, doors[tonumber(id) or id]?.coords)
end)

RegisterNetEvent('ox_doorlock:teleportToGroup', function(id)
	teleportPlayer(source, groups[tonumber(id) or id]?.coords)
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

---@return number|false id of the saved group, false when refused
local function editGroup(source, id, data)
	if not IsPlayerAceAllowed(source, 'command.doorlock') then return false end

	id = id and (tonumber(id) or id) or false

	if data then
		local name = type(data.name) == 'string' and data.name:match('^%s*(.-)%s*$') or ''
		local coords = (type(data.coords) == 'table' or type(data.coords) == 'vector3') and data.coords or nil
		if name == '' or not coords then return false end
		-- Plain table: a vector3 does not survive the NUI answer.
		-- Without an access field (old callers) the group keeps the rule it had.
		local access = data.access ~= nil and cleanAccess(data.access) or (id and groups[id]?.access) or nil
		data = { name = name:sub(1, 64), coords = { x = coords.x + 0.0, y = coords.y + 0.0, z = coords.z + 0.0 }, access = access }
	end

	if id then
		if not groups[id] then return false end

		if data then
			data.id = id
			MySQL.update.await('UPDATE ox_doorlock_groups SET name = ?, coords = ?, access = ? WHERE id = ?',
				{ data.name, json.encode(data.coords), data.access and json.encode(data.access) or nil, id })
			groups[id] = data
		else
			MySQL.update.await('DELETE FROM ox_doorlock_groups WHERE id = ?', { id })
			groups[id] = nil
			-- The foreign key already removed this group's doors from the table.
			for doorId, door in pairs(doors) do
				if door.doorGroupId == id then
					doors[doorId] = nil
					TriggerClientEvent('ox_doorlock:editDoorlock', -1, doorId, nil)
				end
			end
		end
	else
		if not data then return false end
		id = MySQL.insert.await('INSERT INTO ox_doorlock_groups (name, coords, access) VALUES (?, ?, ?)',
			{ data.name, json.encode(data.coords), data.access and json.encode(data.access) or nil })
		data.id = id
		groups[id] = data
	end

	TriggerClientEvent('ox_doorlock:updateGroup', -1, id, data)
	return id
end

RegisterNetEvent('ox_doorlock:editGroup', function(id, data)
	editGroup(source, id, data)
end)

lib.callback.register('mri_Qdoorlock:server:editGroup', editGroup)
