import { useState } from 'react';

interface MatchupCardProps {
  id: number;
  photoUrl: string;
  side: 'left' | 'right';
  disabled: boolean;
  isSelected: boolean;
  isDimmed: boolean;
  onSelect: (id: number) => void;
}

const MatchupCard = ({
  id,
  photoUrl,
  side,
  disabled,
  isSelected,
  isDimmed,
  onSelect,
}: MatchupCardProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const accent = side === 'left' ? 'secondary' : 'primary';

  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(id)}
      disabled={disabled}
      className={`group relative block w-full transition-all duration-500 ${
        !disabled ? 'cursor-pointer' : 'cursor-default'
      } ${isDimmed ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}`}
    >
      {/* Glow halo on hover/select */}
      <div
        className={`absolute -inset-2 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500 ${
          isSelected
            ? `opacity-80 ${accent === 'primary' ? 'bg-primary' : 'bg-secondary'}`
            : `group-hover:opacity-50 ${accent === 'primary' ? 'bg-primary' : 'bg-secondary'}`
        }`}
      />

      {/* Card body */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-500 ${
          isSelected
            ? `ring-4 ${accent === 'primary' ? 'ring-primary' : 'ring-secondary'} -translate-y-2`
            : !disabled
            ? `group-hover:-translate-y-2 group-hover:rotate-[${side === 'left' ? '-' : ''}0.5deg] ring-2 ring-transparent`
            : 'ring-2 ring-transparent'
        }`}
      >
        {/* Side label strip */}
        <div
          className={`flex items-center justify-between px-4 py-2.5 ${
            accent === 'primary'
              ? 'bg-gradient-to-r from-primary to-primary-dark'
              : 'bg-gradient-to-r from-secondary to-secondary-dark'
          } text-white`}
        >
          <span className="font-mono text-xs font-bold tracking-[0.3em]">
            {side === 'left' ? 'A' : 'B'}
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] opacity-80">
            აირჩიე
          </span>
        </div>

        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
          )}
          {!imgError ? (
            <img
              src={photoUrl}
              alt=""
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`h-full w-full object-cover transition-transform duration-700 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              } ${isSelected ? 'scale-[1.08]' : 'group-hover:scale-[1.05]'}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm uppercase tracking-widest text-gray-400">
              ფოტო
            </div>
          )}

          {/* Selected overlay */}
          {isSelected && (
            <div
              className={`absolute inset-0 ${
                accent === 'primary' ? 'bg-primary/20' : 'bg-secondary/20'
              } animate-pulse`}
            />
          )}
        </div>

        {/* Bottom action bar */}
        <div className="relative overflow-hidden bg-gray-50">
          <div
            className={`flex items-center justify-center py-3 transition-all duration-300 ${
              isSelected
                ? `${
                    accent === 'primary' ? 'bg-primary' : 'bg-secondary'
                  } text-white`
                : `group-hover:${
                    accent === 'primary' ? 'bg-primary' : 'bg-secondary'
                  } group-hover:text-white text-gray-700`
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-[0.3em]">
              {isSelected ? 'არჩეული' : 'აირჩიე'}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default MatchupCard;
