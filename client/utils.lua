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

	local success = lib.skillCheck(door.lockpickDifficulty or Config.LockDifficulty)
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

local tempData = {}

local function addDoorlock(data)
	local entity = type(data) == 'number' and data or data.entity
	local model = GetEntityModel(entity)
	local coords = GetEntityCoords(entity)

	AddDoorToSystem(`temp`, model, coords.x, coords.y, coords.z, false, false, false)
	DoorSystemSetDoorState(`temp`, 4, false, false)

	coords = GetEntityCoords(entity)
	tempData[#tempData + 1] = {
		entity = entity,
		model = model,
		coords = coords,
		heading = math.floor(GetEntityHeading(entity) + 0.5)
	}

	RemoveDoorFromSystem(`temp`)
end

local isAddingDoorlock = false

RegisterNUICallback('notify', function(data, cb)
	cb(1)
	lib.notify({ title = data })
end)

local function handleCreateDoor(data)
	table.wipe(tempData)
	data.state = (data.state == true or data.state == 1) and 1 or 0

	if data.items and not next(data.items) then
		data.items = nil
	end

	if data.characters and not next(data.characters) then
		data.characters = nil
	end

	if data.lockpickDifficulty and not next(data.lockpickDifficulty) then
		data.lockpickDifficulty = nil
	end

	if data.groups and not next(data.groups) then
		data.groups = nil
	end

	if not data.id or data.reselect == true then
		SetNuiFocus(false, false)
		ClearTimecycleModifier()
		isAddingDoorlock = true
		local doorCount = (data.doors and type(data.doors) == 'table' and data.doors[1]) and 2 or 1
		local lastEntity = 0

		lib.showTextUI(locale('add_door_textui'))

		-- Helper: raycast first, fall back to object proximity scan for doors
		-- with no raycast-detectable collision (e.g. DoorSystem-managed grates)
		local function getTargetEntity()
			local hit, ent, coord = lib.raycast.cam(-1, cache.ped)
			local entType = hit and ent and GetEntityType(ent) or 0
			-- If raycast found a valid prop entity, return it directly
			if hit and ent > 0 and entType == 3 then
				return hit, ent, coord
			end
			-- Fallback: scan nearby objects along the camera ray
			-- This handles doors managed by GTA's native DoorSystem (no raycast collision)
			local camPos = GetGameplayCamCoord()
			local camRot = GetGameplayCamRot(2)
			local radX = math.rad(camRot.x)
			local radZ = math.rad(camRot.z)
			local camDir = vector3(
				-math.sin(radZ) * math.cos(radX),
				math.cos(radZ) * math.cos(radX),
				math.sin(radX)
			)
			local bestHandle = 0
			local bestProj = math.huge
			local handle, object = FindFirstObject()
			local found = true
			while found do
				if DoesEntityExist(object) and GetEntityType(object) == 3 then
					local objPos = GetEntityCoords(object)
					local toObj = objPos - camPos
					local proj = toObj.x * camDir.x + toObj.y * camDir.y + toObj.z * camDir.z
					if proj > 0.3 and proj < 8.0 then
						local cx = toObj.y * camDir.z - toObj.z * camDir.y
						local cy = toObj.z * camDir.x - toObj.x * camDir.z
						local cz = toObj.x * camDir.y - toObj.y * camDir.x
						local rayDist = math.sqrt(cx*cx + cy*cy + cz*cz)
						if rayDist < 1.2 and proj < bestProj then
							bestProj = proj
							bestHandle = object
						end
					end
				end
				found, object = FindNextObject(handle)
			end
			EndFindObject(handle)
			if bestHandle ~= 0 then
				return true, bestHandle, GetEntityCoords(bestHandle)
			end
			return hit, ent, coord
		end

		repeat
			DisablePlayerFiring(cache.playerId, true)
			DisableControlAction(0, 25, true)

			local hit, entity, coords = getTargetEntity()
			local changedEntity = lastEntity ~= entity
			local doorA = tempData[1]?.entity

			if changedEntity and lastEntity ~= doorA then
				if not outlinedEntities[lastEntity] then
					SetEntityDrawOutline(lastEntity, false)
				end
			end

			lastEntity = entity

			if hit then
				---@diagnostic disable-next-line: param-type-mismatch
				DrawMarker(28, coords.x, coords.y, coords.z, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.2, 0.2, 255, 42, 24,
					100, false, false, 0, true, false, false, false)
			end

			if hit and entity > 0 and GetEntityType(entity) ~= 0 and GetEntityType(entity) ~= 1 and GetEntityType(entity) ~= 2 and (doorCount == 1 or doorA ~= entity) and entityIsNotDoor(entity, data.id == nil and -1 or data.id) then
				if changedEntity then
					SetEntityDrawOutline(entity, true)
				end

				if IsDisabledControlJustPressed(0, 24) then
					addDoorlock(entity)
				end
			end

			if IsDisabledControlJustPressed(0, 25) then
				if not outlinedEntities[entity] then
					SetEntityDrawOutline(entity, false)
				end

				if not doorA then
					isAddingDoorlock = false
					return lib.hideTextUI()
				end

				if not outlinedEntities[doorA] then
					SetEntityDrawOutline(doorA, false)
				end
				table.wipe(tempData)
			end
		until tempData[doorCount]

		lib.hideTextUI()
		if not outlinedEntities[tempData[1].entity] then
			SetEntityDrawOutline(tempData[1].entity, false)
		end

		if data.doors then
			if not outlinedEntities[tempData[2].entity] then
				SetEntityDrawOutline(tempData[2].entity, false)
			end
			tempData[1].entity = nil
			tempData[2].entity = nil
			data.doors = tempData
			data.coords = nil
		else
			data.model = tempData[1].model
			data.coords = tempData[1].coords
			data.heading = tempData[1].heading
		end
	else
		if data.doors and type(data.doors) == 'table' then
			for i = 1, 2 do
				if data.doors[i] then
					local coords = data.doors[i].coords
					if coords and type(coords) == 'table' and coords.x then
						data.doors[i].coords = vector3(coords.x, coords.y, coords.z)
					end
					data.doors[i].entity = nil
				end
			end
		else
			data.doors = nil
			data.entity = nil
		end

		if data.coords and type(data.coords) == 'table' and data.coords.x then
			data.coords = vector3(data.coords.x, data.coords.y, data.coords.z)
		end
		data.distance = nil
		data.zone = nil
	end

	isAddingDoorlock = false

	if data.reselect and data.id then
		-- Delete the old door entirely
		TriggerServerEvent('ox_doorlock:editDoorlock', data.id)
		-- Strip the ID so the server creates a brand new door
		data.id = nil
	end

	TriggerServerEvent('ox_doorlock:editDoorlock', data.id or false, data)
	table.wipe(tempData)
