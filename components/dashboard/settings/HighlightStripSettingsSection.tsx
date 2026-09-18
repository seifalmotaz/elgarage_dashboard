"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ContentCard } from "@/components/dashboard/layout/ContentCard";
import { LoadingState } from "@/components/dashboard/states/LoadingState";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import IconUploader from "@/components/dashboard/cars/dialogs/IconUploader";
import { useHighlightStrip } from "@/hooks/queries/useHighlightStrip";
import { useCarSpecs } from "@/hooks/queries/useCars";
import { useUpsertSettingMutation } from "@/hooks/mutations/useSettings";
import type {
  HighlightStripItem,
  HighlightStripSource,
} from "@/lib/api/settings";

const HIDDEN_SPEC_KEYS = new Set(["status", "category"]);
const CAR_FIELDS = [
  { key: "year", label: "السنة" },
  { key: "mileage", label: "الكيلومترات" },
  { key: "address", label: "الموقع" },
  { key: "trim", label: "الفئة" },
] as const;

function keepKnownSpecSlots(
  slots: HighlightStripItem[],
  specTypes: { key: string }[],
): HighlightStripItem[] {
  const known = new Set(specTypes.map((type) => type.key));
  return slots.filter((item) => item.source !== "spec" || known.has(item.key));
}

const PREVIEW_VALUES: Record<string, string> = {
  year: "2022",
  mileage: "50,000 كم",
  address: "القاهرة",
  trim: "Highline",
  fuel: "بنزين",
  transmission: "أوتوماتيك",
};

