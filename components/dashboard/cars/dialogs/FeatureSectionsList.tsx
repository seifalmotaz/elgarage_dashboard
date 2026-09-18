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
import { FeatureSection } from '../../../../lib/api-client';
import DragHandle from './DragHandle';

interface FeatureSectionsListProps {
  sections: FeatureSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onEdit?: (id: string) => void;
  onReorder: (ids: string[]) => void;
  onDelete: (id: string) => void;
}

interface SortableFeatureSectionItemProps {
  section: FeatureSection;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete: (id: string) => void;
}

function SortableFeatureSectionItem({ 
  section, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete 
}: SortableFeatureSectionItemProps) {
  const {
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      style={style}
      className={`
        flex items-center justify-between p-3 rounded-[8px] cursor-pointer transition-all
        ${isSelected 
          ? 'bg-[#e9f0fc] border-2 border-[#002ec1]' 
          : 'bg-white border border-[#f2f2f2] hover:bg-gray-50'
        }
        ${isDragging ? 'shadow-lg z-50' : ''}
      `}
      onClick={() => onSelect(section.id)}
    >
      {/* Drag Handle - LEFT in DOM, appears on RIGHT in RTL */}
      <div {...attributes} {...listeners} className="flex items-center shrink-0">
        <DragHandle />
      </div>

      {/* Section Info */}
      <div className="flex items-center gap-2 flex-1 mr-3 min-w-0">
        <div className="flex flex-col min-w-0">
          <span className="text-[14px] font-medium text-[#1a1a1a] text-start truncate">
            {section.name}
          </span>
          {section.nameEn ? (
            <span className="text-[11px] text-[#8286ab] text-start truncate" dir="ltr">
              {section.nameEn}
            </span>
          ) : null}
        </div>
      </div>

      {/* Count Badge & Actions */}
      <div className="flex items-center gap-2">
        {/* Item Count Badge */}
        <span className="text-[10px] font-light text-[#8286ab] bg-[#f9fafb] px-2 py-0.5 rounded-full">
          {section.items.length} ميزة
        </span>

        {/* Edit Button */}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(section.id);
            }}
            className="w-6 h-6 flex items-center justify-center shrink-0 hover:bg-blue-50 rounded-full transition-colors"
            aria-label="تعديل القسم"
            title="تعديل القسم"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11.586 2.586a2 2 0 112.828 2.828L6.343 13.485a1 1 0 01-.39.242l-3.535 1.178a.5.5 0 01-.632-.632l1.178-3.535a1 1 0 01.242-.39l8.07-8.07z"
                stroke="#002ec1"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </button>
        )}

        {/* Delete Button - RIGHT in DOM, appears on LEFT in RTL */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(section.id);
          }}
          className="w-6 h-6 flex items-center justify-center shrink-0 hover:bg-red-50 rounded-full transition-colors"
          aria-label="حذف القسم"
          title="حذف القسم"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4L12 12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function FeatureSectionsList({ 
  sections, 
  selectedId, 
  onSelect, 
  onAdd, 
  onEdit,
  onReorder, 
  onDelete 
}: FeatureSectionsListProps) {
  const [localSections, setLocalSections] = useState<FeatureSection[]>(sections);

  // Sync local state when sections prop changes
  React.useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localSections.findIndex((section) => section.id === active.id);
      const newIndex = localSections.findIndex((section) => section.id === over.id);

      const reorderedSections = arrayMove(localSections, oldIndex, newIndex);
      setLocalSections(reorderedSections);
      onReorder(reorderedSections.map(section => section.id));
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[#002ec1]">أقسام المميزات</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#002ec1] text-white text-[12px] font-medium rounded-full hover:bg-blue-700 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          اضافة قسم
        </button>
      </div>

      {/* Sections List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localSections.map(section => section.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar">
            {localSections.length === 0 ? (
              <div className="text-center py-8 text-[14px] text-[#8286ab]">
                لا توجد أقسام مميزات
              </div>
            ) : (
              localSections.map((section) => (
                <SortableFeatureSectionItem
                  key={section.id}
                  section={section}
                  isSelected={selectedId === section.id}
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