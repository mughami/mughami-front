import React from 'react';

type LoadingProps = {
  fullScreen?: boolean;
  label?: string;
};

const Loading: React.FC<LoadingProps> = ({ fullScreen = true, label = 'იტვირთება...' }) => {
  return (
    <div
      className={
        fullScreen
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/40 to-purple-50/30 backdrop-blur-sm'
          : 'flex items-center justify-center p-10'
      }
    >
      <div className="relative">
        {/* Ambient glow */}
        <div className="absolute -inset-8 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />

        {/* Spinner ring */}
        <div className="relative w-24 h-24 md:w-28 md:h-28">
          <div className="absolute inset-0 rounded-full border-4 border-white/60" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin" />

          {/* Inner pulse */}
          <div className="absolute inset-4 rounded-full bg-white/70 backdrop-blur animate-pulse flex items-center justify-center shadow-inner">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-sm">
              მუღამი
            </span>
          </div>
        </div>

        {/* Label */}
        {label && <div className="mt-4 text-center text-slate-600 text-sm">{label}</div>}
      </div>
    </div>
  );
};

export default Loading;
