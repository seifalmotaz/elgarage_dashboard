import { cn } from "@/lib/utils";

interface ViewToggleProps {
  value: 'grid' | 'table';
  onChange: (value: 'grid' | 'table') => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex flex-col gap-[4px] shrink-0">
      <label className="text-[14px] text-[#1a1a1a] font-normal text-right w-full">
        طريقة العرض
      </label>
      <div className="bg-white h-[48px] w-[100px] rounded-[12px] flex items-center justify-center p-[4px] border border-[#f2f2f2] gap-[4px]">
        <button
          onClick={() => onChange('grid')}
          className={cn(
            "w-[40px] h-[40px] rounded-[10px] flex items-center justify-center transition-all",
            value === 'grid'
              ? "bg-[#f9fafb] border border-[#e5e7eb]"
              : "hover:bg-gray-50"
          )}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M18.3333 7.09984V3.3165C18.3333 2.1415 17.8 1.6665 16.475 1.6665H13.1083C11.7833 1.6665 11.25 2.1415 11.25 3.3165V7.0915C11.25 8.27484 11.7833 8.7415 13.1083 8.7415H16.475C17.8 8.74984 18.3333 8.27484 18.3333 7.09984Z" stroke="#0C0507" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.3333 16.475V13.1083C18.3333 11.7833 17.8 11.25 16.475 11.25H13.1083C11.7833 11.25 11.25 11.7833 11.25 13.1083V16.475C11.25 17.8 11.7833 18.3333 13.1083 18.3333H16.475C17.8 18.3333 18.3333 17.8 18.3333 16.475Z" stroke="#0C0507" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.7513 7.09984V3.3165C8.7513 2.1415 8.21797 1.6665 6.89297 1.6665H3.5263C2.2013 1.6665 1.66797 2.1415 1.66797 3.3165V7.0915C1.66797 8.27484 2.2013 8.7415 3.5263 8.7415H6.89297C8.21797 8.74984 8.7513 8.27484 8.7513 7.09984Z" stroke="#0C0507" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.7513 16.475V13.1083C8.7513 11.7833 8.21797 11.25 6.89297 11.25H3.5263C2.2013 11.25 1.66797 11.7833 1.66797 13.1083V16.475C1.66797 17.8 2.2013 18.3333 3.5263 18.3333H6.89297C8.21797 18.3333 8.7513 17.8 8.7513 16.475Z" stroke="#0C0507" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={() => onChange('table')}
          className={cn(
            "w-[40px] h-[40px] rounded-[10px] flex items-center justify-center transition-all",
            value === 'table'
              ? "bg-[#f9fafb] border border-[#e5e7eb]"
              : "hover:bg-gray-50"
          )}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5013 18.3332H12.5013C16.668 18.3332 18.3346 16.6665 18.3346 12.4998V7.49984C18.3346 3.33317 16.668 1.6665 12.5013 1.6665H7.5013C3.33464 1.6665 1.66797 3.33317 1.66797 7.49984V12.4998C1.66797 16.6665 3.33464 18.3332 7.5013 18.3332Z" stroke="#D1D5DB" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.3346 8.3335H1.66797" stroke="#D1D5DB" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 8.3335V18.3335" stroke="#D1D5DB" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}