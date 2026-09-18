"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { AuthGuard, useAuth } from "../../lib/components/AuthGuard";
import { Toaster } from "react-hot-toast";

const SIDEBAR_SECTIONS = [
  {
    title: "الرئيسية",
    items: [
      {
        label: "لوحة التحكم",
        icon: "/assets/dashboard/dashboard-active.svg",
        href: "/dashboard",
      },
    ],
  },
  {
    title: "الحسابات",
    items: [
      {
        label: "المستخدمين",
        icon: "/assets/dashboard/users.svg",
        href: "/dashboard/users",
      },
      {
        label: "التفاوضات",
        icon: "/assets/dashboard/negotiations.svg",
        href: "/dashboard/negotiations",
      },
      {
        label: "المفتشين",
        icon: "/assets/dashboard/inspectors.svg",
        href: "/dashboard/inspectors",
      },
    ],
  },
  {
    title: "السيارات و المعروضات",
    items: [
      {
        label: "طلبات البيع و الفحص",
        icon: "/assets/dashboard/sales-requests.svg",
        href: "/dashboard/sales-requests",
      },
      {
        label: "مواعيد الفحص",
        icon: "/assets/dashboard/calendar.svg",
        href: "/dashboard/availability",
      },
      {
        label: "السيارات",
        icon: "/assets/dashboard/cars.svg",
        href: "/dashboard/cars",
      },
    ],
  },
  {
    title: "المحتوى",
    items: [
      {
        label: "المقالات",
        icon: "/assets/dashboard/articles.svg",
        href: "/dashboard/articles",
      },
      {
        label: "آراء العملاء",
        icon: "/assets/dashboard/support.svg",
        href: "/dashboard/testimonials",
      },
      {
        label: "البانرات و الاعلانات",
        icon: "/assets/dashboard/marketing.svg",
        href: "/dashboard/marketing",
      },
    ],
  },
  {
    title: "النظام و الدعم",
    items: [
      {
        label: "الدعم",
        icon: "/assets/dashboard/support.svg",
        href: "/dashboard/support",
      },
      {
        label: "الاشعارات",
        icon: "/assets/dashboard/notifications.svg",
        href: "/dashboard/notifications",
      },
      {
        label: "رسائل التواصل",
        icon: "/assets/dashboard/support.svg",
        href: "/dashboard/contact-submissions",
      },
      {
        label: "الاسئلة الشائعة",
        icon: "/assets/dashboard/faq.svg",
        href: "/dashboard/faq",
      },
      {
        label: "عن جراج",
        icon: "/assets/dashboard/about.svg",
        href: "/dashboard/about",
      },
      {
        label: "الخصوصية و الشروط",
        icon: "/assets/dashboard/privacy.svg",
        href: "/dashboard/privacy",
      },
      {
        label: "الاعدادات",
        icon: "/assets/dashboard/settings.svg",
        href: "/dashboard/settings",
      },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getActiveItemAndSection = () => {
    for (const section of SIDEBAR_SECTIONS) {
      const item = section.items.find((i) => i.href === pathname);
      if (item) return { item, section };
    }
    for (const section of SIDEBAR_SECTIONS) {
      const item = section.items.find(
        (i) => i.href !== "/dashboard" && pathname.startsWith(i.href),
      );
      if (item) return { item, section };
    }
    return { item: null, section: null };
  };

  const { item: activeItem, section: activeSection } =
    getActiveItemAndSection();
  const isCreateArticle = pathname === "/dashboard/articles/create";

  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || "المستخدم";

  return (
    <AuthGuard>
      <div
        className="h-screen w-screen bg-[#06142d] flex overflow-hidden font-sans p-4 gap-4"
        dir="rtl"
      >
        {/* Sidebar - RIGHT in RTL (FIRST in DOM) */}
        <aside className="w-[264px] h-full flex flex-col pt-[16px] pb-4 shrink-0 z-20">
          {/* Logo Section (Mark on Right, Text on Left) */}
          <div className="flex items-center justify-center gap-[10px] mb-[32px] shrink-0">

            <div className="relative w-[116px] h-[15.4px]">
              <img
                src="/assets/logo-text.svg"
                alt="elGARAGE"
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>  <div className="relative w-[32px] h-[32px]">
              <img
                src="/assets/logo-mark.svg"
                alt="Logo Mark"
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto space-y-[24px] px-[12px] no-scrollbar">
            {SIDEBAR_SECTIONS.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-[8px]">
                <h3 className="text-[10px] font-light text-white/50 px-[16px] text-start">
                  {section.title}
                </h3>
                <div className="flex flex-col gap-[4px]">
                  {section.items.map((item, itemIdx) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(item.href));
                    return (
                      <Link
                        key={itemIdx}
                        href={item.href}
                        className={`flex items-center gap-[12px] h-[44px] px-[16px] py-[8px] rounded-[999px] transition-colors ${isActive ? "bg-[#2f71e3]" : "hover:bg-white/5"}`}
                      >
                        <div
                          className={`${isActive ? "bg-[#1851b4] w-[32px] h-[32px] rounded-[999px] flex items-center justify-center shrink-0" : "w-[20px] h-[20px] flex items-center justify-center shrink-0 relative"}`}
                        >
                          <img
                            src={item.icon}
                            alt={item.label}
                            width={isActive ? 16 : 20}
                            height={isActive ? 16 : 20}
                            className={!isActive ? "opacity-60" : ""}
                          />
                        </div>
                        <span
                          className={`text-[12px] whitespace-nowrap ${isActive ? "text-white font-medium" : "text-white/80 font-light"}`}
                        >
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Logout Section */}
          <div className="mt-4 pt-4 border-t border-white/10 px-[12px] shrink-0">
            <div className="flex flex-col gap-[4px]">
              <h3 className="text-[10px] text-white/50 px-[16px] font-light text-start">
                الخروج
              </h3>
              <button
                onClick={logout}
                className="flex items-center gap-[12px] h-[44px] px-[16px] py-[8px] rounded-[16px] hover:bg-white/5 transition-colors text-white text-[14px] font-light"
              >
                <img
                  src="/assets/dashboard/logout.svg"
                  alt="Logout"
                  width={20}
                  height={20}
                  className="opacity-60 shrink-0"
                />
                <span className="flex-1 text-start">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Container Card - LEFT in RTL (SECOND in DOM) */}
        <div className="flex-1 bg-[#f8fafc] rounded-[32px] flex flex-col overflow-hidden relative min-w-0">
          {/* Header */}
          <header className="h-[80px]  flex items-center justify-between px-[32px] shrink-0 z-10 w-full border-b border-[#E5E7EB]">
            {/* Breadcrumbs - RIGHT in RTL (FIRST in DOM) */}
            <div className="flex items-center gap-[8px]">
              <span className="text-[#8286ab] text-[14px] font-light">
                الرئيسية
              </span>
              <div className="opacity-40">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.49998 3C7.49998 3 4.50001 5.20947 4.5 6.00002C4.49999 6.79058 7.5 9 7.5 9" stroke="#111111" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

              </div>
              {pathname !== "/dashboard" && activeSection && (
                <>
                  <span className="text-[#8286ab] text-[14px] font-light">
                    {activeSection.title}
                  </span>
                  <div className="opacity-40">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.49998 3C7.49998 3 4.50001 5.20947 4.5 6.00002C4.49999 6.79058 7.5 9 7.5 9" stroke="#111111" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                  </div>
                </>
              )}
              <span className="text-[#111] text-[14px] font-semibold">
                {activeItem?.label || "لوحة التحكم"}
              </span>
            </div>
            {/* Search Bar - THIRD in DOM = LEFT in this group */}
            <div className="bg-white h-[48px] w-[580px] rounded-[999px] flex items-center px-[16px] border border-gray-50">
              <img
                src="/assets/dashboard/search-normal.svg"
                alt="Search"
                width={20}
                height={20}
                className="opacity-30"
              />
              <input
                type="text"
                placeholder="ابحث الان.."
                className="bg-transparent border-none outline-none flex-1 text-[14px] text-gray-700 placeholder-gray-400 h-full font-light px-3 text-start"
              />
            </div>
            {/* Actions - LEFT in RTL (SECOND in DOM) */}
            <div className="flex items-center gap-[16px]">

              {/* Notification - SECOND in DOM = MIDDLE */}
              <button className="bg-white w-[48px] h-[48px] rounded-full flex items-center justify-center relative border border-gray-100 hover:bg-gray-50 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 6.43994V9.76994" stroke="#6B7280" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                  <path d="M12.0189 2C8.33892 2 5.35892 4.98 5.35892 8.66V10.76C5.35892 11.44 5.07892 12.46 4.72892 13.04L3.45892 15.16C2.67892 16.47 3.21892 17.93 4.65892 18.41C9.43892 20 14.6089 20 19.3889 18.41C20.7389 17.96 21.3189 16.38 20.5889 15.16L19.3189 13.04C18.9689 12.46 18.6889 11.43 18.6889 10.76V8.66C18.6789 5 15.6789 2 12.0189 2Z" stroke="#6B7280" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                  <path d="M15.3319 18.8198C15.3319 20.6498 13.8319 22.1498 12.0019 22.1498C11.0919 22.1498 10.2519 21.7698 9.65187 21.1698C9.05187 20.5698 8.67188 19.7298 8.67188 18.8198" stroke="#6B7280" strokeWidth="1.5" strokeMiterlimit="10" />
                </svg>

                <div className="absolute top-[12px] left-[12px] w-[6.5px] h-[6.5px] bg-[#ef4444] rounded-full border border-white"></div>
              </button>

              {/* User Profile - FIRST in DOM = RIGHT in this group */}
              <button className="bg-white h-[48px] rounded-full flex items-center pr-[4px] pl-[16px] gap-[12px] border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="w-[40px] h-[40px] bg-[#ebf1ff] rounded-full flex items-center justify-center border-[0.5px] border-white overflow-hidden">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 0.266602C30.8984 0.266602 39.7334 9.10158 39.7334 20C39.7334 30.8984 30.8984 39.7334 20 39.7334C9.10158 39.7334 0.266602 30.8984 0.266602 20C0.266602 9.10158 9.10158 0.266602 20 0.266602Z" fill="#EBF1FF" />
                    <path d="M20 0.266602C30.8984 0.266602 39.7334 9.10158 39.7334 20C39.7334 30.8984 30.8984 39.7334 20 39.7334C9.10158 39.7334 0.266602 30.8984 0.266602 20C0.266602 9.10158 9.10158 0.266602 20 0.266602Z" stroke="white" strokeWidth="0.533333" />
                    <path d="M31.9939 30.5671C31.9939 34.6107 8.00391 34.6107 8.00391 30.5671C8.00391 26.5235 17.4705 24.9512 19.9988 24.9512C22.5273 24.9512 31.9939 26.5235 31.9939 30.5671Z" fill="#CFE1FF" />
                    <path d="M20.0002 27.0298C18.8264 27.0298 17.875 26.0782 17.875 24.9046V20.063H22.1254V24.9046C22.1254 26.0784 21.174 27.0298 20.0002 27.0298Z" fill="#A0C4FF" />
                    <path d="M22.125 23.6615V21.8081H17.875V23.6615C18.5315 23.9285 19.2502 24.075 20.001 24.075C20.7518 24.075 21.4685 23.9285 22.125 23.6615Z" fill="#80B1FF" />
                    <path d="M20 22.6988C16.8719 22.6988 14.3359 20.1629 14.3359 17.0347V12.5386C14.3359 9.41045 16.8719 6.87451 20 6.87451C23.1282 6.87451 25.6641 9.41045 25.6641 12.5386V17.0347C25.6641 20.1629 23.1282 22.6988 20 22.6988Z" fill="#A0C4FF" />
                    <path d="M13.7641 17.9559C14.6197 17.9559 15.3133 17.2623 15.3133 16.4066C15.3133 15.551 14.6197 14.8574 13.7641 14.8574C12.9085 14.8574 12.2148 15.551 12.2148 16.4066C12.2148 17.2623 12.9085 17.9559 13.7641 17.9559Z" fill="#A0C4FF" />
                    <path d="M12.659 16.5065C12.6036 16.5065 12.5586 16.4616 12.5586 16.4062C12.5586 15.7407 13.1 15.1992 13.7653 15.1992C13.8207 15.1992 13.8657 15.2442 13.8657 15.2996C13.8657 15.355 13.8207 15.4 13.7653 15.4C13.2106 15.4 12.7593 15.8513 12.7593 16.4062C12.7593 16.4616 12.7144 16.5065 12.659 16.5065Z" fill="#0E2443" />
                    <path d="M26.2367 17.9559C27.0923 17.9559 27.7859 17.2623 27.7859 16.4066C27.7859 15.551 27.0923 14.8574 26.2367 14.8574C25.3811 14.8574 24.6875 15.551 24.6875 16.4066C24.6875 17.2623 25.3811 17.9559 26.2367 17.9559Z" fill="#A0C4FF" />
                    <path d="M27.3435 16.5065C27.2881 16.5065 27.2431 16.4616 27.2431 16.4062C27.2431 15.8513 26.7918 15.4 26.2371 15.4C26.1817 15.4 26.1367 15.355 26.1367 15.2996C26.1367 15.2442 26.1817 15.1992 26.2371 15.1992C26.9024 15.1992 27.4438 15.7407 27.4438 16.4062C27.4438 16.4616 27.3989 16.5065 27.3435 16.5065Z" fill="#0E2443" />
                    <path d="M14.282 10.8885C12.379 14.6061 18.6277 13.0275 18.8275 10.6163C19.179 12.3102 21.5855 12.6794 21.929 10.7114C22.2823 13.379 26.1512 14.7918 26.0733 11.1127C26.1307 8.19877 23.2471 7.63384 22.4862 7.41703C20.6644 5.64195 13.0823 5.83648 14.282 10.8885Z" fill="#0E2443" />
                  </svg>


                </div>
                <div className="flex flex-col items-start justify-center">
                  <span className="text-[#242424] text-[12px] font-medium leading-none mb-1 text-start">
                    {userName}
                  </span>
                  <span className="text-[#8286ab] text-[10px] font-light leading-none text-start">
                    {user?.role === "ADMIN" ? "الادمين العام" : "مستخدم"}
                  </span>
                </div>
                <img
                  src="/assets/arrow-down.png"
                  alt="Arrow Down"
                  width={16}
                  height={16}
                  className="opacity-50"
                />
              </button>


            </div>
          </header>

          <div className="flex-1 overflow-y-auto no-scrollbar min-w-0">
            <div className="p-4 lg:p-6 min-w-0 w-full max-w-full">{children}</div>
          </div>
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#333",
              color: "#fff",
              fontFamily: "inherit",
              direction: "rtl",
              textAlign: "right",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </div>
    </AuthGuard>
  );
}
