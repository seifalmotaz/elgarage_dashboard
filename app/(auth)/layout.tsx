export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="h-screen w-screen bg-[#f8fafc] flex items-center justify-center p-3 lg:p-5 overflow-hidden font-sans"
      dir="rtl"
    >
      {/* Main Container */}
      <div className="w-full h-full flex flex-col lg:flex-row gap-3 lg:gap-5 max-w-[1720px]">
        {/* RIGHT PANEL: Hero Image (Shared across all auth pages) */}
        <div className="flex-[1.25] relative h-full overflow-hidden rounded-[32px] shadow-sm order-1 lg:order-1">
          {/* Hero Background Image */}
          <img
            src="/assets/hero-bg.png"
            alt="elGARAGE Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient Overlay as per Figma */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,8,32,0.5)] via-[rgba(0,19,81,0)] to-[rgba(0,8,32,0.5)] via-[47.681%]" />

          {/* Top Navigation Bar */}
          <div className="absolute top-[44px] left-0 right-0 px-8 lg:px-[44px] z-20 flex justify-between items-center">
            {/* Logo Group */}
            <div className="flex items-center gap-3">
              <div className="relative w-[159.5px] h-[21.2px]">
                <img
                  src="/assets/logo-text.svg"
                  alt="elGARAGE"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="relative w-[44px] h-[44px]">
                <img
                  src="/assets/logo-mark.svg"
                  alt="Logo Mark"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2 bg-white border border-[#e5e7eb] rounded-[56px] h-[50px] px-[24px] shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="w-6 h-6 rounded-full overflow-hidden relative border border-gray-100">
                <img
                  src="/assets/egypt-flag.svg"
                  alt="Egypt Flag"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[#6b7280] text-[16px] font-medium">
                العربية
              </span>
              <img
                src="/assets/arrow-down.png"
                alt="Arrow"
                width={20}
                height={20}
              />
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div className="absolute bottom-[44px] left-0 right-0 px-8 lg:px-[44px] z-20 flex flex-col md:flex-row justify-between items-center gap-4 text-white">
            {/* Copyright */}
            <p className="text-[12px] opacity-90">
              جميع الحقوق محفوظة لدى منصة elGARAGE
            </p>

            {/* Contact Info */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-black/10">
                  <img
                    src="/assets/mobile.svg"
                    alt="Mobile"
                    width={16}
                    height={16}
                  />
                </div>
                <span className="text-[14px]">19900</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-black/10">
                  <img
                    src="/assets/sms.svg"
                    alt="Email"
                    width={16}
                    height={16}
                  />
                </div>
                <span className="text-[14px]">info@elgarage.eg</span>
              </div>
            </div>
          </div>
        </div>

        {/* LEFT PANEL: Auth Content (Login, Forgot Password, etc.) */}
        <div className="w-full lg:w-[630px] h-full bg-[#06142d] rounded-[32px] shadow-sm flex flex-col items-center justify-center px-8 lg:px-[52px] py-16 order-2 lg:order-2 overflow-y-auto">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
