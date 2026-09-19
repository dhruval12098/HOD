// components/product/ConfiguratorEngravingInput.jsx - House of Diams

import { useId } from 'react';

/**
 * Controlled engraving toggle + text input row for the configurator.
 */
export default function ConfiguratorEngravingInput({ label = 'Free Engraving', mode, text, onModeChange, onTextChange }) {
  const maxLength = 20;
  const inputId = useId();
  const counterId = `${inputId}-counter`;

  const selectedLabel =
    mode === 'custom' && text.trim()
      ? `"${text}"`
      : mode === 'custom'
        ? 'Custom text'
        : 'None';

  return (
    <div className="mb-5">
      <div className="mb-[10px] flex items-baseline justify-between">
        <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-primary,#000000)]">
          {label}
        </span>
        <span className="font-sans text-[13px] font-medium tracking-[0.01em] text-[var(--color-brand-primary,#000000)]">
          {selectedLabel}
          {mode === 'none' && (
            <span className="ml-2 font-sans text-[10px] font-normal tracking-[0.08em] text-[#7F8898]">
              Complimentary
            </span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {['none', 'custom'].map((option) => {
          const isActive = option === mode;
          const optionLabel = option === 'none' ? 'No Engraving' : 'Add Custom Text';
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isActive}
              onClick={() => onModeChange(option)}
              className={`
                px-[18px] py-[10px]
                font-sans text-[10px] font-light uppercase tracking-[0.16em]
                border transition-all duration-300
                ${isActive
                  ? 'border-[var(--color-brand-primary,#000000)] bg-[var(--color-brand-primary,#000000)] text-[#FAFBFD]'
                  : 'border-black/20 bg-transparent text-[var(--color-brand-primary,#000000)] hover:border-[var(--color-brand-primary,#000000)] hover:bg-[var(--color-brand-primary,#000000)] hover:text-white'
                }
              `}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>

      {mode === 'custom' && (
        <div className="animate-[fadeUp_0.3s_ease]">
          <label htmlFor={inputId} className="sr-only">
            Custom engraving text
          </label>
          <input
            id={inputId}
            type="text"
            maxLength={maxLength}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            aria-describedby={counterId}
            placeholder="Up to 20 characters..."
            className="
              mt-[10px] w-full max-w-[340px]
              border border-[rgba(10,22,40,0.10)] bg-[#FAFBFD]
              px-[14px] py-3
              font-sans text-[15px] text-[var(--color-brand-primary,#000000)]
              transition-colors duration-300
              placeholder:text-[#7F8898] focus:border-[var(--color-brand-primary,#000000)] focus:outline-none
            "
          />
          <div id={counterId} className="mt-2 font-sans text-[9px] uppercase tracking-[0.14em] text-[#7F8898]">
            {text.length}/{maxLength}
          </div>
        </div>
      )}
    </div>
  );
}