end

RegisterNUICallback('createDoor', function(data, cb)
	cb(1)
	handleCreateDoor(data)
end)

RegisterNUICallback('deleteDoor', function(id, cb)
	cb(1)
	TriggerServerEvent('ox_doorlock:editDoorlock', id)
end)

RegisterNUICallback('deleteDoorsBulk', function(doorIds, cb)
	cb(1)
	if type(doorIds) ~= 'table' then return end
	
	Citizen.CreateThread(function()
		for _, doorId in ipairs(doorIds) do
			local id = tonumber(doorId) or doorId
			TriggerServerEvent('ox_doorlock:editDoorlock', id)
			Wait(150)
		end
	end)
end)

RegisterNUICallback('editDoorsBulk', function(data, cb)
	cb(1)
	if type(data.doorIds) ~= 'table' or type(data.changes) ~= 'table' then return end
	
	Citizen.CreateThread(function()
		for _, doorId in ipairs(data.doorIds) do
			local id = tonumber(doorId) or doorId
			local door = doors[id]
			if door then
				local fullData = {}
				for k, v in pairs(door) do fullData[k] = v end
				local updatableKeys = {
					'state', 'passcode', 'passcodeType', 'passcodeCoords', 'autolock', 'maxDistance', 'doorRate', 
					'auto', 'lockpick', 'hideUi', 'holdOpen', 'items', 'characters', 
					'groups', 'lockpickDifficulty', 'lockSound', 'unlockSound'
				}
				
				for _, key in ipairs(updatableKeys) do
					fullData[key] = data.changes[key]
				end
				
				fullData.state = (fullData.state == true or fullData.state == 1) and 1 or 0
				
				if fullData.items and not next(fullData.items) then fullData.items = nil end
				if fullData.characters and not next(fullData.characters) then fullData.characters = nil end
				if fullData.lockpickDifficulty and not next(fullData.lockpickDifficulty) then fullData.lockpickDifficulty = nil end
				if fullData.groups and not next(fullData.groups) then fullData.groups = nil end
				
				TriggerServerEvent('ox_doorlock:editDoorlock', doorId, fullData)
				Wait(150)
			end
		end
	end)
end)

