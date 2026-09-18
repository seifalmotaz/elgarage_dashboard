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
import { SpecType, SpecOption, CreateSpecOptionDto } from '../../../../lib/api-client';
import DragHandle from './DragHandle';

interface SpecOptionManagerProps {
  specType: SpecType | null;
  onAddOption: () => void;
  onEditOption: (id: string) => void;
  onDeleteOption: (id: string) => void;
  onReorderOptions: (ids: string[]) => void;
  onEditSpecType?: (type: SpecType) => void;
}

interface SortableSpecOptionItemProps {
  option: SpecOption;
  onEdit: (optionId: string) => void;
  onDelete: (optionId: string) => void;
}

function SortableSpecOptionItem({ option, onEdit, onDelete }: SortableSpecOptionItemProps) {
  const {
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

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
        bg-white border border-[#f2f2f2] hover:border-[#002ec1]/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)]
        ${isDragging ? 'shadow-xl z-50 scale-[1.02]' : ''}
      `}
    >
      {/* Right side (RTL): Drag Handle + Option Info */}
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

        {/* Option Info */}
        <div className="flex flex-col min-w-0 text-right">
          <span className="text-[14px] font-semibold text-[#1a1a1a] truncate">
            {option.label}
          </span>
          <span className="text-[10px] text-[#8286ab] font-mono mt-0.5">
            {option.value}
          </span>
        </div>
      </div>

      {/* Left side: Action buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" dir="rtl">
        {/* Edit Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(option.id);
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
            onDelete(option.id);
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
  );
}

export default function SpecOptionManager({ 
  specType, 
  onAddOption, 
  onEditOption, 
  onDeleteOption, 
  onReorderOptions,
  onEditSpecType
}: SpecOptionManagerProps) {
  const [localOptions, setLocalOptions] = useState<SpecOption[]>(specType?.options || []);

  // Sync local state when specType changes
  React.useEffect(() => {
    setLocalOptions(specType?.options || []);
  }, [specType]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localOptions.findIndex((option) => option.id === active.id);
      const newIndex = localOptions.findIndex((option) => option.id === over.id);

      const reorderedOptions = arrayMove(localOptions, oldIndex, newIndex);
      setLocalOptions(reorderedOptions);
      onReorderOptions(reorderedOptions.map(option => option.id));
    }
  };

  // Placeholder when no type is selected
  if (!specType) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center" dir="rtl">
        <div className="w-20 h-20 rounded-full bg-[#f4f7fe] flex items-center justify-center mb-5 animate-pulse">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#002ec1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M21 12H3" />
            <path d="M12 3v18" />
          </svg>
        </div>
        <p className="text-[16px] font-bold text-[#1a1a1a]">
          اختر نوع مواصفة من القائمة الجانبية
        </p>
        <p className="text-[13px] text-[#8286ab] mt-2 max-w-[280px] leading-[1.6] font-light">
          قم بتحديد نوع مواصفة للبدء في إدارة وتعديل الخيارات والقيم المتاحة لها.
        </p>
      </div>
    );
  }

  // Handle TEXT or NUMBER spec types
  if (specType.fieldType === 'TEXT' || specType.fieldType === 'NUMBER') {
    return (
      <div className="flex flex-col gap-6 h-full" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col text-right">
            <h3 className="text-[14px] font-bold text-[#002ec1]">
              معاينة: {specType.name}
            </h3>
            <span className="text-[10px] text-[#8286ab] font-mono mt-0.5">
              مواصفة من نوع {specType.fieldType === 'TEXT' ? 'نص حر' : 'قيمة رقمية'}
            </span>
          </div>
          {onEditSpecType && (
            <button
              onClick={() => onEditSpecType(specType)}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#002ec1] text-[#002ec1] hover:bg-[#002ec1]/5 text-[12px] font-semibold rounded-full transition-all duration-200 active:scale-95"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
              </svg>
              تعديل مواصفة
            </button>
          )}
        </div>

        {/* Preview Input Card */}
        <div className="flex flex-col bg-white border border-[#f2f2f2] rounded-[24px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] gap-5 text-right">
          <div className="border-b border-[#f2f2f2] pb-3">
            <span className="text-[12px] font-bold text-gray-400 tracking-wide uppercase">معاينة الحقل في نموذج السيارة</span>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#1a1a1a] font-semibold leading-[1.5]">
              {specType.name}
            </label>
            <input
              type={specType.fieldType === 'NUMBER' ? 'number' : 'text'}
              disabled
              placeholder={specType.fieldType === 'NUMBER' ? 'مثال: 2000' : 'أدخل القيمة هنا...'}
              className="bg-[#fafafa] border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 text-[13px] text-gray-400 font-light leading-[1.7] outline-none w-full cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2.5 mt-2 bg-gray-50/50 p-4 rounded-[16px] border border-gray-100">
            <span className="text-[12px] font-semibold text-[#1a1a1a]">خصائص هذا الحقل:</span>
            <ul className="flex flex-col gap-1.5 text-[11px] text-[#6b7280] list-none pr-0">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>إدخال يدوي مباشر من صفحة إضافة السيارة.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>لا يتطلب تهيئة أو إدارة أي خيارات مسبقة.</span>
              </li>
              {specType.fieldType === 'NUMBER' && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>يقبل الأرقام فقط ويمنع الحروف والرموز تلقائياً.</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col text-right">
          <h3 className="text-[14px] font-bold text-[#002ec1]">
            خيارات: {specType.name}
          </h3>
          <span className="text-[10px] text-[#8286ab] font-mono mt-0.5">
            {localOptions.length} خيار متاح
          </span>
        </div>
        <button
          onClick={onAddOption}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#002ec1] text-white text-[12px] font-semibold rounded-full hover:bg-blue-700 shadow-sm hover:shadow transition-all duration-200 active:scale-95"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          اضافة خيار
        </button>
      </div>

      {/* Options List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localOptions.map(option => option.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2.5 overflow-y-auto no-scrollbar pr-0.5">
            {localOptions.length === 0 ? (
              <div className="text-center py-12 text-[14px] text-[#8286ab] border border-dashed border-[#e5e7eb] rounded-[16px]">
                لا توجد خيارات مضافة لهذا النوع بعد
              </div>
            ) : (
              localOptions.map((option) => (
                <SortableSpecOptionItem
                  key={option.id}
                  option={option}
                  onEdit={onEditOption}
                  onDelete={onDeleteOption}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}