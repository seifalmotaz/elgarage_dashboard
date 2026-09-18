import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  showButton?: boolean;
  buttonText?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "ابحث الان..",
  showButton = false,
  buttonText = "بحث"
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-[8px] flex-1">
      <label className="text-[14px] text-[#1A1A1A] font-normal text-start">
        البحث
      </label>
      <div className="flex gap-[12px]">
        <div className="flex-1 bg-white border border-[#f2f2f2] rounded-[16px] h-[48px] px-[16px] flex items-center gap-[12px]">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-[14px] text-[#1a1a1a] placeholder-[#D1D5DB] h-full font-light text-start"
          />
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M17.5 17.5L14.1667 14.1667M16.25 9.16667C16.25 13.0287 13.0287 16.25 9.16667 16.25C5.30464 16.25 2.08333 13.0287 2.08333 9.16667C2.08333 5.30464 5.30464 2.08333 9.16667 2.08333C13.0287 2.08333 16.25 5.30464 16.25 9.16667Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {showButton && (
          <button
            onClick={onSearch}
            className="bg-white border border-[#f2f2f2] h-[48px] px-[24px] rounded-[999px] text-[#002ec1] text-[14px] font-semibold hover:bg-gray-50 transition-all shrink-0"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}