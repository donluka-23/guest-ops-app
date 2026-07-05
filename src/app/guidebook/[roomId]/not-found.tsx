import { GUIDEBOOK_LOCALES, GUIDEBOOK_LABELS } from "./labels";

// No language signal exists yet at this point (the lookup itself failed),
// so all three languages are shown stacked rather than guessing one.
export default function GuidebookNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-2 p-6 text-center">
      {GUIDEBOOK_LOCALES.map((locale) => (
        <p key={locale} className="text-sm text-muted-foreground">
          {GUIDEBOOK_LABELS[locale].notFoundBody}
        </p>
      ))}
    </div>
  );
}
