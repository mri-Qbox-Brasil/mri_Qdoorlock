if cache.resource == 'ox_doorlock' then return end

local names = IsDuplicityVersion() and {
	'getDoor',
	'getAllDoors',
	'getDoorFromName',
	'editDoor',
	'createDoor',
	'removeDoor',
	'setDoorState',
	'registerHook',
	'removeResourceHook',
} or {
	'useClosestDoor',
	'getClosestDoor',
	'getClosestDoorId',
	'getDoorIdFromEntity',
	'pickClosestDoor',
}

local self = exports[cache.resource]

for i = 1, #names do
	local name = names[i]

	AddEventHandler(('__cfx_export_ox_doorlock_%s'):format(name), function(setCB)
		setCB(function(...)
			return self[name](self, ...)
		end)
	end)
end
