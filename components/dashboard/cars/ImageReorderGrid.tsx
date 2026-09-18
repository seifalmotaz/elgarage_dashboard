'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageReorderGridProps {
  images: string[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (index: number) => void;
  readOnly?: boolean;
}

interface ImageSlot {
  id: string;
  url: string;
}

function slotsFromUrls(urls: string[]): ImageSlot[] {
  return urls.map((url, index) => ({ id: `img-${index}-${url}`, url }));
}

function ImageCard({
  url,
  index,
  isMain,
  isDragging,
}: {
  url: string;
  index: number;
  isMain: boolean;
  isDragging?: boolean;
}) {
  return (
    <div
      className={`
        relative aspect-[4/3] rounded-[12px] overflow-hidden bg-gray-100
        ${isDragging ? 'shadow-2xl ring-2 ring-[#002ec1]' : 'shadow-sm'}
      `}
    >
      <img
        src={url || ''}
        alt={`صورة ${index + 1}`}
        className="w-full h-full object-cover pointer-events-none"
      />
      {isMain && (
        <div className="absolute top-2 right-2 bg-[#002ec1] text-white text-[10px] px-2 py-1 rounded-[8px] font-medium">
          الصورة الرئيسية
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-[8px]">
        {index + 1}
      </div>
    </div>
  );
}

function SortableImage({
  slot,
  index,
  isMain,
  onRemove,
  readOnly,
}: {
  slot: ImageSlot;
  index: number;
  isMain: boolean;
  onRemove: () => void;
  readOnly?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slot.id, disabled: readOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className={readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing touch-none'}
      >
        <ImageCard url={slot.url} index={index} isMain={isMain} />
        {!isDragging && !readOnly && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none rounded-[12px]">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="drop-shadow-lg">
                <path d="M8 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8-16a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {!readOnly && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full items-center justify-center transition-colors shadow-lg z-10 hidden group-hover:flex"
          title="حذف الصورة"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function ImageReorderGrid({
  images,
  onReorder,
  onRemove,
  readOnly = false,
}: ImageReorderGridProps) {
  const [items, setItems] = useState<ImageSlot[]>(() => slotsFromUrls(images));
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setItems((prev) => {
      if (
        prev.length === images.length &&
        prev.every((item, index) => item.url === images[index])
      ) {
        return prev;
      }
      return slotsFromUrls(images);
    });
  }, [images]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    setItems((current) => arrayMove(current, oldIndex, newIndex));
    onReorder(oldIndex, newIndex);
  };

  const activeItem = activeId
    ? items.find((item) => item.id === activeId)
    : undefined;
  const activeIndex = activeItem
    ? items.findIndex((item) => item.id === activeItem.id)
    : -1;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-[14px]">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        لا توجد صور
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[14px] font-medium text-[#1a1a1a]">الصور ({items.length})</h3>
        {!readOnly && (
          <p className="text-[12px] text-gray-500">
            اسحب الصور لإعادة ترتيبها
          </p>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((slot, index) => (
              <SortableImage
                key={slot.id}
                slot={slot}
                index={index}
                isMain={index === 0}
                onRemove={() => onRemove(index)}
                readOnly={readOnly}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeItem ? (
            <div className="w-[160px]">
              <ImageCard
                url={activeItem.url}
                index={activeIndex}
                isMain={activeIndex === 0}
                isDragging
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {items.length > 1 && !readOnly && (
        <p className="mt-2 text-[11px] text-gray-400 text-center">
          الصورة الأولى ستكون الصورة الرئيسية للإعلان
        </p>
      )}
    </div>
  );
}
