import {
  BookOpen,
  CalendarRange,
  FileText,
  GraduationCap,
  Layers,
  Map as MapIcon,
  MonitorPlay,
  School,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { Scenario } from "../../types/template";
import { SCENARIO_LABELS } from "../../templates";

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  FileText,
  GraduationCap,
  Video,
  Map: MapIcon,
};

export function TemplateIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = TEMPLATE_ICONS[icon] ?? Layers;
  return <Icon className={className} aria-hidden="true" />;
}

const SCENARIO_STYLE: Record<Scenario, { icon: LucideIcon; className: string }> = {
  presencial: { icon: School, className: "bg-presencial-soft text-presencial" },
  sincronico: { icon: Video, className: "bg-sincronico-soft text-sincronico" },
  asincronico: { icon: MonitorPlay, className: "bg-asincronico-soft text-asincronico" },
  cursada: { icon: CalendarRange, className: "bg-cursada-soft text-cursada" },
};

/** Etiqueta de escenario: color + ícono + texto (nunca color solo). */
export function ScenarioTag({ scenario }: { scenario: Scenario }) {
  const { icon: Icon, className } = SCENARIO_STYLE[scenario];
  return (
    <span
      className={`mcb-tag inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold ${className}`}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {SCENARIO_LABELS[scenario]}
    </span>
  );
}
