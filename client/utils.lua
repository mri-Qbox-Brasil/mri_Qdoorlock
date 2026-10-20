local Entity = Entity

local debugGroupId = nil
local outlinedEntities = {}

local function getDoorFromEntity(data)
	local entity = type(data) == 'table' and data.entity or data

	if not entity then return end

	local state = Entity(entity)?.state
	local doorId = state?.doorId

	if not doorId then return end

	local door = doors[doorId]

	if not door then
		state.doorId = nil
	end

	return door
end

exports('getClosestDoorId', function() return ClosestDoor?.id end)
exports('getDoorIdFromEntity', function(entityId) return getDoorFromEntity(entityId)?.id end) -- same as Entity(entityId).state.doorId

local function entityIsNotDoor(data, allowedDoorId)
	local entity = type(data) == 'number' and data or data.entity
	local door = getDoorFromEntity(entity)
	if door and door.id == allowedDoorId then return true end
	return not door
end

PickingLock = false

local function canPickLock(entity)
	if PickingLock then return false end

	local door = getDoorFromEntity(entity)

	return door and door.lockpick and (Config.CanPickUnlockedDoors or door.state == 1)
end

---@param entity number
local function pickLock(entity)
	local door = getDoorFromEntity(entity)

	if not door or PickingLock or not door.lockpick or (not Config.CanPickUnlockedDoors and door.state == 0) then return end

	PickingLock = true

	TaskTurnPedToFaceCoord(cache.ped, door.coords.x, door.coords.y, door.coords.z, 4000)
	Wait(500)

	local animDict = lib.requestAnimDict('mp_common_heist')

	TaskPlayAnim(cache.ped, animDict, 'pick_door', 3.0, 1.0, -1, 49, 0, true, true, true)

	local success = false
	if door.lockpickSystem == 't3_lockpick' and (GetResourceState('t3_lockpick') == 'started' or GetResourceState('t3_lockpick') == 'starting') then
		local t3Diff = 2
		local t3Pins = 4
		local diffConf = door.lockpickDifficulty and door.lockpickDifficulty[1] or 'medium'
		
		if type(diffConf) == 'string' then
			if diffConf == 'easy' then t3Diff = 1; t3Pins = 3
			elseif diffConf == 'medium' then t3Diff = 2; t3Pins = 4
			elseif diffConf == 'hard' then t3Diff = 3; t3Pins = 5
			end
		elseif type(diffConf) == 'table' then
			t3Diff = diffConf.difficulty or 2
			t3Pins = diffConf.pins or 4
		end
		
		success = exports['t3_lockpick']:startLockpick(Config.LockpickItems[1], t3Diff, t3Pins)
	else
		local difficulty = door.lockpickDifficulty or Config.LockDifficulty
		if type(difficulty) == 'table' then
			local expanded = {}
			for i = 1, #difficulty do
				local diff = difficulty[i]
				if type(diff) == 'table' and diff.stages and diff.stages > 1 then
					for _ = 1, diff.stages do
						expanded[#expanded + 1] = { areaSize = diff.areaSize, speedMultiplier = diff.speedMultiplier }
					end
				else
					expanded[#expanded + 1] = diff
				end
			end
			difficulty = expanded
		end

		success = lib.skillCheck(difficulty)
	end

	local rand = math.random(1, success and 100 or 5)

	if success then
		TriggerServerEvent('ox_doorlock:setState', door.id, door.state == 1 and 0 or 1, true)
	end

	if rand == 1 then
		TriggerServerEvent('ox_doorlock:breakLockpick')
		lib.notify({ type = 'error', description = locale('lockpick_broke') })
	end

	StopEntityAnim(cache.ped, 'pick_door', animDict, 0)
	RemoveAnimDict(animDict)

	PickingLock = false
end

exports('pickClosestDoor', function()
	if not ClosestDoor then return end

	pickLock(ClosestDoor.entity)
end)

RegisterNUICallback('notify', function(data, cb)
	cb(1)
	lib.notify({ title = data })
end)

-- Panel calls answer in their own cb (templates/plugin of the mri-ui-kit skill): inside the mri_Qadmin
-- iframe SendNUIMessage never arrives, so every answer carries the fresh door and group lists.
local PLUGIN_ID <const> = 'doorlock'

--- Vectors as plain tables: the answer of a NUI callback does not keep vector3
local function plain(v)
	local t = type(v)
	if t == 'vector3' or t == 'vector4' then return { x = v.x, y = v.y, z = v.z } end
	if t ~= 'table' then return v end
	local out = {}
	for k, item in pairs(v) do out[k] = plain(item) end
	return out
end

-- Client-only fields of a door (game handles, per-frame distance) stay out of the panel and the server.
local LOCAL_FIELDS <const> = { entity = true, visualOffset = true, distance = true, radius = true }

local function doorForPanel(door)
	local out = {}
	for k, v in pairs(door) do
		if not LOCAL_FIELDS[k] then out[k] = plain(v) end
	end
	if out.doors then
		for i = 1, #out.doors do out.doors[i].entity = nil end
	end
	return out
end

DoorForPanel = doorForPanel

function DoorsForPanel()
	local list = {}
	for _, door in pairs(doors) do list[#list + 1] = doorForPanel(door) end
	return list
end

function GroupsForPanel()
	local list = {}
	for _, group in pairs(doorGroups) do list[#list + 1] = plain(group) end
	return list
end

local function fromAdmin(data)
	return type(data) == 'table' and data.embedded == true and GetResourceState('mri_Qadmin') == 'started'
end

--- Register a panel call: fn answers a table or value; the fresh lists ride along in _events
local function panelCallback(name, fn)
	RegisterNUICallback(name, function(data, cb)
		local ok, result = pcall(fn, type(data) == 'table' and data or {})
		if not ok then lib.print.error(result) end
		local answer = type(result) == 'table' and result or { value = ok and result or false }
		answer._events = {
			{ action = 'updateDoorData', data = DoorsForPanel() },
			{ action = 'updateDoorGroups', data = GroupsForPanel() },
		}
		cb(plain(answer))
	end)
end

local function hidePanel(data)
	if fromAdmin(data) then
		pcall(function() exports.mri_Qadmin:ClosePlugin() end)
	else
		SetNuiFocus(false, false)
		ClearTimecycleModifier()
		SendNUIMessage({ action = 'setVisible', data = false })
	end
end

local function showPanel(data)
	if fromAdmin(data) then
		pcall(function() exports.mri_Qadmin:OpenPlugin(PLUGIN_ID) end)
	else
		SetNuiFocus(true, true)
		SetTimecycleModifier('hud_def_blur')
		SendNUIMessage({ action = 'setVisible', data = true })
	end
end

--- World tool: hide the panel, run the tool on its own thread (a loop inside the NUI callback misses keys), come back
local function inWorld(data, fn)
	hidePanel(data)
	local done = promise.new()
	CreateThread(function()
		local ok, result = pcall(fn)
		if not ok then lib.print.error(result) end
		done:resolve(ok and result or false)
	end)
	local result = Citizen.Await(done)
	showPanel(data)
	return result
end

local function emptyToNil(data, key)
	if type(data[key]) == 'table' and not next(data[key]) then data[key] = nil end
end

local function normalizeDoor(data)
	data.state = (data.state == true or data.state == 1) and 1 or 0
	emptyToNil(data, 'items')
	emptyToNil(data, 'characters')
	emptyToNil(data, 'lockpickDifficulty')
	emptyToNil(data, 'groups')
	emptyToNil(data, 'jobTypes')
	for key in pairs(LOCAL_FIELDS) do data[key] = nil end
end

local function acceptEntity(doorId)
	return function(entity) return entityIsNotDoor(entity, doorId) end
end

--- Saves a door; a new door, or one being picked again, first gets its entities picked in the world
---@return number|false
local function saveDoor(data)
	normalizeDoor(data)

	if not data.id or data.reselect == true then
		local picked = DoorPicker.pick(data.doors and 2 or 1, acceptEntity(data.id))
		if not picked then return false end

		if data.doors then
			data.doors = picked
			data.coords = nil
			data.model, data.heading = nil, nil
		else
			data.model = picked[1].model
			data.coords = picked[1].coords
			data.heading = picked[1].heading
		end
	else
		local oldDoor = doors[data.id]

		if type(data.doors) == 'table' then
			for i = 1, 2 do
				if data.doors[i] and not data.doors[i].coords and oldDoor?.doors?[i] then
					data.doors[i].coords = oldDoor.doors[i].coords
				end
			end
		else
			data.doors = nil
		end

		if not data.coords and oldDoor then data.coords = oldDoor.coords end
	end

	data.reselect = nil
	data.zone = nil

	-- Unnamed doors get the area name, not the coordinates the server would use.
	local at = data.coords or data.doors?[1]?.coords
	if (type(data.name) ~= 'string' or data.name == '') and at then
		data.name = locale('new_door_name', GetLabelText(GetNameOfZone(at.x, at.y, at.z)))
	end

	-- Picking again keeps the same id: scripts and aces that point at it keep working.
	return lib.callback.await('mri_Qdoorlock:server:editDoor', false, data.id or false, plain(data))
end

local function needsWorld(door)
	return not door.id or door.reselect == true
end

panelCallback('createDoor', function(data)
	local door = type(data.door) == 'table' and data.door or data
	if needsWorld(door) then
		return { id = inWorld(data, function() return saveDoor(door) end) }
	end
	return { id = saveDoor(door) }
end)

local function doorIdOf(data)
	return tonumber(data.id or data.value) or data.id or data.value
end

panelCallback('deleteDoor', function(data)
	return lib.callback.await('mri_Qdoorlock:server:editDoor', false, doorIdOf(data), nil) ~= false
end)

panelCallback('deleteDoorsBulk', function(data)
	for _, doorId in ipairs(type(data.doorIds) == 'table' and data.doorIds or {}) do
		lib.callback.await('mri_Qdoorlock:server:editDoor', false, tonumber(doorId) or doorId, nil)
	end
	return true
end)

local BULK_KEYS <const> = {
	'state', 'passcode', 'passcodeType', 'passcodeCoords', 'autolock', 'maxDistance', 'doorRate',
	'auto', 'lockpick', 'lockpickSystem', 'hideUi', 'holdOpen', 'items', 'characters',
	'groups', 'jobTypes', 'lockpickDifficulty', 'lockSound', 'unlockSound',
}

panelCallback('editDoorsBulk', function(data)
	if type(data.doorIds) ~= 'table' or type(data.changes) ~= 'table' then return false end

	for _, doorId in ipairs(data.doorIds) do
		local door = doors[tonumber(doorId) or doorId]
		if door then
			local fullData = {}
			for k, v in pairs(door) do fullData[k] = v end
			for _, key in ipairs(BULK_KEYS) do fullData[key] = data.changes[key] end
			normalizeDoor(fullData)
			lib.callback.await('mri_Qdoorlock:server:editDoor', false, door.id, plain(fullData))
		end
	end
	return true
end)

local function moveDoor(doorId, groupId)
	local door = doors[tonumber(doorId) or doorId]
	if not door then return false end
	local newDoorData = {}
	for k, v in pairs(door) do newDoorData[k] = v end
	newDoorData.doorGroupId = groupId
	normalizeDoor(newDoorData)
	return lib.callback.await('mri_Qdoorlock:server:editDoor', false, door.id, plain(newDoorData)) ~= false
end

panelCallback('moveDoorToGroup', function(data)
	return moveDoor(data.doorId, tonumber(data.groupId))
end)

panelCallback('moveDoorsToGroup', function(data)
	for _, doorId in ipairs(type(data.doorIds) == 'table' and data.doorIds or {}) do
		moveDoor(doorId, tonumber(data.groupId))
	end
	return true
end)

panelCallback('createGroup', function(data)
	if type(data.name) ~= 'string' then return false end
	return { id = lib.callback.await('mri_Qdoorlock:server:editGroup', false, false, { name = data.name, coords = plain(GetEntityCoords(cache.ped)) }) }
end)

panelCallback('editGroup', function(data)
	local id = tonumber(data.id)
	if not id or type(data.name) ~= 'string' then return false end
	local coords = data.updateCoords and GetEntityCoords(cache.ped) or doorGroups[id]?.coords
	return lib.callback.await('mri_Qdoorlock:server:editGroup', false, id, { name = data.name, coords = plain(coords), access = data.access }) ~= false
end)

panelCallback('deleteGroup', function(data)
	return lib.callback.await('mri_Qdoorlock:server:editGroup', false, doorIdOf(data), nil) ~= false
end)

panelCallback('teleportToDoor', function(data)
	hidePanel(data)
	TriggerServerEvent('ox_doorlock:teleportToDoor', doorIdOf(data))
	return true
end)

panelCallback('teleportToGroup', function(data)
	hidePanel(data)
	TriggerServerEvent('ox_doorlock:teleportToGroup', doorIdOf(data))
	return true
end)

local function ClearOutlines()
    for ent, _ in pairs(outlinedEntities) do
        if DoesEntityExist(ent) then
            SetEntityDrawOutline(ent, false)
        end
    end
    table.wipe(outlinedEntities)
end

local function DrawText3D(x, y, z, text)
    local onScreen, _x, _y = World3dToScreen2d(x, y, z)
    if onScreen then
        SetTextScale(0.40, 0.40)
        SetTextFont(4)
        SetTextProportional(1)
        SetTextColour(255, 255, 255, 255)
        SetTextDropShadow(0, 0, 0, 0, 255)
        SetTextEdge(1, 0, 0, 0, 255)
        SetTextDropShadow()
        SetTextOutline()
        SetTextEntry("STRING")
        SetTextCentre(1)
        AddTextComponentString(text)
        DrawText(_x, _y)
    end
end

RegisterNUICallback('toggleGroupDebug', function(groupId, cb)
	cb(1)
	if debugGroupId == groupId then
		debugGroupId = nil
		ClearOutlines()
	else
		ClearOutlines()
		debugGroupId = groupId
	end
end)
local rayEntity = 0
Citizen.CreateThread(function()
	while true do
		if debugGroupId then
			local hit, ent = lib.raycast.fromCamera(1|16, 4, 80.0)
			rayEntity = hit and ent or 0
			Wait(50)
		else
			Wait(1000)
		end
	end
end)

Citizen.CreateThread(function()
	while true do
		local sleep = 1000
		if debugGroupId then
			sleep = 0
			local playerCoords = GetEntityCoords(cache.ped)
			local currentEntities = {}
			
			local targetedDoorId = nil
			local closestDist = 2.5
			
			-- Pass 1: Find targeted door and outline entities
			for _, door in pairs(doors) do
				if door.doorGroupId == debugGroupId and door.coords then
					local dist = #(playerCoords - door.coords)
					local isAimingAtDoor = false
					
					if door.doors then
						for i = 1, 2 do
							local d = door.doors[i]
							if d.coords then
								local ent = GetClosestObjectOfType(d.coords.x, d.coords.y, d.coords.z, 2.0, d.model or d.hash, false, false, false)
								if ent > 0 then
									currentEntities[ent] = true
									if ent == rayEntity then isAimingAtDoor = true end
									if not outlinedEntities[ent] then
										OutlineDoor(ent, true)
										outlinedEntities[ent] = true
									end
								end
							end
						end
					else
						local ent = GetClosestObjectOfType(door.coords.x, door.coords.y, door.coords.z, 2.0, door.model or door.hash, false, false, false)
						if ent > 0 then
							currentEntities[ent] = true
							if ent == rayEntity then isAimingAtDoor = true end
							if not outlinedEntities[ent] then
								OutlineDoor(ent, true)
								outlinedEntities[ent] = true
							end
						end
					end
					
					if isAimingAtDoor and dist < 80.0 then
						targetedDoorId = door.id
						closestDist = -1
					elseif closestDist > 0 and dist < closestDist then
						closestDist = dist
						targetedDoorId = door.id
					end
				end
			end
			
			-- Pass 2: Draw text and handle interaction
			for _, door in pairs(doors) do
				if door.doorGroupId == debugGroupId and door.coords then
					local dist = #(playerCoords - door.coords)
					if dist < 100.0 then
						local text = ("[%s] %s"):format(door.id, door.name)
						
						if door.id == targetedDoorId and not DoorPicker.isActive() then
							text = text .. "\n~g~[ENTER]~w~ " .. locale('debug_edit') .. " | ~b~[G]~w~ " .. locale('debug_duplicate') .. " | ~r~[BACKSPACE]~w~ " .. locale('debug_delete')
							if not IsNuiFocused() then
								if IsControlJustPressed(0, 191) then
									openUi(door.id)
								elseif IsControlJustPressed(0, 47) then
									local cloneData = json.decode(json.encode(door))
									cloneData.id = nil
									
									local baseName, numStr = string.match(door.name or "Porta", "^(.-)%s*(%d+)$")
									if baseName then
										cloneData.name = baseName .. (baseName == "" and "" or " ") .. tostring(tonumber(numStr) + 1)
									else
										cloneData.name = (door.name or "Porta") .. " 2"
									end
									
									cloneData.reselect = true
									
									CreateThread(function()
										saveDoor(cloneData)
									end)
								elseif IsControlJustPressed(0, 194) then
									SetNuiFocus(true, true)
									SetTimecycleModifier('hud_def_blur')
									SendNUIMessage({
										action = 'confirmDeleteDoor',
										data = door.id
									})
								end
							end
						end
						DrawText3D(door.coords.x, door.coords.y, door.coords.z + 0.5, text)
					end
				end
			end
			
			for ent, _ in pairs(outlinedEntities) do
				if not currentEntities[ent] then
					if DoesEntityExist(ent) then
						SetEntityDrawOutline(ent, false)
					end
					outlinedEntities[ent] = nil
				end
			end
		end
		Wait(sleep)
	end
end)

RegisterNUICallback('exit', function(_, cb)
	cb(1)
	SetNuiFocus(false, false)
	ClearTimecycleModifier()
end)

RegisterNUICallback('createGroup', function(data, cb)
	cb(1)
	if not data or not data.name or type(data.name) ~= 'string' then return end
	local coords = GetEntityCoords(cache.ped)
	TriggerServerEvent('ox_doorlock:editGroup', false, {
		name = data.name,
		coords = coords
	})
end)

RegisterNUICallback('editGroup', function(data, cb)
	cb(1)
	if not data or not data.id or not data.name or type(data.name) ~= 'string' then return end
	
	local coords = data.updateCoords and GetEntityCoords(cache.ped) or (doorGroups[data.id] and doorGroups[data.id].coords)
	
	TriggerServerEvent('ox_doorlock:editGroup', tonumber(data.id), {
		name = data.name,
		coords = coords
	})
end)

RegisterNUICallback('deleteGroup', function(id, cb)
	cb(1)
	local groupId = tonumber(id) or id
	TriggerServerEvent('ox_doorlock:editGroup', groupId)
end)

RegisterNUICallback('moveDoorToGroup', function(data, cb)
	cb(1)
	local doorId = tonumber(data.doorId) or data.doorId
	local door = doors[doorId]
	if door then
		local newDoorData = {}
		for k, v in pairs(door) do newDoorData[k] = v end
		newDoorData.doorGroupId = data.groupId
		TriggerServerEvent('ox_doorlock:editDoorlock', data.doorId, newDoorData)
	end
end)

RegisterNUICallback('moveDoorsToGroup', function(data, cb)
	cb(1)
	if type(data.doorIds) ~= 'table' then return end
	
	Citizen.CreateThread(function()
		for _, doorId in ipairs(data.doorIds) do
			local id = tonumber(doorId) or doorId
			local door = doors[id]
			if door then
				local newDoorData = {}
				for k, v in pairs(door) do newDoorData[k] = v end
				newDoorData.doorGroupId = data.groupId
				TriggerServerEvent('ox_doorlock:editDoorlock', doorId, newDoorData)
				Wait(150)
			end
		end
	end)
end)

RegisterNetEvent('ox_doorlock:updateGroup', function(id, data)
	if data then
		if data.coords then
			local streetHash, crossingHash = GetStreetNameAtCoord(data.coords.x, data.coords.y, data.coords.z)
			local streetName = GetStreetNameFromHashKey(streetHash)
			if crossingHash ~= 0 then
				streetName = streetName .. " - " .. GetStreetNameFromHashKey(crossingHash)
			end
			data.streetName = streetName
		end
		data.id = id
		doorGroups[data.id] = data
	else
		doorGroups[id] = nil
	end

	if NuiHasLoaded then
		SendNuiMessage(json.encode({
			action = 'updateDoorGroups',
			data = {
				id = data and data.id or id,
				data = data
			}
		}, { with_hole = false }))
	end
end)





function openUi(id)
	if source == '' or DoorPicker.isActive() then return end

	if not NuiHasLoaded then
		NuiHasLoaded = true

		SendNuiMessage(json.encode({
			action = 'updateDoorData',
			data = DoorsForPanel()
		}, { with_hole = false }))
		Wait(100)

		SendNuiMessage(json.encode({
			action = 'updateDoorGroups',
			data = GroupsForPanel()
		}, { with_hole = false }))
		Wait(100)

		SendNUIMessage({
			action = 'setSoundFiles',
			data = lib.callback.await('ox_doorlock:getSounds', false)
		})
	end

	SetNuiFocus(true, true)
	SetTimecycleModifier('hud_def_blur')
	SendNuiMessage(json.encode({
		action = 'setVisible',
		data = id
	}))
end

RegisterNUICallback('requestData', function(_, cb)
	NuiHasLoaded = true
	local soundFiles = lib.callback.await('ox_doorlock:getSounds', false)
	
	local localeStr = string.lower(GetConvar('ox:locale', 'pt'))
	local localeData = LoadResourceFile(GetCurrentResourceName(), 'locales/' .. localeStr .. '.json')
	if not localeData then
		localeStr = 'en'
		localeData = LoadResourceFile(GetCurrentResourceName(), 'locales/en.json')
	end
	
	local translations = {}
	if localeData then
		-- Strip BOM if present
		if string.sub(localeData, 1, 3) == "\239\187\191" then
			localeData = string.sub(localeData, 4)
		end
		local success, result = pcall(json.decode, localeData)
		if success and type(result) == 'table' then
			translations = result
		else
			print('^1[mri_Qdoorlock] Error parsing locale file: ' .. localeStr .. '.json^0')
			print('Error details: ' .. tostring(result))
		end
	end

	local hasT3Lockpick = GetResourceState('t3_lockpick') == 'started' or GetResourceState('t3_lockpick') == 'starting'

	cb({
		doors = DoorsForPanel(),
		doorGroups = GroupsForPanel(),
		sounds = soundFiles,
		debugGroupId = debugGroupId,
		locale = localeStr,
		locales = translations,
		hasT3Lockpick = hasT3Lockpick
	})
end)

RegisterNetEvent('ox_doorlock:triggeredCommand', function(closest)
	openUi(closest and ClosestDoor?.id or nil)
end)

CreateThread(function()
	local target

	if GetResourceState('ox_target'):find('start') then
		target = {
			ox = true,
			exp = exports.ox_target
		}
	elseif GetResourceState('qtarget'):find('start') then
		target = {
			qt = true,
			exp = exports.qtarget
		}
	end

	if not target then return end

	local function addPickTarget()
		if target.ox then
			target.exp:addGlobalObject({
				{
					name = 'pickDoorlock',
					label = locale('pick_lock'),
					icon = 'fas fa-user-lock',
					onSelect = pickLock,
					canInteract = canPickLock,
					items = Config.LockpickItems,
					anyItem = true,
					distance = 1
				}
			})
		else
			target.exp:Object({
				options = {
					{
						label = locale('pick_lock'),
						icon = 'fas fa-user-lock',
						action = pickLock,
						canInteract = canPickLock,
						item = Config.LockpickItems[1],
						distance = 1
					}
				}
			})
		end
	end

	local function removePickTarget()
		if target.ox then
			target.exp:removeGlobalObject('pickDoorlock')
		else
			target.exp:RemoveObject({ locale('pick_lock') })
		end
	end

	addPickTarget()

	-- The target keeps the item list it got: rebuild when the panel changes the lockpick items.
	AddEventHandler('mri_Qdoorlock:client:settingsApplied', function()
		removePickTarget()
		addPickTarget()
	end)

	if target.qt then
		AddEventHandler('onResourceStop', function(resource)
			if resource == cache.resource then removePickTarget() end
		end)
	end
end)

-- Tema da suíte MRI (ver mri/README.md). Accent e fundo vêm das convars
-- mri:color / mri:backgroundColor; o resto (tema, opacidade, fonte, radius,
-- cores de status) vem do /uiconfig do ox_lib.
RegisterNUICallback('getConfig', function(_, cb)
	cb({
		accentColor = GetConvar('mri:color', '#00E699'),
		backgroundColor = GetConvar('mri:backgroundColor', ''),
	})
end)

RegisterNUICallback('getGroupOptions', function(_, cb)
	cb(lib.callback.await('mri_Qdoorlock:server:groupOptions', false) or {})
end)

RegisterNUICallback('getJobTypeOptions', function(_, cb)
	cb(lib.callback.await('mri_Qdoorlock:server:jobTypeOptions', false) or {})
end)

RegisterNUICallback('getCharacterOptions', function(_, cb)
	cb(lib.callback.await('mri_Qdoorlock:server:characterOptions', false) or {})
end)

RegisterNUICallback('getItemOptions', function(_, cb)
	cb(lib.callback.await('mri_Qdoorlock:server:itemOptions', false) or {})
end)

RegisterNUICallback('getSettings', function(_, cb)
	cb(lib.callback.await('mri_Qdoorlock:server:getSettings', false) or false)
end)

RegisterNUICallback('saveSettings', function(data, cb)
	cb(lib.callback.await('mri_Qdoorlock:server:saveSettings', false, data?.section, data?.values) == true)
end)

RegisterNUICallback('getUiConfig', function(_, cb)
	if GetResourceState('ox_lib') ~= 'started' then return cb(false) end
	local ok, cfg = pcall(function() return exports.ox_lib:getUiConfig() end)
	cb(ok and type(cfg) == 'table' and cfg or false)
end)

RegisterNetEvent('mri_Qdoorlock:accentColorChanged', function(color)
	SendNUIMessage({ action = 'updateAccentColor', data = { accentColor = color } })
end)

RegisterNetEvent('mri_Qdoorlock:backgroundColorChanged', function(color)
	SendNUIMessage({ action = 'updateBackgroundColor', data = { backgroundColor = color or '' } })
end)

RegisterNetEvent('ox_lib:uiConfigChanged', function(cfg)
	if type(cfg) ~= 'table' then return end
	SendNUIMessage({ action = 'applyUiConfig', data = cfg })
end)
