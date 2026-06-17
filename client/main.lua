if not LoadResourceFile(cache.resource, 'web/build/index.html') then
	error('Unable to load UI. Build ox_doorlock or download the latest release.\n	^3https://github.com/overextended/ox_doorlock/releases/latest/download/ox_doorlock.zip^0')
end

if not lib.checkDependency('ox_lib', '3.30.4', true) then return end

local math = require 'glm'
local doors = {}
local doorGroups = {}
_ENV.doors = doors
_ENV.doorGroups = doorGroups


local function createDoor(door)
	local oldDoor = doors[door.id]

	if oldDoor then
		lib.grid.removeEntry(oldDoor)
	end

	if door.coords and type(door.coords) == 'table' then
		door.coords = vec3(door.coords.x, door.coords.y, door.coords.z)
	elseif door.coords and type(door.coords) == 'vector3' then
		door.coords = vec3(door.coords.x, door.coords.y, door.coords.z)
	end

	doors[door.id] = door
	local double = door.doors
	door.zone = GetLabelText(GetNameOfZone(door.coords.x, door.coords.y, door.coords.z))
	door.radius = door.maxDistance

	if double then
		for i = 1, 2 do
			if double[i].coords and type(double[i].coords) == 'table' then
				double[i].coords = vec3(double[i].coords.x, double[i].coords.y, double[i].coords.z)
			elseif double[i].coords and type(double[i].coords) == 'vector3' then
				double[i].coords = vec3(double[i].coords.x, double[i].coords.y, double[i].coords.z)
			end
			AddDoorToSystem(double[i].hash, double[i].model, double[i].coords.x, double[i].coords.y, double[i].coords.z, false, false, false)
			DoorSystemSetDoorState(double[i].hash, 4, false, false)
			DoorSystemSetDoorState(double[i].hash, door.state, false, false)

			if door.doorRate or not door.auto then
				DoorSystemSetAutomaticRate(double[i].hash, door.doorRate or 10.0, false, false)
			end
		end
	else
		AddDoorToSystem(door.hash, door.model, door.coords.x, door.coords.y, door.coords.z, false, false, false)
		DoorSystemSetDoorState(door.hash, 4, false, false)
		DoorSystemSetDoorState(door.hash, door.state, false, false)

		if door.doorRate or not door.auto then
			DoorSystemSetAutomaticRate(door.hash, door.doorRate or 10.0, false, false)
		end
	end

	lib.grid.addEntry(door)
end

local nearbyDoors = lib.array:new()
local nearbyDoorsCount = 0
local Entity = Entity
local ratio = GetAspectRatio(true)

lib.callback('ox_doorlock:getDoors', false, function(data, sounds, groups)
	if groups then
		for k, v in pairs(groups) do
			if v.coords then
				local streetHash, crossingHash = GetStreetNameAtCoord(v.coords.x, v.coords.y, v.coords.z)
				local streetName = GetStreetNameFromHashKey(streetHash)
				if crossingHash ~= 0 then
					streetName = streetName .. " - " .. GetStreetNameFromHashKey(crossingHash)
				end
				v.streetName = streetName
			end
			doorGroups[k] = v
		end
	end
	for _, door in pairs(data) do createDoor(door) end

	while true do
		local coords = GetEntityCoords(cache.ped)
		nearbyDoors = lib.grid.getNearbyEntries(coords)
		nearbyDoorsCount = #nearbyDoors
		ratio = GetAspectRatio(true)

		for index = 1, nearbyDoorsCount do
			local door = nearbyDoors[index]
			if doors[door.id] == door then
				local double = door.doors
				door.distance = #(coords - door.coords)

			if double then
				for i = 1, 2 do
					local dDoor = double[i]

					if IsModelValid(dDoor.model) then
						local entity = not dDoor.entity and GetClosestObjectOfType(dDoor.coords.x, dDoor.coords.y, dDoor.coords.z, 1.0, dDoor.model, false, false, false)

						if entity and entity ~= 0 then
							dDoor.entity = entity
							Entity(entity).state.doorId = door.id
						else dDoor.entity = nil end
					end
				end
			elseif IsModelValid(door.model) then
				local entity = not door.entity and GetClosestObjectOfType(door.coords.x, door.coords.y, door.coords.z, 1.0, door.model, false, false, false)

				if entity and entity ~= 0 then
					local dCoords = GetEntityCoords(entity)
					local min, max = GetModelDimensions(door.model)
					local center = vec3((min.x + max.x) / 2, (min.y + max.y) / 2, (min.z + max.z) / 2)
					local heading = GetEntityHeading(entity) * (math.pi / 180)
					local sin, cos = math.sincos(heading)
					local rotatedX = cos * center.x - sin * center.y
					local rotatedY = sin * center.x + cos * center.y
					door.visualCoords = vec3(dCoords.x + rotatedX, dCoords.y + rotatedY, dCoords.z + center.z)
					door.entity = entity

					Entity(entity).state.doorId = door.id
				else door.entity = nil end
			end
			end
		end

		Wait(500)
	end
end)