function newSlotId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `slot-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function HighlightStripSettingsSection() {
  const { data, isLoading, isError, refetch } = useHighlightStrip();
  const {
    data: specTypes = [],
    isLoading: specsLoading,
    isError: specsError,
    refetch: refetchSpecs,
  } = useCarSpecs();
  const saveMutation = useUpsertSettingMutation();

  const [items, setItems] = useState<HighlightStripItem[]>([]);
  const [original, setOriginal] = useState<HighlightStripItem[]>([]);
  const hydrated = useRef(false);
  const [addSource, setAddSource] = useState<HighlightStripSource>("spec");
  const [addKey, setAddKey] = useState("");

  useEffect(() => {
    if (!data?.items || hydrated.current || specsLoading) return;
    hydrated.current = true;
    const filtered = keepKnownSpecSlots(data.items, specTypes);
    setItems(filtered);
    setOriginal(filtered);
  }, [data, specTypes, specsLoading]);

  const droppedSpecKeys = useMemo(() => {
    if (!data?.items || specsLoading) return [];
    const known = new Set(specTypes.map((type) => type.key));
    return [
      ...new Set(
        data.items
          .filter((item) => item.source === "spec" && !known.has(item.key))
          .map((item) => item.key),
      ),
    ];
  }, [data, specTypes, specsLoading]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const usedSpecKeys = new Set(
    items.filter((item) => item.source === "spec").map((item) => item.key),
  );
  const usedFieldKeys = new Set(
    items.filter((item) => item.source === "car_field").map((item) => item.key),
  );

  const specOptions = specTypes
    .filter((type) => type.isActive && !HIDDEN_SPEC_KEYS.has(type.key) && !usedSpecKeys.has(type.key))
    .map((type) => ({ value: type.key, label: `${type.name} (${type.key})` }));

  const fieldOptions = CAR_FIELDS.filter((field) => !usedFieldKeys.has(field.key)).map(
    (field) => ({ value: field.key, label: field.label }),
  );

  const addOptions = addSource === "spec" ? specOptions : fieldOptions;

  const hasChanges =
    JSON.stringify(items) !== JSON.stringify(original) || droppedSpecKeys.length > 0;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleAdd = () => {
    if (!addKey) return;
    const spec = specTypes.find((type) => type.key === addKey);
    const field = CAR_FIELDS.find((item) => item.key === addKey);
    const next: HighlightStripItem = {
      id: newSlotId(),
      source: addSource,
      key: addKey,
      enabled: true,
      iconUrl: addSource === "spec" ? spec?.iconUrl ?? null : null,
      name: addSource === "spec" ? spec?.name ?? addKey : field?.label ?? addKey,
      nameEn: addSource === "spec" ? spec?.nameEn ?? null : addKey,
    };
    setItems((prev) => [...prev, next]);
    setAddKey("");
  };

  const handleSave = () => {
    const persistable = keepKnownSpecSlots(items, specTypes);
    saveMutation.mutate(
      {
        key: "car_highlight_strip",
        data: {
          key: "car_highlight_strip",
          category: "cars",
          description: "Ordered chips under the car name",
          value: JSON.stringify({
            items: persistable.map(({ id, source, key, enabled, iconUrl }) => ({
              id,
              source,
              key,
              enabled,
              ...(source === "car_field" ? { iconUrl } : {}),
            })),
          }),
        },
      },
      {
        onSuccess: () => {
          setItems(persistable);
          setOriginal(persistable);
        },
      },
    );
  };

  const previewItems = useMemo(
    () =>
      items
        .filter((item) => item.enabled)
        .map((item) => ({
          ...item,
          preview: PREVIEW_VALUES[item.key] || item.name,
        })),
    [items],
  );

  if (isLoading || specsLoading) {
    return <LoadingState type="card" count={1} />;
  }

  if (isError || specsError) {
    return (
      <ContentCard title="الشريط تحت اسم السيارة">
        <p className="text-[14px] text-[#8286ab]">فشل تحميل إعداد الشريط</p>
        <Button
          variant="outline"
          onClick={() => {
            void refetch();
            void refetchSpecs();
          }}
        >
          إعادة المحاولة
        </Button>
      </ContentCard>
    );
  }

  return (
    <ContentCard title="الشريط تحت اسم السيارة">
      <div className="flex flex-col gap-6">
        <p className="text-[13px] text-[#6B7280] text-right">
          اختر المواصفات والبيانات الأساسية التي تظهر تحت اسم السيارة في الموقع والتطبيق ولوحة التحكم. نفس القائمة لكل السيارات.
        </p>

        {droppedSpecKeys.length > 0 ? (
          <p className="text-[13px] text-[#b45309] text-right bg-[#fffbeb] rounded-[12px] px-3 py-2">
            تم تجاهل مواصفات غير موجودة في إدارة المواصفات: {droppedSpecKeys.join("، ")}. أضفها من المواصفات أو احفظ الشريط بالقائمة الحالية.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 px-1 py-3 border border-[#f2f2f2] rounded-[16px]">
          {previewItems.map((item) => (
            <div key={item.id} className="flex items-center gap-1 text-[#6b7280] text-[14px]">
              {item.iconUrl ? (
                <img src={item.iconUrl} alt="" width={20} height={20} className="w-5 h-5 object-contain" />
              ) : (
                <span className="w-5 h-5 rounded-full bg-[#f2f2f2]" />
              )}
              <span>{item.preview}</span>
            </div>
          ))}
          {previewItems.length === 0 ? (
            <span className="text-[13px] text-[#9ca3af]">لا توجد عناصر ظاهرة</span>
          ) : null}
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <SortableSlot
                  key={item.id}
                  item={item}
                  onChange={(patch) =>
                    setItems((prev) =>
                      prev.map((row) => (row.id === item.id ? { ...row, ...patch } : row)),
                    )
                  }
                  onRemove={() => setItems((prev) => prev.filter((row) => row.id !== item.id))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
          <div className="flex-1">
            <Select
              label="نوع العنصر"
              value={addSource}
              options={[
                { label: "مواصفة", value: "spec" },
                { label: "بيان أساسي", value: "car_field" },
              ]}
              onChange={(value) => {
                setAddSource(value as HighlightStripSource);
                setAddKey("");
              }}
            />
          </div>
          <div className="flex-1">
            <Select
              label="العنصر"
              value={addKey}
              options={addOptions}
              onChange={setAddKey}
              placeholder="اختر"
            />
          </div>
          <Button variant="outline" onClick={handleAdd} disabled={!addKey}>
            إضافة
          </Button>
        </div>

        <div className="flex items-center justify-end gap-4 pt-2">
          <Button
            variant="outline"
            onClick={() => setItems(original)}
            disabled={
              JSON.stringify(items) === JSON.stringify(original) || saveMutation.isPending
            }
            className="!text-red-500 !border-red-200 hover:!bg-red-50"
          >
            إلغاء
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending || items.length === 0}
            loading={saveMutation.isPending}
          >
            حفظ الشريط
          </Button>
        </div>
      </div>
    </ContentCard>
  );
}

function SortableSlot({
  item,
  onChange,
  onRemove,
}: {
  item: HighlightStripItem;
  onChange: (patch: Partial<HighlightStripItem>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      className="flex flex-col gap-3 p-4 rounded-[16px] border border-[#f2f2f2] bg-white"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="text-[#9ca3af] cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </button>
          {item.iconUrl ? (
            <img src={item.iconUrl} alt="" width={24} height={24} className="w-6 h-6 object-contain" />
          ) : (
            <span className="w-6 h-6 rounded bg-[#f2f2f2]" />
          )}
          <div className="min-w-0 text-right">
            <p className="text-[14px] font-medium text-[#1a1a1a] truncate">{item.name}</p>
            <p className="text-[11px] text-[#8286ab] font-mono">{item.key}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="flex items-center gap-1 text-[12px] text-[#4b5563]">
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) => onChange({ enabled: e.target.checked })}
            />
            ظاهر
          </label>
          <button
            type="button"
            onClick={onRemove}
            className="text-[12px] text-red-500 hover:bg-red-50 rounded-full px-2 py-1"
          >
            حذف
          </button>
        </div>
      </div>
      {item.source === "car_field" ? (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] text-[#6b7280]">شعار البيان الأساسي</span>
          <IconUploader
            currentIcon={item.iconUrl}
            onUpload={(url) => onChange({ iconUrl: url })}
            onRemove={() => onChange({ iconUrl: null })}
            acceptedFormats={["image/svg+xml", "image/png", "image/jpeg", "image/webp"]}
          />
        </div>
      ) : (
        <p className="text-[12px] text-[#9ca3af]">
          شعار المواصفة يُعدَّل من إدارة المواصفات.
        </p>
      )}
    </div>
  );
}
