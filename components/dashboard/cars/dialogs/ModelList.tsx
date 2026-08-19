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
import { CarBrand, CarBrandModel, CreateModelDto } from '../../../../lib/api-client';
import DragHandle from './DragHandle';

interface ModelListProps {
  brand: CarBrand | null;
  onAdd: () => void;
  onEdit: (modelId: string, data: CreateModelDto) => void;
  onDelete: (modelId: string) => void;
  onReorder: (modelIds: string[]) => void;
}

interface SortableModelItemProps {
  model: CarBrandModel;
  onEdit: (modelId: string) => void;
  onDelete: (modelId: string) => void;
}

function SortableModelItem({ model, onEdit, onDelete }: SortableModelItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: model.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center justify-between p-3 rounded-[8px] cursor-pointer transition-all
        bg-white border border-[#f2f2f2] hover:bg-gray-50
        ${isDragging ? 'shadow-lg z-50' : ''}
      `}
    >
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="flex items-center shrink-0 touch-none"
      >
        <DragHandle />
      </div>

      {/* Model Info */}
      <div className="flex flex-col gap-0.5 flex-1 mr-3">
        <span className="text-[14px] font-medium text-[#1a1a1a] text-start">
          {model.name}
        </span>
        {model.nameEn && (
          <span className="text-[10px] text-[#6b7280] text-start">
            {model.nameEn}
          </span>
        )}
      </div>

      {/* Actions - RIGHT in DOM, appears on LEFT in RTL */}
      <div className="flex items-center gap-2">
        {/* Edit Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(model.id);
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
            onDelete(model.id);
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

export default function ModelList({ brand, onAdd, onEdit, onDelete, onReorder }: ModelListProps) {
  const [localModels, setLocalModels] = useState<CarBrandModel[]>(brand?.models || []);

  // Sync local state when brand changes
  React.useEffect(() => {
    setLocalModels(brand?.models || []);
  }, [brand]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localModels.findIndex((model) => model.id === active.id);
      const newIndex = localModels.findIndex((model) => model.id === over.id);

      const reorderedModels = arrayMove(localModels, oldIndex, newIndex);
      setLocalModels(reorderedModels);
      onReorder(reorderedModels.map(model => model.id));
    }
  };

  // Placeholder when no brand is selected
  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16" dir="rtl">
        <div className="w-16 h-16 rounded-full bg-[#f9fafb] flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="#d1d5db" strokeWidth="1.5"/>
            <circle cx="5.5" cy="5.5" r="1.5" stroke="#d1d5db" strokeWidth="1"/>
            <path d="M3 13L6 10L8 12L11 9L13 11" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-[14px] text-[#8286ab] text-center">
          اختر ماركة لعرض الموديلات
        </p>
        <p className="text-[12px] text-[#d1d5db] text-center mt-1">
          قم بتحديد ماركة من القائمة الجانبية
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
            {brand.name}
          </h3>
          <span className="text-[10px] text-[#8286ab]">
            {localModels.length} موديل
          </span>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#002ec1] text-white text-[12px] font-medium rounded-full hover:bg-blue-700 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          اضافة موديل
        </button>
      </div>

      {/* Models List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localModels.map(model => model.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar">
            {localModels.length === 0 ? (
              <div className="text-center py-8 text-[14px] text-[#8286ab]">
                لا توجد موديلات لهذه الماركة
              </div>
            ) : (
              localModels.map((model) => (
                <SortableModelItem
                  key={model.id}
                  model={model}
                  onEdit={(modelId) => {
                    const modelData = localModels.find(m => m.id === modelId);
                    if (modelData) {
                      onEdit(modelId, { name: modelData.name, nameEn: modelData.nameEn });
                    }
                  }}
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