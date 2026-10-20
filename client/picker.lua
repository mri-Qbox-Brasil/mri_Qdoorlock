-- Door picking in the world (mri-world-placement rules): aim and keys in one frame loop, rail on the NUI, E / Backspace / Esc.

DoorPicker = {}

local KEY <const> = { mark = 38, undo = 177, cancel = 200 }
-- Weapon wheel, attacks, vehicle weapon scroll and Esc, so the keys only drive the tool.
local BLOCKED <const> = { 14, 15, 16, 17, 24, 25, 37, 44, 140, 141, 142, 200 }
local RAY_DISTANCE <const> = 10.0

local active = false

-- Outline color and shader are global to the game: another script (mri_Qspawn fades the alpha to 0) can leave them invisible.
function OutlineDoor(entity, on)
	if on then
		SetEntityDrawOutlineShader(0)
		SetEntityDrawOutlineColor(255, 255, 255, 255)
	end
	SetEntityDrawOutline(entity, on)
end

-- escBusy tells the MRI pause menu (it reads Esc even while blocked) that Esc belongs to the tool.
local function hud(data)
	SendNUIMessage({ action = 'placeHud', data = data })
	if (data ~= false) ~= (LocalPlayer.state.escBusy == true) then LocalPlayer.state:set('escBusy', data ~= false, false) end
end

-- The pause menu opens when Esc is released, so it stays blocked until the key is up.
local function releaseEsc()
	repeat
		DisableControlAction(0, KEY.cancel, true)
		Wait(0)
	until not IsDisabledControlPressed(0, KEY.cancel)
	DisableControlAction(0, KEY.cancel, true)
end

local function accent()
	local hex = GetConvar('mri:color', '#00E699'):match('^#(%x%x%x%x%x%x)') or '00E699'
	return tonumber(hex:sub(1, 2), 16), tonumber(hex:sub(3, 4), 16), tonumber(hex:sub(5, 6), 16)
end

-- DoorSystem doors often have no collision for the raycast: take the object closest to the camera ray.
local function scanAlongCamera()
	local camPos = GetGameplayCamCoord()
	local rot = GetGameplayCamRot(2)
	local rx, rz = math.rad(rot.x), math.rad(rot.z)
	local dir = vector3(-math.sin(rz) * math.cos(rx), math.cos(rz) * math.cos(rx), math.sin(rx))
	local best, bestProj = nil, math.huge

	for _, object in ipairs(GetGamePool('CObject')) do
		-- Weapons and props held by the player sit on the camera ray too.
		if not IsEntityAttached(object) then
			local offset = GetEntityCoords(object) - camPos
			local proj = offset.x * dir.x + offset.y * dir.y + offset.z * dir.z
			if proj > 0.3 and proj < 8.0 and proj < bestProj and #(offset - dir * proj) < 1.2 then
				best, bestProj = object, proj
			end
		end
	end

	return best
end

-- Same target as the upstream tool: the prop the ray hits, else the scan. The raycast waits the frame.
local function aimTarget()
	local hit, entity, coords = lib.raycast.fromCamera(1 | 16, 4, RAY_DISTANCE)
	if hit and entity > 0 and GetEntityType(entity) == 3 then return entity, coords end
	local object = scanAlongCamera()
	if object then return object, GetEntityCoords(object) end
	return nil, hit and coords or nil
end

-- Model, closed position and heading of the door entity.
local function capture(entity)
	local model = GetEntityModel(entity)
	local coords = GetEntityCoords(entity)
	AddDoorToSystem(`temp`, model, coords.x, coords.y, coords.z, false, false, false)
	DoorSystemSetDoorState(`temp`, 4, false, false)
	coords = GetEntityCoords(entity)
	RemoveDoorFromSystem(`temp`)
	return {
		entity = entity,
		model = model,
		coords = { x = coords.x, y = coords.y, z = coords.z },
		heading = math.floor(GetEntityHeading(entity) + 0.5),
	}
end

function DoorPicker.isActive()
	return active
end

---Pick `count` door entities (2 for a double door). `accept(entity)` rejects doors that belong to another lock.
---@param count 1|2
---@param accept fun(entity: number): boolean
---@return { model: number, coords: table, heading: number }[]|nil
function DoorPicker.pick(count, accept)
	if active then return nil end
	active = true

	local picked = {}
	local r, g, b = accent()
	local outlined
	local result

	local function isPicked(entity)
		for i = 1, #picked do
			if picked[i].entity == entity then return true end
		end
		return false
	end

	local function push() hud({ mode = 'door', count = #picked, total = count }) end

	push()

	-- One frame per turn: aimTarget waits it, so the loop has no Wait of its own (a second one skips keys and draws).
	while active do
		local entity, point = aimTarget()
		for i = 1, #BLOCKED do DisableControlAction(0, BLOCKED[i], true) end

		local valid = entity and DoesEntityExist(entity) and not isPicked(entity) and accept(entity) and entity or nil

		if outlined ~= valid then
			if outlined and not isPicked(outlined) then SetEntityDrawOutline(outlined, false) end
			outlined = valid
			if outlined then OutlineDoor(outlined, true) end
		end

		if point then
			DrawMarker(28, point.x, point.y, point.z, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1, r, g, b, 220, false, false, 2, false, nil, nil, false)
		end

		if IsControlJustPressed(0, KEY.mark) and valid then
			PlaySoundFrontend(-1, 'SELECT', 'HUD_FRONTEND_DEFAULT_SOUNDSET', true)
			picked[#picked + 1] = capture(valid)
			outlined = nil
			if #picked == count then
				result = picked
				break
			end
			push()
		elseif IsControlJustPressed(0, KEY.undo) then
			PlaySoundFrontend(-1, 'BACK', 'HUD_FRONTEND_DEFAULT_SOUNDSET', true)
			if #picked == 0 then break end
			SetEntityDrawOutline(picked[#picked].entity, false)
			picked[#picked] = nil
			push()
		elseif IsDisabledControlJustPressed(0, KEY.cancel) then
			PlaySoundFrontend(-1, 'BACK', 'HUD_FRONTEND_DEFAULT_SOUNDSET', true)
			releaseEsc()
			break
		end
	end

	active = false
	hud(false)
	if outlined then SetEntityDrawOutline(outlined, false) end
	for i = 1, #picked do
		SetEntityDrawOutline(picked[i].entity, false)
		picked[i].entity = nil
	end

	return result
end

AddEventHandler('onResourceStop', function(resource)
	if resource == cache.resource and LocalPlayer.state.escBusy then LocalPlayer.state:set('escBusy', false, false) end
end)
