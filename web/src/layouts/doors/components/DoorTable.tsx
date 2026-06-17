import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { DoorColumn } from '../../../store/doors';
import { useSearch } from '../../../store/search';
import { useDoors } from '../../../store/doors';
import { useDoorGroups } from '../../../store/doorGroups';
import * as Accordion from '@radix-ui/react-accordion';
import { GroupDroppable as DoorGroupContainer } from './GroupDroppable';
import { DoorRow } from './DoorRow';
import { fetchNui } from '../../../utils/fetchNui';

const DoorTable: React.FC = () => {
  const [openGroups, setOpenGroups] = useState<string[]>(['group-ungrouped']);
  const globalFilter = useSearch((state) => state.debouncedValue);
  const data = useDoors((state) => state.doors);
  const doorGroupsData = useDoorGroups((state) => state.doorGroups);

  // Group the doors based on globalFilter and grouping logic
  const groupedDoors = useMemo(() => {
    const groups: Record<number | 'ungrouped', DoorColumn[]> = { ungrouped: [] };
    
    // Initialize empty arrays for all existing groups
    Object.keys(doorGroupsData).forEach(id => {
      groups[Number(id)] = [];
    });

    // Filter and assign to groups
    data.forEach(door => {
      if (globalFilter && !door.name.toLowerCase().includes(globalFilter.toLowerCase()) && !door.id.toString().includes(globalFilter)) {
        return; // Skip if filtered out
      }
      
      const groupId = door.doorGroupId;
      if (groupId && groups[groupId]) {
        groups[groupId].push(door);
      } else {
        groups.ungrouped.push(door);
      }
    });

    return groups;
  }, [data, doorGroupsData, globalFilter]);



  const hasAnyContent = data.length > 0 || Object.keys(doorGroupsData).length > 0;

  return (
    <div className="flex flex-col justify-between flex-1 overflow-hidden p-6 bg-background relative">
      {hasAnyContent ? (
          <div className="overflow-auto flex-1 pr-2 custom-scrollbar">
            <Accordion.Root 
              type="multiple" 
              value={openGroups} 
              onValueChange={setOpenGroups}
              className="space-y-4"
            >
              
              {/* Render dynamic groups */}
              {Object.values(doorGroupsData).map(group => (
                <DoorGroupContainer 
                  key={`group-${group.id}`} 
                  group={group}
                  onOpen={() => setOpenGroups(prev => prev.includes(`group-${group.id}`) ? prev : [...prev, `group-${group.id}`])}
                >
                  {groupedDoors[group.id]?.map(door => (
                    <DoorRow key={door.id} door={door} />
                  ))}
                </DoorGroupContainer>
              ))}

              {/* Render ungrouped items */}
              {groupedDoors.ungrouped.length > 0 && (
                <DoorGroupContainer 
                  group="ungrouped"
                  onOpen={() => setOpenGroups(prev => prev.includes('group-ungrouped') ? prev : [...prev, 'group-ungrouped'])}
                >
                  {groupedDoors.ungrouped.map(door => (
                    <DoorRow key={door.id} door={door} />
                  ))}
                </DoorGroupContainer>
              )}

            </Accordion.Root>
          </div>

      ) : (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
          <Search size={40} className="opacity-30" />
          <p className="text-sm">Nenhum resultado encontrado</p>
        </div>
      )}
    </div>
  );
};

export default DoorTable;
