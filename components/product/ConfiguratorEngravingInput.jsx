// components/product/ConfiguratorEngravingInput.jsx - House of Diams

/**
 * Controlled engraving toggle + text input row for the configurator.
 */
export default function ConfiguratorEngravingInput({ label = 'Free Engraving', mode, text, onModeChange, onTextChange }) {
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
        <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0A1628]">
          {label}
        </span>
        <span className="font-sans text-[13px] font-medium tracking-[0.01em] text-[#0A1628]">
          {selectedLabel}
          {mode === 'none' && (
            <span className="ml-2 font-sans text-[10px] font-normal tracking-[0.08em] text-[#7F8898]">
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
                  ? 'border-[#0A1628] bg-[#0A1628] text-[#FAFBFD]'
                  : 'border-[rgba(10,22,40,0.10)] bg-transparent text-[#253246] hover:border-[#0A1628] hover:text-[#0A1628]'
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
              border border-[rgba(10,22,40,0.10)] bg-[#FAFBFD]
              px-[14px] py-3
              font-sans text-[15px] text-[#0A1628]
              transition-colors duration-300
              placeholder:text-[#7F8898] focus:border-[#0A1628] focus:outline-none
            "
          />
          <div className="mt-2 font-sans text-[9px] uppercase tracking-[0.14em] text-[#7F8898]">
            {text.length}/{maxLength}
          </div>
        </div>
      )}
    </div>
  );
}
