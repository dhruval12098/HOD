// components/product/ConfiguratorEngravingInput.jsx - House of Diams

/**
 * Controlled engraving toggle + text input row for the configurator.
 */
export default function ConfiguratorEngravingInput({ mode, text, onModeChange, onTextChange }) {
  const maxLength = 20;

  const selectedLabel =
    mode === 'custom' && text.trim()
      ? `"${text}"`
      : mode === 'custom'
        ? 'Custom text'
        : 'None';

  return (
    <div className="mb-5">
      <div className="mb-[10px] flex items-baseline justify-between">
        <span className="font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-[#14120D]">
          Free Engraving
        </span>
        <span className="font-serif text-[14px] font-normal italic tracking-[0.02em] text-[#B8922A]">
          {selectedLabel}
          {mode === 'none' && (
            <span className="ml-2 font-sans text-[10px] font-normal not-italic tracking-[0.1em] text-[#B0A898]">
              Complimentary
            </span>
          )}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {['none', 'custom'].map((option) => {
          const isActive = option === mode;
          const label = option === 'none' ? 'No Engraving' : 'Add Custom Text';
          return (
            <button
              key={option}
              onClick={() => onModeChange(option)}
              className={`
                px-[18px] py-[10px]
                font-sans text-[10px] font-light uppercase tracking-[0.16em]
                border transition-all duration-300
                ${isActive
                  ? 'border-[#14120D] bg-[#14120D] text-[#FBF9F5]'
                  : 'border-[rgba(20,18,13,0.10)] bg-transparent text-[#3A3628] hover:border-[#14120D] hover:text-[#14120D]'
                }
              `}
            >
              {label}
            </button>
          );
        })}
      </div>

      {mode === 'custom' && (
        <div className="animate-[fadeUp_0.3s_ease]">
          <input
            type="text"
            maxLength={maxLength}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Up to 20 characters..."
            className="
              mt-[10px] w-full max-w-[340px]
              border border-[rgba(20,18,13,0.10)] bg-[#FBF9F5]
              px-[14px] py-3
              font-serif text-[16px] italic text-[#14120D]
              transition-colors duration-300
              placeholder:text-[#B0A898] focus:border-[#B8922A] focus:outline-none
            "
          />
          <div className="mt-2 font-sans text-[9px] uppercase tracking-[0.14em] text-[#B0A898]">
            {text.length}/{maxLength}
          </div>
        </div>
      )}
    </div>
  );
}
