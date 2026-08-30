"use client";
import { Profile, PROFILES, getProfileInfo } from "@/utils/rankingV2";

interface Props {
  value: Profile;
  onChange: (p: Profile) => void;
}

export default function RankingProfileSelector({ value, onChange }: Props) {
  const profiles = Object.keys(PROFILES) as Profile[];

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {profiles.map((p) => {
          const info = getProfileInfo(p);
          const isSelected = value === p;
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`
                shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all
                flex items-center gap-1.5 whitespace-nowrap
                ${isSelected
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }
              `}
              title={info.description}
            >
              <span>{info.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
