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

CreateThread(function()
    local deadline = GetGameTimer() + 10000
    while GetResourceState('mri_Qadmin') ~= 'started' and GetGameTimer() < deadline do
        Wait(200)
    end
    registerPlugin()
end)

-- Sinal oficial do Qadmin: emitido sempre que o registry dele fica pronto.
-- Complementa o onResourceStart abaixo, que depende do timing do start; este
-- dispara quando o registry esta de fato aceitando plugins. RegisterPlugin e
-- idempotente por `id`, entao os dois caminhos juntos sao seguros.
AddEventHandler('mri_Qadmin:server:pluginsReady', registerPlugin)

-- Tema da suíte: repassa as convars de cor aos clients quando mudam, sem
-- restart. O client leva pra NUI (client/utils.lua).
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

AddEventHandler('onResourceStart', function(resourceName)
    if resourceName == 'mri_Qadmin' then
        Wait(500)
        registerPlugin()
    end
end)
