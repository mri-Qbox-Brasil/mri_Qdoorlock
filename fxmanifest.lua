--[[ FX Information ]]--
fx_version   'cerulean'
use_experimental_fxv2_oal 'yes'
lua54        'yes'
game         'gta5'

--[[ Resource Information ]]--
name         'mri_Qdoorlock'
version      '1.22.0'
license      'GPL-3.0-or-later'
author       'MRI Qbox Brasil (baseado em ox_doorlock da Overextended)'
repository   'https://github.com/mri-Qbox-Brasil/mri_Qdoorlock'
provide      'ox_doorlock'

--[[ Manifest ]]--
shared_scripts {
	'@ox_lib/init.lua',
	'config.lua',
	'mri/compat.lua',
}

client_scripts {
	'client/main.lua',
	'client/utils.lua',
}

server_scripts {
	'@oxmysql/lib/MySQL.lua',
	'server/main.lua',
	'mri/server.lua',
}

ui_page 'web/build/index.html?v=2'

files {
	'web/build/index.html',
	'web/build/**/*',
	'locales/*.json',
	'audio/data/oxdoorlock_sounds.dat54.rel',
	'audio/dlc_oxdoorlock/oxdoorlock.awc',
}

data_file 'AUDIO_WAVEPACK' 'audio/dlc_oxdoorlock'
data_file 'AUDIO_SOUNDDATA' 'audio/data/oxdoorlock_sounds.dat'

dependencies {
	'oxmysql',
	'ox_lib',
}

ox_libs {
    'locale',
    'table',
}