RegisterNetEvent('ox_doorlock:setState', function(id, state, source, data)
	if not doors then return end

	if data then
		createDoor(data)

		if NuiHasLoaded then
			SendNuiMessage(json.encode({
				action = 'updateDoorData',
				data = data
			}))
		end
	end

	if Config.Notify and source == cache.serverId then
		if state == 0 then
			lib.notify({
				type = 'success',
				icon = 'unlock',
				description = locale('unlocked_door')
			})
		else
			lib.notify({
				type = 'success',
				icon = 'lock',
				description = locale('locked_door')
			})
		end
	end

	local door = data or doors[id]
	local double = door.doors
	door.state = state

	if double then
		DoorSystemSetDoorState(double[1].hash, door.state, false, false)
		DoorSystemSetDoorState(double[2].hash, door.state, false, false)

		if door.holdOpen then
			DoorSystemSetHoldOpen(double[1].hash, door.state == 0)
			DoorSystemSetHoldOpen(double[2].hash, door.state == 0)
		end

		while door.state == 1 and (not IsDoorClosed(double[1].hash) or not IsDoorClosed(double[2].hash)) do Wait(0) end
	else
		DoorSystemSetDoorState(door.hash, door.state, false, false)

		if door.holdOpen then DoorSystemSetHoldOpen(door.hash, door.state == 0) end
		while door.state == 1 and not IsDoorClosed(door.hash) do Wait(0) end
	end

	if door.state == state and door.distance and door.distance < 20 then
		if Config.NativeAudio then
			RequestScriptAudioBank('dlc_oxdoorlock/oxdoorlock', false)
			local sound = state == 0 and door.unlockSound or door.lockSound or 'door_bolt'
			local soundId = GetSoundId()

			PlaySoundFromCoord(soundId, sound, door.coords.x, door.coords.y, door.coords.z, 'DLC_OXDOORLOCK_SET', false, 0, false)
			ReleaseSoundId(soundId)
			ReleaseNamedScriptAudioBank('dlc_oxdoorlock/oxdoorlock')
		else
			local volume = (0.01 * GetProfileSetting(300)) / (door.distance / 2)
			if volume > 1 then volume = 1 end
			local sound = state == 0 and door.unlockSound or door.lockSound or 'door-bolt-4'

			SendNUIMessage({
				action = 'playSound',
				data = {
					sound = sound,
					volume = volume
				}
			})
		end
	end
end)

