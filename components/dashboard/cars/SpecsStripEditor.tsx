"use client";

import { useMemo, useState, type ReactNode } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import CitySelect from "@/components/dashboard/CitySelect";
import { useCarSpecs } from "@/hooks/queries/useCars";
import { useUpdateCarMutation } from "@/hooks/mutations/useCars";
import type { Car, SpecType } from "@/lib/api/types";

const HIDDEN_SPEC_KEYS = new Set(["status", "category"]);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SpecDraft = {
  specKeyId: string;
  value: string;
};

type SpecsStripEditorProps = {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
};

function isHiddenSpec(spec: SpecType) {
  return HIDDEN_SPEC_KEYS.has(spec.key);
}

export default function SpecsStripEditor({
  car,
  isOpen,
  onClose,
}: SpecsStripEditorProps) {
  const { data: specTypes = [] } = useCarSpecs();
  const updateCar = useUpdateCarMutation();

  const visibleTypes = useMemo(
    () => specTypes.filter((type) => type.isActive && !isHiddenSpec(type)),
    [specTypes],
  );

  const [year, setYear] = useState(String(car.year));
  const [mileage, setMileage] = useState(String(car.mileage));
  const [address, setAddress] = useState(car.address || "");
  const [trim, setTrim] = useState(car.trim || "");
  const [specs, setSpecs] = useState<SpecDraft[]>(() =>
    car.specifications
      .filter((spec) => spec.specKey && !HIDDEN_SPEC_KEYS.has(spec.specKey.key))
      .map((spec) => ({
        specKeyId: spec.specKeyId,
        value: spec.optionId || spec.value || "",
      })),
  );

  const usedTypeIds = new Set(specs.map((spec) => spec.specKeyId));
  const addableTypes = visibleTypes.filter((type) => !usedTypeIds.has(type.id));

  const typeById = useMemo(() => {
    const map = new Map<string, SpecType>();
    for (const type of visibleTypes) map.set(type.id, type);
    return map;
  }, [visibleTypes]);

  const updateSpec = (index: number, patch: Partial<SpecDraft>) => {
    setSpecs((prev) =>
      prev.map((spec, i) => (i === index ? { ...spec, ...patch } : spec)),
    );
  };

  const removeSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const addSpec = (specKeyId: string) => {
    if (!specKeyId) return;
    setSpecs((prev) => [...prev, { specKeyId, value: "" }]);
  };

  const handleSave = () => {
    const yearNum = Number(year);
    const mileageNum = Number(mileage);
    if (!Number.isFinite(yearNum) || yearNum < 1990) return;
    if (!Number.isFinite(mileageNum) || mileageNum < 0) return;

    updateCar.mutate(
      {
        id: car.id,
        data: {
          year: yearNum,
          mileage: mileageNum,
          address: address || undefined,
          trim: trim || undefined,
          specifications: specs
            .filter((spec) => spec.specKeyId && spec.value)
            .map((spec) => {
              const isOption = UUID_RE.test(spec.value);
              return {
                specKeyId: spec.specKeyId,
                optionId: isOption ? spec.value : undefined,
                value: isOption ? undefined : spec.value,
              };
            }),
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل شريط المواصفات"
      maxWidth="720px"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} type="button">
            إلغاء
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={updateCar.isPending}
            type="button"
          >
            حفظ التغييرات
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="سنة الصنع">
            <input
              type="number"
              min={1990}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 text-[13px] outline-none focus:border-[#002ec1] w-full"
            />
          </Field>
          <Field label="الكيلومترات">
            <input
              type="number"
              min={0}
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 text-[13px] outline-none focus:border-[#002ec1] w-full"
            />
          </Field>
          <CitySelect
            label="المدينة"
            optional
            value={address}
            onChange={setAddress}
            placeholder="اختر المدينة"
          />
          <Field label="الفئة / التريم">
            <input
              type="text"
              value={trim}
              onChange={(e) => setTrim(e.target.value)}
              placeholder="مثال: SE"
              className="bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 text-[13px] outline-none focus:border-[#002ec1] w-full"
            />
          </Field>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#1a1a1a]">
              المواصفات في الشريط
            </p>
            {addableTypes.length > 0 ? (
              <Select
                value=""
                placeholder="إضافة مواصفة"
                options={addableTypes.map((type) => ({
                  label: type.name,
                  value: type.id,
                }))}
                onChange={addSpec}
                className="w-[220px]"
              />
            ) : null}
          </div>

          {specs.length === 0 ? (
            <p className="text-[13px] text-[#9ca3af] bg-[#fafafa] rounded-[16px] px-4 py-6 text-center">
              لا توجد مواصفات إضافية. اختر مواصفة من القائمة لإضافتها.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {specs.map((spec, index) => {
                const type = typeById.get(spec.specKeyId);
                return (
                  <div
                    key={`${spec.specKeyId}-${index}`}
                    className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end"
                  >
                    <Select
                      label="المواصفة"
                      value={spec.specKeyId}
                      options={visibleTypes
                        .filter(
                          (item) =>
                            item.id === spec.specKeyId ||
                            !usedTypeIds.has(item.id),
                        )
                        .map((item) => ({
                          label: item.name,
                          value: item.id,
                        }))}
                      onChange={(specKeyId) =>
                        updateSpec(index, { specKeyId, value: "" })
                      }
                    />
                    {type?.fieldType === "DROPDOWN" || !type?.fieldType ? (
                      <Select
                        label="القيمة"
                        value={spec.value}
                        placeholder="اختر القيمة"
                        options={(type?.options ?? []).map((option) => ({
                          label: option.label,
                          value: option.id,
                        }))}
                        onChange={(value) => updateSpec(index, { value })}
                      />
                    ) : (
                      <Field label="القيمة">
                        <input
                          type={type.fieldType === "NUMBER" ? "number" : "text"}
                          value={spec.value}
                          onChange={(e) =>
                            updateSpec(index, { value: e.target.value })
                          }
                          className="bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 text-[13px] outline-none focus:border-[#002ec1] w-full"
                        />
                      </Field>
                    )}
                    <button
                      type="button"
                      onClick={() => removeSpec(index)}
                      className="h-[50px] w-[50px] rounded-[16px] border border-[#f2f2f2] text-[#ef4444] hover:bg-red-50 transition-colors"
                      aria-label="حذف المواصفة"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[14px] text-[#1a1a1a] text-start font-medium leading-[1.5]">
        {label}
      </label>
      {children}
    </div>
  );
}
