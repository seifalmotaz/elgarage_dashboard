"use client";

import { useMemo } from "react";
import Select from "@/components/ui/Select";
import { useEgyptCities } from "@/hooks/queries/useEgyptCities";
import { EGYPT_CITIES, matchStoredCity } from "@/lib/egypt-cities";

type CitySelectProps = {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  optional?: boolean;
  className?: string;
  error?: boolean;
};

export default function CitySelect({
  value,
  onChange,
  label = "المدينة",
  placeholder = "اختر المدينة",
  optional = false,
  className,
  error,
}: CitySelectProps) {
  const { data: cities = EGYPT_CITIES } = useEgyptCities();
  const resolved = matchStoredCity(value, cities);

  const options = useMemo(() => {
    const next = cities.map((city) => ({
      label: city.nameAr,
      value: city.nameAr,
    }));
    if (resolved && !next.some((option) => option.value === resolved)) {
      next.unshift({ label: resolved, value: resolved });
    }
    if (optional) {
      next.unshift({ label: "بدون تحديد", value: "" });
    }
    return next;
  }, [cities, optional, resolved]);

  return (
    <Select
      label={label}
      value={resolved}
      options={options}
      placeholder={placeholder}
      onChange={onChange}
      className={className}
      error={error}
    />
  );
}
