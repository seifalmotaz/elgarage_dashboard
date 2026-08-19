import React from "react";
import Button from "../../ui/Button";

interface FilterBarProps {
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  // New props for filtering functionality
  activeTab?: 'all' | 'draft' | 'published' | 'rejected' | 'sold' | 'special';
  onTabChange?: (tab: 'all' | 'draft' | 'published' | 'rejected' | 'sold' | 'special') => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearch?: () => void;
}

export default function FilterBar({
  viewMode,
  onViewModeChange,
  activeTab = 'all',
  onTabChange,
  searchQuery = '',
  onSearchChange,
  onSearch,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Filter Tabs Row */}
      <div className="flex items-center justify-between w-full">
        {/* Right side (1st child in RTL): Tabs Container */}
        <div className="flex items-center gap-2 bg-white rounded-full p-[6px] border border-[#f2f2f2]">
          {/* Tab: الكل (All) */}
          <Button
            variant={activeTab === 'all' ? 'primary' : 'ghost'}
            size="md"
            className="gap-2 px-6"
            onClick={() => onTabChange?.('all')}
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.001 1.5415C14.6664 1.5415 18.4598 5.33414 18.46 9.99951C18.46 14.665 14.6665 18.4585 10.001 18.4585C5.3356 18.4583 1.54297 14.6649 1.54297 9.99951C1.54304 8.14167 2.13164 6.3804 3.24902 4.90088L3.25 4.90186C3.28805 4.85165 3.36522 4.83621 3.4248 4.88135C3.48454 4.92668 3.4907 5.00627 3.45312 5.05615C2.37064 6.48468 1.79304 8.19899 1.79297 9.99951C1.79297 14.5255 5.47498 18.2083 10.001 18.2085C14.5271 18.2085 18.21 14.5257 18.21 9.99951C18.2098 5.47352 14.527 1.7915 10.001 1.7915C9.97093 1.79142 9.93961 1.77897 9.91406 1.75342C9.88853 1.7278 9.87598 1.69659 9.87598 1.6665C9.87598 1.63642 9.88853 1.6052 9.91406 1.57959C9.93961 1.55404 9.97093 1.54159 10.001 1.5415Z" stroke="white" />
                <path d="M10.001 4.0415C13.2831 4.0415 15.9598 6.71747 15.96 9.99951C15.96 13.2817 13.2832 15.9585 10.001 15.9585C6.71893 15.9583 4.04297 13.2816 4.04297 9.99951C4.04306 9.96946 4.0555 9.93815 4.08105 9.9126C4.10667 9.88706 4.13789 9.87451 4.16797 9.87451C4.19805 9.87451 4.22927 9.88706 4.25488 9.9126C4.28043 9.93815 4.29288 9.96946 4.29297 9.99951C4.29297 13.1505 6.84998 15.7083 10.001 15.7085C13.1521 15.7085 15.71 13.1507 15.71 9.99951C15.7098 6.84852 13.152 4.2915 10.001 4.2915C9.97093 4.29142 9.93961 4.27897 9.91406 4.25342C9.88853 4.2278 9.87598 4.19659 9.87598 4.1665C9.87598 4.13642 9.88853 4.1052 9.91406 4.07959C9.93961 4.05404 9.97093 4.04159 10.001 4.0415Z" stroke="white" />
                <path d="M10 6.5415C11.9071 6.5415 13.4578 8.09247 13.458 9.99951C13.458 11.9067 11.9072 13.4585 10 13.4585C9.96992 13.4585 9.9387 13.4459 9.91309 13.4204C9.88753 13.3949 9.87509 13.3635 9.875 13.3335C9.875 13.3034 9.88755 13.2722 9.91309 13.2466C9.93873 13.2209 9.96985 13.2085 10 13.2085C11.7678 13.2085 13.208 11.7673 13.208 9.99951C13.2078 8.23185 11.7677 6.7915 10 6.7915C9.96985 6.7915 9.93873 6.77906 9.91309 6.75342C9.88744 6.72777 9.875 6.69665 9.875 6.6665C9.875 6.63636 9.88744 6.60523 9.91309 6.57959C9.93873 6.55395 9.96985 6.5415 10 6.5415Z" stroke="white" />
              </svg>

            }
            iconPosition="right"
          >
            الكل
          </Button>

          {/* Tab: قيد المراجعة (Draft) */}
          <Button
            variant={activeTab === 'draft' ? 'primary' : 'ghost'}
            size="md"
            className="group"
            onClick={() => onTabChange?.('draft')}
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.3346 9.99984C18.3346 14.5998 14.6013 18.3332 10.0013 18.3332C5.4013 18.3332 1.66797 14.5998 1.66797 9.99984C1.66797 5.39984 5.4013 1.6665 10.0013 1.6665C14.6013 1.6665 18.3346 5.39984 18.3346 9.99984Z" stroke="#6B7280" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.0914 12.65L10.5081 11.1083C10.0581 10.8416 9.69141 10.2 9.69141 9.67497V6.2583" stroke="#6B7280" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

            }
            iconPosition="right"
          >
            <span className="text-start">قيد المراجعة</span>
          </Button>

          {/* Tab: منشورة (Published) */}
          <Button
            variant={activeTab === 'published' ? 'primary' : 'ghost'}
            size="md"
            className="group"
            onClick={() => onTabChange?.('published')}
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.0013 18.3332C14.5846 18.3332 18.3346 14.5832 18.3346 9.99984C18.3346 5.4165 14.5846 1.6665 10.0013 1.6665C5.41797 1.6665 1.66797 5.4165 1.66797 9.99984C1.66797 14.5832 5.41797 18.3332 10.0013 18.3332Z" stroke="#6B7280" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.45703 9.99993L8.81536 12.3583L13.5404 7.6416" stroke="#6B7280" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

            }
            iconPosition="right"
          >
            <span className="text-start">منشورة</span>
          </Button>

          {/* Tab: مرفوضة (Rejected) */}
          <Button
            variant={activeTab === 'rejected' ? 'primary' : 'ghost'}
            size="md"
            className="group"
            onClick={() => onTabChange?.('rejected')}
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.0013 18.3332C14.5846 18.3332 18.3346 14.5832 18.3346 9.99984C18.3346 5.4165 14.5846 1.6665 10.0013 1.6665C5.41797 1.6665 1.66797 5.4165 1.66797 9.99984C1.66797 14.5832 5.41797 18.3332 10.0013 18.3332Z" stroke="#6B7280" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7.64062 12.3583L12.3573 7.6416" stroke="#6B7280" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12.3573 12.3583L7.64062 7.6416" stroke="#6B7280" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

            }
            iconPosition="right"
          >
            <span className="text-start">مرفوضة</span>
          </Button>

          {/* Tab: مباعة (Sold) */}
          <Button
            variant={activeTab === 'sold' ? 'primary' : 'ghost'}
            size="md"
            className="group"
            onClick={() => onTabChange?.('sold')}
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.67063 12.9386L7.44563 16.7136C8.99563 18.2636 11.5123 18.2636 13.0706 16.7136L16.729 13.0553C18.279 11.5053 18.279 8.98864 16.729 7.43031L12.9456 3.66364C12.154 2.87197 11.0623 2.44697 9.94563 2.50531L5.77896 2.70531C4.1123 2.78031 2.7873 4.10531 2.70396 5.76364L2.50396 9.93031C2.45396 11.0553 2.87896 12.147 3.67063 12.9386Z" stroke="#6B7280" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.11068 10.1886C9.26127 10.1886 10.194 9.2559 10.194 8.10531C10.194 6.95471 9.26127 6.02197 8.11068 6.02197C6.96008 6.02197 6.02734 6.95471 6.02734 8.10531C6.02734 9.2559 6.96008 10.1886 8.11068 10.1886Z" stroke="#6B7280" strokeWidth="1.25" strokeLinecap="round" />
                <path d="M11.0273 14.3553L14.3607 11.022" stroke="#6B7280" strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

            }
            iconPosition="right"
          >
            <span className="text-start">مباعة</span>
          </Button>

          {/* Tab: مميزة (Special/Featured) */}
          <Button
            variant={activeTab === 'special' ? 'primary' : 'ghost'}
            size="md"
            className="group"
            onClick={() => onTabChange?.('special')}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill={activeTab === 'special' ? '#FFD700' : 'none'} stroke={activeTab === 'special' ? '#FFD700' : '#6B7280'} strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
            iconPosition="right"
          >
            <span className="text-start">مميزة</span>
          </Button>
        </div>

        {/* Left side (2nd child in RTL): Inspectors Button */}
        <Button
          variant="secondary"
          size="md"
          className="h-[48px] px-5"
          icon={
            <img
              src="/assets/dashboard/cards/profile.svg"
              alt="Inspectors"
              width={20}
              height={20}
              className="opacity-70"
            />
          }
          iconPosition="right"
        >
          <span className="text-start">المفتشين</span>
        </Button>
      </div>

      {/* Main Filter Inputs Row */}
      <div className="flex items-end gap-4 w-full">
        {/* View Toggle (Far Right in RTL - 1st child) */}
        <div className="flex flex-col gap-2 shrink-0">
          <label className="text-[14px] text-[#1a1a1a] font-normal px-1 text-start">
            طريقة العرض
          </label>
          <div className="bg-white p-1 rounded-[12px] border border-[#f2f2f2] flex items-center gap-1 h-[50px]">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`w-10 h-10 flex items-center justify-center rounded-[8px] transition-colors ${viewMode === "grid" ? "bg-[#f9fafb] border border-[#e5e7eb]" : "hover:bg-gray-50"}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.3333 7.09984V3.3165C18.3333 2.1415 17.8 1.6665 16.475 1.6665H13.1083C11.7833 1.6665 11.25 2.1415 11.25 3.3165V7.0915C11.25 8.27484 11.7833 8.7415 13.1083 8.7415H16.475C17.8 8.74984 18.3333 8.27484 18.3333 7.09984Z" stroke="#0C0507" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.3333 16.475V13.1083C18.3333 11.7833 17.8 11.25 16.475 11.25H13.1083C11.7833 11.25 11.25 11.7833 11.25 13.1083V16.475C11.25 17.8 11.7833 18.3333 13.1083 18.3333H16.475C17.8 18.3333 18.3333 17.8 18.3333 16.475Z" stroke="#0C0507" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.7513 7.09984V3.3165C8.7513 2.1415 8.21797 1.6665 6.89297 1.6665H3.5263C2.2013 1.6665 1.66797 2.1415 1.66797 3.3165V7.0915C1.66797 8.27484 2.2013 8.7415 3.5263 8.7415H6.89297C8.21797 8.74984 8.7513 8.27484 8.7513 7.09984Z" stroke="#0C0507" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.7513 16.475V13.1083C8.7513 11.7833 8.21797 11.25 6.89297 11.25H3.5263C2.2013 11.25 1.66797 11.7833 1.66797 13.1083V16.475C1.66797 17.8 2.2013 18.3333 3.5263 18.3333H6.89297C8.21797 18.3333 8.7513 17.8 8.7513 16.475Z" stroke="#0C0507" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={`w-10 h-10 flex items-center justify-center rounded-[8px] transition-colors ${viewMode === "table" ? "bg-[#f9fafb] border border-[#e5e7eb]" : "hover:bg-gray-50"}`}
            >

              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5013 18.3332H12.5013C16.668 18.3332 18.3346 16.6665 18.3346 12.4998V7.49984C18.3346 3.33317 16.668 1.6665 12.5013 1.6665H7.5013C3.33464 1.6665 1.66797 3.33317 1.66797 7.49984V12.4998C1.66797 16.6665 3.33464 18.3332 7.5013 18.3332Z" stroke="#D1D5DB" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.3346 8.3335H1.66797" stroke="#D1D5DB" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 8.3335V18.3335" stroke="#D1D5DB" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-2 w-[250px] shrink-0">
          <label className="text-[14px] text-[#1a1a1a] font-normal px-1 text-start">
            الحالة
          </label>
          <div className="bg-white h-[50px] rounded-full flex items-center justify-between px-4 border border-[#f2f2f2] cursor-pointer hover:border-blue-400 transition-colors">
            <span className="text-[12px] text-[#1a1a1a] font-light text-start">
              الكل
            </span>
            <img
              src="/assets/arrow-down.png"
              alt="Arrow"
              width={16}
              height={16}
              className="opacity-40"
            />
          </div>
        </div>

        {/* Price Filter */}
        <div className="flex flex-col gap-2 w-[250px] shrink-0">
          <label className="text-[14px] text-[#1a1a1a] font-normal px-1 text-start">
            السعر
          </label>
          <div className="bg-white h-[50px] rounded-full flex items-center justify-between px-4 border border-[#f2f2f2] cursor-pointer hover:border-blue-400 transition-colors">
            <span className="text-[12px] text-[#1a1a1a] font-light text-start">
              الكل
            </span>
            <img
              src="/assets/arrow-down.png"
              alt="Arrow"
              width={16}
              height={16}
              className="opacity-40"
            />
          </div>
        </div>

        {/* Search Input (Flex 1 to take remaining space - appears on the LEFT in RTL as the last child) */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-[14px] text-[#1a1a1a] font-normal px-1 text-start">
            البحث
          </label>
          <div className="bg-white h-[50px] rounded-full flex items-center p-[4px] border border-[#f2f2f2] focus-within:border-blue-400 transition-colors gap-3 relative">
            <input
              type="text"
              placeholder="ابحث الآن.."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearch?.();
                }
              }}
              className="bg-transparent border-none outline-none flex-1 text-[14px] text-gray-700 placeholder-[#d1d5db] h-full px-4 text-start pr-[40px]"
            />
            {/* Search Icon inside the input */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <img
                src="/assets/dashboard/search.svg"
                alt="Search"
                width={20}
                height={20}
                className="opacity-30"
              />
            </div>

            {/* Search Button (Last child in this absolute container wrapper) */}
            <Button
              variant="outline"
              size="md"
              className="h-[42px] px-8 font-semibold"
              onClick={() => onSearch?.()}
            >
              بحث
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
