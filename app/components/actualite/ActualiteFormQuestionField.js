"use client";

const inputClassName =
  "mt-3 h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white placeholder:text-white/30 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

const textareaClassName =
  "mt-3 min-h-[130px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

export default function ActualiteFormQuestionField({
  question,
  value,
  onChange,
}) {
  const questionId = question?.id || "";
  const label = question?.label || "Question";
  const options = Array.isArray(question?.options) ? question.options : [];

  const renderChoiceInput = (option, type) => {
    const normalizedValue = Array.isArray(value) ? value : [];
    const isChecked =
      type === "checkbox" ? normalizedValue.includes(option) : value === option;

    return (
      <label
        key={`${questionId}-${option}`}
        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80 transition hover:border-accent/30"
      >
        <input
          type={type}
          name={questionId}
          value={option}
          checked={isChecked}
          onChange={(event) => onChange(event.target.value, type === "checkbox")}
          className="h-4 w-4 rounded border-white/20 bg-transparent text-accent focus:ring-accent/30"
        />
        <span>{option}</span>
      </label>
    );
  };

  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] px-5 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-semibold text-white">{label}</label>
        {question?.required ? (
          <span className="rounded-full bg-accent/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Obligatoire
          </span>
        ) : null}
      </div>

      {question?.helpText ? (
        <p className="mt-2 text-xs leading-6 text-white/45">{question.helpText}</p>
      ) : null}

      {question?.type === "textarea" ? (
        <textarea
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={question?.placeholder || ""}
          className={textareaClassName}
        />
      ) : null}

      {question?.type === "text" || question?.type === "email" || question?.type === "number" ? (
        <input
          type={question.type}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={question?.placeholder || ""}
          className={inputClassName}
        />
      ) : null}

      {question?.type === "select" ? (
        <select
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          className={inputClassName}
        >
          <option value="">Selectionnez une option</option>
          {options.map((option) => (
            <option key={`${questionId}-${option}`} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : null}

      {question?.type === "radio" ? (
        <div className="mt-4 grid gap-3">{options.map((option) => renderChoiceInput(option, "radio"))}</div>
      ) : null}

      {question?.type === "checkbox" ? (
        <div className="mt-4 grid gap-3">
          {options.map((option) => renderChoiceInput(option, "checkbox"))}
        </div>
      ) : null}
    </div>
  );
}