RegisterNUICallback('teleportToDoor', function(id, cb)
	cb(1)
	SetNuiFocus(false, false)
	ClearTimecycleModifier()
	local doorCoords = doors[id].coords
	if not doorCoords then return end
	SetEntityCoords(cache.ped, doorCoords.x, doorCoords.y, doorCoords.z, false, false, false, false)
end)

RegisterNUICallback('teleportToGroup', function(id, cb)
	cb(1)
	SetNuiFocus(false, false)
	ClearTimecycleModifier()
	local group = doorGroups[id]
	if not group or not group.coords then return end
	SetEntityCoords(cache.ped, group.coords.x, group.coords.y, group.coords.z, false, false, false, false)
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
			local hit, ent = lib.raycast.cam(1|16, PlayerPedId(), 80.0)
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
										SetEntityDrawOutline(ent, true)
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
								SetEntityDrawOutline(ent, true)
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
						
						if door.id == targetedDoorId and not isAddingDoorlock then
							text = text .. "\n~g~[ENTER]~w~ Editar | ~b~[G]~w~ Duplicar | ~r~[BACKSPACE]~w~ Deletar"
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
									handleCreateDoor(cloneData)
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

local rayEntity = 0
Citizen.CreateThread(function()
	while true do
		if debugGroupId then
			local hit, ent = lib.raycast.cam(1|16, PlayerPedId(), 80.0)
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
										SetEntityDrawOutline(ent, true)
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
								SetEntityDrawOutline(ent, true)
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
						
						if door.id == targetedDoorId and not isAddingDoorlock then
							text = text .. "\n~g~[ENTER]~w~ Editar | ~b~[G]~w~ Duplicar | ~r~[BACKSPACE]~w~ Deletar"
							if IsControlJustPressed(0, 191) then
								openUi(door.id)
							elseif IsControlJustPressed(0, 47) then
								local cloneData = json.decode(json.encode(door))
								cloneData.id = nil
								-- Strip stale entity/position data so selection loop starts fresh
								cloneData.coords = nil
								cloneData.heading = nil
								cloneData.model = nil
								if cloneData.doors then
									-- Keep structure (so doorCount=2) but wipe stale position/entity refs
									for i = 1, 2 do
										if cloneData.doors[i] then
											cloneData.doors[i].coords = nil
											cloneData.doors[i].heading = nil
											cloneData.doors[i].entity = nil
										end
									end
								end
								local baseName, numStr = string.match(door.name or "Porta", "^(.-)%s*(%d+)$")
								if baseName then
									cloneData.name = baseName .. (baseName == "" and "" or " ") .. tostring(tonumber(numStr) + 1)
								else
									cloneData.name = (door.name or "Porta") .. " 2"
								end
								
								cloneData.reselect = true
								
								CreateThread(function()
									handleCreateDoor(cloneData)
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



function openUi(id)
	if source == '' or isAddingDoorlock then return end

	if not NuiHasLoaded then
		NuiHasLoaded = true

		SendNuiMessage(json.encode({
			action = 'updateDoorData',
			data = doors
		}, { with_hole = false }))
		Wait(100)

		SendNuiMessage(json.encode({
			action = 'updateDoorGroups',
			data = doorGroups
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
	SendNUIMessage({
		action = 'updateAccentColor',
		color = GetConvar('mri:color', '#00E699')
	})
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

	cb({
		doors = doors,
		doorGroups = doorGroups,
		sounds = soundFiles,
		debugGroupId = debugGroupId,
		locale = localeStr,
		locales = translations
	})

	SendNuiMessage(json.encode({
		action = 'updateDoorData',
		data = doors
	}, { with_hole = false }))
	Wait(10)
	SendNuiMessage(json.encode({
		action = 'updateDoorGroups',
		data = doorGroups
	}, { with_hole = false }))
	Wait(10)
	SendNUIMessage({
		action = 'setSoundFiles',
		data = soundFiles
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
		local options = {
			{
				label = locale('pick_lock'),
				icon = 'fas fa-user-lock',
				action = pickLock,
				canInteract = canPickLock,
				item = Config.LockpickItems[1],
				distance = 1
			}
		}

		---@cast target table

		if target.qt then
			target.exp:Object({ options = options })
		end

		options = { locale('pick_lock') }

		AddEventHandler('onResourceStop', function(resource)
			if resource == cache.resource then
				if target.qt then
					return target.exp:RemoveObject(options)
				end
			end
		end)
	end
end)

AddConvarChangeListener('mri:color', function(name)
	if name == 'mri:color' then
		SendNUIMessage({
			action = 'updateAccentColor',
			color = GetConvar('mri:color', '#00E699')
		})
	end
end)
