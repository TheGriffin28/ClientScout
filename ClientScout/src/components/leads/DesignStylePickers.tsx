import { useEffect, useRef, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { LegacyTemplateKey, ThemeKey, getTheme } from "../../services/templateEngine";
import { AVAILABLE_TEMPLATES, AVAILABLE_THEMES, templateNames, themeNames } from "./designPreviewUtils";

const TEMPLATE_PREVIEW: Record<
  LegacyTemplateKey,
  { bg: string; accent: string; layout: "split" | "center" | "stack" }
> = {
  "modern-business": { bg: "#f8fafc", accent: "#2563eb", layout: "split" },
  "premium-dark": { bg: "#0f172a", accent: "#a855f7", layout: "center" },
  "local-bright": { bg: "#fffbeb", accent: "#10b981", layout: "stack" },
  "minimal-fast": { bg: "#f1f5f9", accent: "#64748b", layout: "center" },
  "ecommerce-store": { bg: "#fef2f2", accent: "#ef4444", layout: "split" },
  "bold-edge": { bg: "#020617", accent: "#f97316", layout: "center" },
  "elegant-classic": { bg: "#1f2937", accent: "#d4af37", layout: "split" },
  "playful-fun": { bg: "#fef3c7", accent: "#f43f5e", layout: "stack" },
  "technical-pro": { bg: "#0b1120", accent: "#0ea5e9", layout: "split" },
  "nature-green": { bg: "#f0fdf4", accent: "#16a34a", layout: "stack" },
};

function TemplateWireframe({
  template,
  selected,
}: {
  template: LegacyTemplateKey;
  selected: boolean;
}) {
  const preview = TEMPLATE_PREVIEW[template];
  const bar = (w: string, h = "h-1.5") => (
    <div className={`${h} rounded-full`} style={{ width: w, backgroundColor: preview.accent, opacity: 0.85 }} />
  );

  return (
    <div
      className="relative h-[52px] w-full overflow-hidden rounded-lg border p-2 transition-transform duration-300"
      style={{
        backgroundColor: preview.bg,
        borderColor: selected ? preview.accent : "rgba(0,0,0,0.08)",
      }}
    >
      {preview.layout === "split" && (
        <div className="flex h-full gap-1.5">
          <div className="flex flex-1 flex-col justify-center gap-1">
            {bar("70%")}
            {bar("45%", "h-1")}
          </div>
          <div className="w-[38%] rounded-md" style={{ backgroundColor: preview.accent, opacity: 0.25 }} />
        </div>
      )}
      {preview.layout === "center" && (
        <div className="flex h-full flex-col items-center justify-center gap-1">
          {bar("55%")}
          {bar("35%", "h-1")}
          <div className="mt-0.5 h-2 w-8 rounded-full" style={{ backgroundColor: preview.accent, opacity: 0.5 }} />
        </div>
      )}
      {preview.layout === "stack" && (
        <div className="flex h-full flex-col justify-center gap-1">
          {bar("60%")}
          {bar("40%", "h-1")}
          <div className="mt-1 flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-2 flex-1 rounded-sm"
                style={{ backgroundColor: preview.accent, opacity: 0.2 + i * 0.08 }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeSwatch({ theme, selected }: { theme: ThemeKey; selected: boolean }) {
  const tokens = getTheme(theme);
  return (
    <div
      className="relative h-[52px] w-full overflow-hidden rounded-lg border transition-transform duration-300"
      style={{
        backgroundColor: tokens.colors.background,
        borderColor: selected ? tokens.colors.accent : "rgba(0,0,0,0.08)",
      }}
    >
      <div className="absolute inset-0 flex flex-col justify-end p-2">
        <div className="mb-1 flex gap-1">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tokens.colors.primary }} />
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tokens.colors.accent }} />
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tokens.colors.surface }} />
        </div>
        <div className="h-1.5 w-3/4 rounded-full" style={{ backgroundColor: tokens.colors.text, opacity: 0.2 }} />
      </div>
      <div
        className="absolute right-1.5 top-1.5 h-5 w-5 rounded-md"
        style={{ backgroundColor: tokens.colors.accent, opacity: 0.35 }}
      />
    </div>
  );
}

function ScrollPickerItem({
  value,
  selected,
  onSelect,
  scrollRoot,
  index,
  label,
  children,
}: {
  value: string;
  selected: boolean;
  onSelect: () => void;
  scrollRoot: React.RefObject<HTMLDivElement | null>;
  index: number;
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const root = scrollRoot.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setRevealed(true);
      },
      { root, threshold: 0.4, rootMargin: "0px 8px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollRoot]);

  return (
    <button
      ref={ref}
      type="button"
      data-picker-value={value}
      onClick={onSelect}
      className={`design-picker-item snap-center shrink-0 w-[108px] rounded-xl border p-2 text-left transition-all duration-500 ease-out ${
        revealed ? "design-picker-item-visible" : ""
      } ${
        selected
          ? "border-blue-500 bg-blue-50/80 shadow-md ring-2 ring-blue-500/30 scale-[1.02]"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
      style={{ transitionDelay: revealed ? `${index * 70}ms` : "0ms" }}
      aria-pressed={selected}
      aria-label={label}
    >
      {children}
      <p className={`mt-1.5 truncate text-[10px] font-semibold leading-tight ${selected ? "text-blue-700" : "text-gray-600"}`}>
        {label}
      </p>
      {selected && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white shadow">
          <FaCheck className="h-2 w-2" />
        </span>
      )}
    </button>
  );
}

function HorizontalPicker<T extends string>({
  label,
  items,
  value,
  onChange,
  renderPreview,
  getLabel,
}: {
  label: string;
  items: T[];
  value: T;
  onChange: (value: T) => void;
  renderPreview: (item: T, selected: boolean) => React.ReactNode;
  getLabel: (item: T) => string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const selectedEl = root.querySelector(`[data-picker-value="${value}"]`);
    selectedEl?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [value]);

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-gray-600">{label}</p>
      <div className="relative">
        <div
          ref={scrollRef}
          className="design-picker-scroll flex gap-2 overflow-x-auto pb-1 pt-1 scroll-smooth snap-x snap-mandatory"
        >
          {items.map((item, index) => (
            <ScrollPickerItem
              key={item}
              value={item}
              selected={value === item}
              onSelect={() => onChange(item)}
              scrollRoot={scrollRef}
              index={index}
              label={getLabel(item)}
            >
              <div className="relative">{renderPreview(item, value === item)}</div>
            </ScrollPickerItem>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white to-transparent" />
      </div>
    </div>
  );
}

interface DesignStylePickersProps {
  templateKey: LegacyTemplateKey;
  themeKey: ThemeKey;
  onTemplateChange: (key: LegacyTemplateKey) => void;
  onThemeChange: (key: ThemeKey) => void;
}

export default function DesignStylePickers({
  templateKey,
  themeKey,
  onTemplateChange,
  onThemeChange,
}: DesignStylePickersProps) {
  return (
    <div className="space-y-4">
      <HorizontalPicker
        label="Template"
        items={AVAILABLE_TEMPLATES}
        value={templateKey}
        onChange={onTemplateChange}
        getLabel={(t) => templateNames[t]}
        renderPreview={(t, selected) => <TemplateWireframe template={t} selected={selected} />}
      />
      <HorizontalPicker
        label="Theme"
        items={AVAILABLE_THEMES}
        value={themeKey}
        onChange={onThemeChange}
        getLabel={(t) => themeNames[t]}
        renderPreview={(t, selected) => <ThemeSwatch theme={t} selected={selected} />}
      />
    </div>
  );
}
