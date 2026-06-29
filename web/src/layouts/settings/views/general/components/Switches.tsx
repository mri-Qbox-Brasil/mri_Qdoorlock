import React, { useState } from 'react';
import TooltipSwitch from './TooltipSwitch';
import { useSetters, useStore } from '../../../../../store';
import { useTranslation } from 'react-i18next';
import { Lock, Settings, EyeOff, Layers, Key, DoorOpen, Info } from 'lucide-react';

interface HoveredInfo {
  label: string;
  tooltip: string;
  icon: React.ReactNode;
}

const Switches: React.FC = () => {
  const locked = useStore((state) => state.state);
  const double = useStore((state) => state.doors);
  const automatic = useStore((state) => state.auto);
  const lockpick = useStore((state) => state.lockpick);
  const hideUi = useStore((state) => state.hideUi);
  const holdOpen = useStore((state) => state.holdOpen);
  const toggleCheckbox = useSetters((setter) => setter.toggleCheckbox);
  const isBulkEdit = useStore((state) => state.isBulkEdit);

  const { t } = useTranslation();
  
  const [hoveredInfo, setHoveredInfo] = useState<HoveredInfo | null>(null);

  return (
    <div className="flex flex-col gap-3 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <TooltipSwitch
          label={t('ui_switch_locked_label')}
          value={locked || false}
          toggle={() => toggleCheckbox('state')}
          icon={<Lock size={15} />}
          onMouseEnter={() => setHoveredInfo({ label: t('ui_switch_locked_label'), tooltip: t('ui_switch_locked_tooltip'), icon: <Lock size={16} /> })}
          onMouseLeave={() => setHoveredInfo(null)}
        />
        <TooltipSwitch
          label={t('ui_switch_double_label')}
          value={double || false}
          toggle={() => toggleCheckbox('doors')}
          disabled={isBulkEdit}
          icon={<Layers size={15} />}
          onMouseEnter={() => setHoveredInfo({ label: t('ui_switch_double_label'), tooltip: isBulkEdit ? t('ui_switch_double_bulk') : t('ui_switch_double_tooltip'), icon: <Layers size={16} /> })}
          onMouseLeave={() => setHoveredInfo(null)}
        />
        <TooltipSwitch
          label={t('ui_switch_auto_label')}
          value={automatic || false}
          toggle={() => toggleCheckbox('auto')}
          icon={<Settings size={15} />}
          onMouseEnter={() => setHoveredInfo({ label: t('ui_switch_auto_label'), tooltip: t('ui_switch_auto_tooltip'), icon: <Settings size={16} /> })}
          onMouseLeave={() => setHoveredInfo(null)}
        />
        <TooltipSwitch
          label={t('ui_switch_lockpick_label')}
          value={lockpick || false}
          toggle={() => toggleCheckbox('lockpick')}
          icon={<Key size={15} />}
          onMouseEnter={() => setHoveredInfo({ label: t('ui_switch_lockpick_label'), tooltip: t('ui_switch_lockpick_tooltip'), icon: <Key size={16} /> })}
          onMouseLeave={() => setHoveredInfo(null)}
        />
        <TooltipSwitch
          label={t('ui_switch_hideui_label')}
          value={hideUi || false}
          toggle={() => toggleCheckbox('hideUi')}
          icon={<EyeOff size={15} />}
          onMouseEnter={() => setHoveredInfo({ label: t('ui_switch_hideui_label'), tooltip: t('ui_switch_hideui_tooltip'), icon: <EyeOff size={16} /> })}
          onMouseLeave={() => setHoveredInfo(null)}
        />
        <TooltipSwitch
          label={t('ui_switch_holdopen_label')}
          value={holdOpen || false}
          toggle={() => toggleCheckbox('holdOpen')}
          icon={<DoorOpen size={15} />}
          onMouseEnter={() => setHoveredInfo({ label: t('ui_switch_holdopen_label'), tooltip: t('ui_switch_holdopen_tooltip'), icon: <DoorOpen size={16} /> })}
          onMouseLeave={() => setHoveredInfo(null)}
        />
      </div>

      <div 
        className={`min-h-[64px] flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 ${
          hoveredInfo 
            ? 'bg-primary/5 border-primary/20 opacity-100 translate-y-0' 
            : 'bg-card/30 border-transparent opacity-0 translate-y-1 pointer-events-none'
        }`}
      >
        {hoveredInfo && (
          <>
            <div className="mt-0.5 text-primary bg-primary/10 p-1.5 rounded-lg">
              {hoveredInfo.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground tracking-tight">{hoveredInfo.label}</span>
              <span className="text-xs text-muted-foreground leading-relaxed mt-0.5">{hoveredInfo.tooltip}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Switches;
