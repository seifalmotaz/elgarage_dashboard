'use client';

import React from 'react';
import { formatDate, formatTime } from '@/lib/utils/date';

export interface TimelineStep {
  key: string;
  label: string;
  icon: string;
  completed: boolean;
  date: string | null;
}

interface TimelineProps {
  steps: TimelineStep[];
}

export function Timeline({ steps }: TimelineProps) {
  return (
    <div className="bg-white rounded-[16px] px-4 py-5 flex flex-col gap-3 border border-[#F2F2F2]">
      <h3 className="text-[16px] font-semibold text-[#002EC1] text-right">سجل الطلب</h3>

      <div className="relative flex flex-col gap-0 w-full mt-2">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          return (
            <div key={step.key} className="relative flex items-start">
              <div className="flex flex-col items-center w-[52px] shrink-0 mt-6 relative">
                {!isLast && (
                  <div
                    className={`absolute top-5 bottom-[-24px] w-[2px] z-0 ${
                      step.completed && steps[idx + 1].completed
                        ? "bg-[#2F71E3]"
                        : "bg-[#F2F2F2]"
                    }`}
                  />
                )}
                <div className="z-10 bg-white">
                  {step.completed ? (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <circle cx="10" cy="10" r="10" fill="#002ec1" />
                        <path
                          d="M6 10L9 13L14 7"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#F2F2F2]" />
                    </div>
                  )}
                </div>
              </div>

              <div className={`flex-1 py-3 ${isLast ? "" : "mb-3"}`}>
                <div
                  className={`flex items-center justify-between p-5 rounded-[16px] border border-[#F2F2F2] bg-white ${
                    step.completed ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                      <img
                        src={step.icon}
                        alt=""
                        width={24}
                        height={24}
                        style={{ filter: "invert(13%) sepia(85%) saturate(5451%) hue-rotate(228deg) brightness(88%) contrast(106%)" }}
                      />
                    </div>
                    <div className="flex flex-col text-right flex-1">
                      <p className="text-[14px] font-semibold text-[#0A0A0A] leading-tight">
                        {step.label}
                      </p>
                      <p className="text-[12px] text-[#6B7280] font-light mt-1">
                        {formatDate(step.date)} {formatTime(step.date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}