"use client";

type ConfirmDeleteProps = {
  action: string;
  hiddenFields: Record<string, string>;
  label?: string;
  message?: string;
};

export function ConfirmDelete({
  action,
  hiddenFields,
  label = "Remover",
  message = "Esta ação não pode ser desfeita. Confirma?",
}: ConfirmDeleteProps) {
  return (
    <form
      action={action}
      method="post"
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button className="rounded-full border border-slate-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
        {label}
      </button>
    </form>
  );
}
