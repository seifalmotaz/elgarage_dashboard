'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SpecType } from '../../../../lib/api-client';
import DragHandle from './DragHandle';

interface SpecTypeListProps {
  specTypes: SpecType[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onEdit: (type: SpecType) => void;
  onReorder: (ids: string[]) => void;
  onDelete: (id: string) => void;
}

interface SortableSpecTypeItemProps {
  specType: SpecType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (type: SpecType) => void;
  onDelete: (id: string) => void;
}

function SortableSpecTypeItem({ specType, isSelected, onSelect, onEdit, onDelete }: SortableSpecTypeItemProps) {
  const {
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: specType.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      style={style}
      className={`
        group flex items-center justify-between p-3.5 rounded-[16px] cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'bg-[#e9f0fc] border border-[#002ec1] shadow-[0_4px_12px_rgba(0,46,193,0.08)]' 
          : 'bg-white border border-[#f2f2f2] hover:border-[#002ec1]/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)]'
        }
        ${isDragging ? 'shadow-xl z-50 scale-[1.02]' : ''}
      `}
      onClick={() => onSelect(specType.id)}
    >
      {/* Right side (RTL): Drag handle + Name Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0" dir="rtl">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="flex items-center shrink-0 opacity-40 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <DragHandle />
        </div>

        {/* Spec Type Info */}
        {specType.iconUrl ? (
          <img
            src={specType.iconUrl}
            alt=""
            width={24}
            height={24}
            className="w-6 h-6 object-contain shrink-0 rounded"
          />
        ) : null}
        <div className="flex flex-col min-w-0 text-right">
          <span className={`text-[14px] font-semibold truncate ${isSelected ? 'text-[#002ec1]' : 'text-[#1a1a1a]'}`}>
            {specType.name}
          </span>
          {specType.key && (
            <span className="text-[10px] text-[#8286ab] font-mono tracking-wide mt-0.5">
              {specType.key}
            </span>
          )}
        </div>
      </div>

      {/* Left side: Badge + Action buttons */}
      <div className="flex items-center gap-3 shrink-0" dir="rtl">
        {/* Type Badge */}
        {specType.fieldType === 'TEXT' ? (
          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
            نص حر
          </span>
        ) : specType.fieldType === 'NUMBER' ? (
          <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
            رقم
          </span>
        ) : (
          <span className="text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
            {specType.options.length} خيار
          </span>
        )}

        {/* Actions Container */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(specType);
            }}
            className="w-8 h-8 flex items-center justify-center hover:bg-[#002ec1]/10 rounded-full text-[#002ec1] transition-all hover:scale-105"
            title="تعديل"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
            </svg>
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(specType.id);
            }}
            className="w-8 h-8 flex items-center justify-center hover:bg-red-50 rounded-full text-red-500 transition-all hover:scale-105"
            title="حذف"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SpecTypeList({ specTypes, selectedId, onSelect, onAdd, onEdit, onReorder, onDelete }: SpecTypeListProps) {
  const [localTypes, setLocalTypes] = useState<SpecType[]>(specTypes);

  // Sync local state when specTypes prop changes
  React.useEffect(() => {
    setLocalTypes(specTypes);
  }, [specTypes]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localTypes.findIndex((type) => type.id === active.id);
      const newIndex = localTypes.findIndex((type) => type.id === over.id);

      const reorderedTypes = arrayMove(localTypes, oldIndex, newIndex);
      setLocalTypes(reorderedTypes);
      onReorder(reorderedTypes.map(type => type.id));
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-[#002ec1]">أنواع المواصفات</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#002ec1] text-white text-[12px] font-semibold rounded-full hover:bg-blue-700 shadow-sm hover:shadow transition-all duration-200 active:scale-95"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          اضافة نوع
        </button>
      </div>

      {/* Types List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localTypes.map(type => type.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2.5 overflow-y-auto no-scrollbar pr-0.5">
            {localTypes.length === 0 ? (
              <div className="text-center py-12 text-[14px] text-[#8286ab] border border-dashed border-[#e5e7eb] rounded-[16px]">
                لا توجد أنواع مواصفات مضافة
              </div>
            ) : (
              localTypes.map((type) => (
                <SortableSpecTypeItem
                  key={type.id}
                  specType={type}
                  isSelected={selectedId === type.id}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}