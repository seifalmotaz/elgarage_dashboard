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
import { FeatureSection, FeatureItem } from '../../../../lib/api-client';
import DragHandle from './DragHandle';

interface FeatureItemsManagerProps {
  section: FeatureSection | null;
  onAddItem: () => void;
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onReorderItems: (ids: string[]) => void;
}

interface SortableFeatureItemProps {
  item: FeatureItem;
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

function SortableFeatureItem({ item, onEdit, onDelete }: SortableFeatureItemProps) {
  const {
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

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
        bg-white border border-[#f2f2f2] hover:bg-gray-50
        ${isDragging ? 'shadow-lg z-50' : ''}
      `}
    >
      {/* Drag Handle - LEFT in DOM, appears on RIGHT in RTL */}
      <div {...attributes} {...listeners} className="flex items-center shrink-0">
        <DragHandle />
      </div>

      {/* Icon Preview */}
      <div className="w-[24px] h-[24px] mr-3 shrink-0 rounded-full bg-[#f9fafb] overflow-hidden flex items-center justify-center">
        {item.iconUrl ? (
          <img
            src={item.iconUrl || ''}
            alt={item.name}
            className="w-[20px] h-[20px] object-contain"
          />
        ) : (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="#d1d5db" strokeWidth="1.5"/>
          </svg>
        )}
      </div>

      {/* Item Info */}
      <div className="flex flex-col gap-0.5 flex-1">
        <span className="text-[14px] font-medium text-[#1a1a1a] text-start">
          {item.name}
        </span>
      </div>

      {/* Actions - RIGHT in DOM, appears on LEFT in RTL */}
      <div className="flex items-center gap-2">
        {/* Edit Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item.id);
          }}
          className="w-6 h-6 flex items-center justify-center shrink-0 hover:bg-blue-50 rounded-full transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path 
              d="M11.586 2.586a2 2 0 112.828 2.828L6.343 13.485a1 1 0 01-.39.242l-3.535 1.178a.5.5 0 01-.632-.632l1.178-3.535a1 1 0 01.242-.39l8.07-8.07z" 
              stroke="#002ec1" 
              strokeWidth="1.5" 
              fill="none"
            />
          </svg>
        </button>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="w-6 h-6 flex items-center justify-center shrink-0 hover:bg-red-50 rounded-full transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4L12 12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function FeatureItemsManager({
  section,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onReorderItems,
}: FeatureItemsManagerProps) {
  const [localItems, setLocalItems] = useState<FeatureItem[]>(section?.items || []);

  // Sync local state when section changes
  React.useEffect(() => {
    setLocalItems(section?.items || []);
  }, [section]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex((item) => item.id === active.id);
      const newIndex = localItems.findIndex((item) => item.id === over.id);

      const reorderedItems = arrayMove(localItems, oldIndex, newIndex);
      setLocalItems(reorderedItems);
      onReorderItems(reorderedItems.map(item => item.id));
    }
  };

  // Placeholder when no section is selected
  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16" dir="rtl">
        <div className="w-16 h-16 rounded-full bg-[#f9fafb] flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="#d1d5db" strokeWidth="1.5"/>
            <path d="M4 8h8M8 4v8" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-[14px] text-[#8286ab] text-center">
          اختر قسم من القائمة
        </p>
        <p className="text-[12px] text-[#d1d5db] text-center mt-1">
          قم بتحديد قسم من القائمة الجانبية لإدارة ميزاته
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-[14px] font-semibold text-[#002ec1]">
            {section.name}
          </h3>
          <span className="text-[10px] text-[#8286ab]">
            {localItems.length} ميزة
          </span>
        </div>
        <button
          onClick={onAddItem}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#002ec1] text-white text-[12px] font-medium rounded-full hover:bg-blue-700 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          اضافة ميزة
        </button>
      </div>

      {/* Items List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localItems.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar">
            {localItems.length === 0 ? (
              <div className="text-center py-8 text-[14px] text-[#8286ab]">
                لا توجد ميزات في هذا القسم
              </div>
            ) : (
              localItems.map((item) => (
                <SortableFeatureItem
                  key={item.id}
                  item={item}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}