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
import { CarBrand } from '../../../../lib/api-client';
import DragHandle from './DragHandle';

interface BrandListProps {
  brands: CarBrand[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onReorder: (ids: string[]) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

interface SortableBrandItemProps {
  brand: CarBrand;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

function SortableBrandItem({ brand, isSelected, onSelect, onDelete, onEdit }: SortableBrandItemProps) {
  const [logoError, setLogoError] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: brand.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Get website domain without protocol
  const displayWebsite = brand.website?.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const websiteInfo = displayWebsite && displayWebsite.length > 20 
    ? displayWebsite.substring(0, 20) + '...' 
    : displayWebsite;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center justify-between p-3 rounded-[8px] cursor-pointer transition-all
        ${isSelected 
          ? 'bg-[#e9f0fc] border-2 border-[#002ec1]' 
          : 'bg-white border border-[#f2f2f2] hover:bg-gray-50'
        }
        ${isDragging ? 'shadow-lg z-50' : ''}
      `}
      onClick={() => onSelect(brand.id)}
    >
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="flex items-center shrink-0 touch-none"
        onClick={(e) => e.stopPropagation()}
      >
        <DragHandle />
      </div>

      {/* Brand Logo */}
      <div className="w-8 h-8 shrink-0 mr-3 flex items-center justify-center">
        {brand.logo && !logoError ? (
          <img
            src={brand.logo}
            alt={brand.name}
            className="w-8 h-8 object-contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          // Placeholder when no logo
          <div className="w-8 h-8 rounded-full bg-[#f2f2f2] flex items-center justify-center">
            <span className="text-[10px] font-medium text-[#6b7280]">
              {brand.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Brand Info */}
      <div className="flex flex-col flex-1 mr-2">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium text-[#1a1a1a] text-start">
            {brand.name}
          </span>
          {brand.nameEn && (
            <span className="text-[10px] text-[#6b7280] text-start">
              ({brand.nameEn})
            </span>
          )}
        </div>
        {/* Show website if available */}
        {(brand as any).website && (
          <span className="text-[10px] text-[#8286ab] text-start truncate">
            {websiteInfo}
          </span>
        )}
      </div>

      {/* Count Badge */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-light text-[#8286ab] bg-[#f9fafb] px-2 py-0.5 rounded-full">
          {brand.models.length} موديل
        </span>
      </div>

      {/* Actions - RIGHT in DOM, appears on LEFT in RTL */}
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(brand.id);
          }}
          className="w-6 h-6 flex items-center justify-center shrink-0 hover:bg-blue-50 rounded-full transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z" stroke="#002ec1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(brand.id);
          }}
          className="w-6 h-6 flex items-center justify-center shrink-0 hover:bg-red-50 rounded-full transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4L12 12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function BrandList({ brands, selectedId, onSelect, onAdd, onReorder, onDelete, onEdit }: BrandListProps) {
  const [localBrands, setLocalBrands] = useState<CarBrand[]>(brands);

  // Sync local state when brands prop changes
  React.useEffect(() => {
    setLocalBrands(brands);
  }, [brands]);

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
      const oldIndex = localBrands.findIndex((brand) => brand.id === active.id);
      const newIndex = localBrands.findIndex((brand) => brand.id === over.id);

      const reorderedBrands = arrayMove(localBrands, oldIndex, newIndex);
      setLocalBrands(reorderedBrands);
      onReorder(reorderedBrands.map(brand => brand.id));
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[#002ec1]">الماركات</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#002ec1] text-white text-[12px] font-medium rounded-full hover:bg-blue-700 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          اضافة ماركة
        </button>
      </div>

      {/* Brands List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localBrands.map(brand => brand.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar">
            {localBrands.length === 0 ? (
              <div className="text-center py-8 text-[14px] text-[#8286ab]">
                لا توجد ماركات
              </div>
            ) : (
              localBrands.map((brand) => (
                <SortableBrandItem
                  key={brand.id}
                  brand={brand}
                  isSelected={selectedId === brand.id}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}