RegisterNetEvent('ox_doorlock:editDoorlock', function(id, data)
	if source == '' then return end

	id = tonumber(id) or id
	local door = doors[id]

	if door then
		local double = door.doors
		if double then
			for i = 1, 2 do
				if double[i].hash then RemoveDoorFromSystem(double[i].hash) end
				if double[i].entity then
					Entity(double[i].entity).state.doorId = nil
				end
			end
		else
			if door.hash then RemoveDoorFromSystem(door.hash) end
			if door.entity then
				Entity(door.entity).state.doorId = nil
			end
		end
		lib.grid.removeEntry(door)
	end

	if data then
		Wait(500)
		createDoor(data)
	else
		doors[id] = nil
		if ClosestDoor?.id == id then
			ClosestDoor = nil
		end
	end

	if NuiHasLoaded then
		SendNuiMessage(json.encode({
			action = 'updateDoorData',
			data = data or id
		}))
	end
end)

ClosestDoor = nil

local passcodePromise = nil

RegisterNUICallback('submitPasscode', function(passcode, cb)
	cb(1)
	SetNuiFocus(false, false)
	ClearTimecycleModifier()
	if passcodePromise then
		passcodePromise:resolve(passcode)
		passcodePromise = nil
	end
end)

lib.callback.register('ox_doorlock:inputPassCode', function()
	if not ClosestDoor?.passcode then return end
	
	passcodePromise = promise.new()
	SetNuiFocus(true, true)
	SetTimecycleModifier('hud_def_blur')
	SendNuiMessage(json.encode({
		action = 'openPasscodePrompt',
		data = { passcodeType = ClosestDoor.passcodeType or 'text' }
	}))
	
	local result = Citizen.Await(passcodePromise)
	return result
end)

local lastTriggered = 0

local function useClosestDoor()
	if not ClosestDoor then return false end

	local gameTimer = GetGameTimer()

	if gameTimer - lastTriggered > 500 then
		lastTriggered = gameTimer
		TriggerServerEvent('ox_doorlock:setState', ClosestDoor.id, ClosestDoor.state == 1 and 0 or 1)
	end
end

CreateThread(function()
	local lockDoor = locale('lock_door')
	local unlockDoor = locale('unlock_door')
	local showUI
	local drawSprite = Config.DrawSprite

	if drawSprite then
		local sprite1 = drawSprite[0]?[1]
		local sprite2 = drawSprite[1]?[1]

		if sprite1 then
			RequestStreamedTextureDict(sprite1, true)
		end

		if sprite2 then
			RequestStreamedTextureDict(sprite2, true)
		end
	end

	local SetDrawOrigin = SetDrawOrigin
	local ClearDrawOrigin = ClearDrawOrigin
	local DrawSprite = drawSprite and DrawSprite

	while true do
		ClosestDoor = nearbyDoors[1]

		if nearbyDoorsCount > 0 then
			for i = 1, nearbyDoorsCount do
				local door = nearbyDoors[i]

				if door.distance < door.maxDistance then
					if door.distance < ClosestDoor.distance then
						ClosestDoor = door
					end

					if drawSprite and not door.hideUi then
						local sprite = drawSprite[door.state]

						if sprite then
							local drawCoords = door.visualCoords or door.coords
							SetDrawOrigin(drawCoords.x, drawCoords.y, drawCoords.z)
							DrawSprite(sprite[1], sprite[2], sprite[3], sprite[4], sprite[5], sprite[6] * ratio, sprite[7], sprite[8], sprite[9], sprite[10], sprite[11])
							ClearDrawOrigin()
						end
					end
				end
			end
		end

		if ClosestDoor and ClosestDoor.distance < ClosestDoor.maxDistance then
			if Config.DrawTextUI and not ClosestDoor.hideUi and ClosestDoor.state ~= showUI then
				lib.showTextUI(ClosestDoor.state == 0 and lockDoor or unlockDoor)
				showUI = ClosestDoor.state
			end

			if not PickingLock and IsDisabledControlJustReleased(0, 38) then
				useClosestDoor()
			end
		elseif showUI then
			lib.hideTextUI()
			showUI = nil
		end

		Wait(nearbyDoorsCount > 0 and 0 or 500)
	end
end)

exports('useClosestDoor', useClosestDoor)
exports('getClosestDoor', function() return ClosestDoor end)
