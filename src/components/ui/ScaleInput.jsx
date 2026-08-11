const DEFAULT_EMOJIS = ['😞', '🙁', '😐', '🙂', '😄']

export default function ScaleInput({
  label,
  value,
  onChange,
  emojis = DEFAULT_EMOJIS,
  lowLabel,
  highLabel,
}) {
  return (
    <div>
      {label && <p className="mb-2 text-sm font-medium text-slate-700">{label}</p>}

      <div className="flex items-center justify-between gap-2">
        {emojis.map((emoji, index) => {
          const score = index + 1
          const isSelected = value === score

          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              aria-label={`${score} de ${emojis.length}`}
              aria-pressed={isSelected}
              className={[
                'flex h-12 flex-1 items-center justify-center rounded-2xl text-2xl transition',
                isSelected
                  ? 'scale-110 bg-violet-600 shadow-lg shadow-violet-200'
                  : 'bg-slate-50 hover:bg-slate-100',
              ].join(' ')}
            >
              {emoji}
            </button>
          )
        })}
      </div>

      {(lowLabel || highLabel) && (
        <div className="mt-1.5 flex justify-between text-xs text-slate-400">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
    </div>
  )
}
