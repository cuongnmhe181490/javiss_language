"use client";

import type { Scenario } from "@/app/api/speaking/scenarios";

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  selectedId: string | null;
  onSelect: (scenario: Scenario) => void;
}

export function ScenarioSelector({ scenarios, selectedId, onSelect }: ScenarioSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {scenarios.map((scenario) => (
        <button
          key={scenario.id}
          onClick={() => onSelect(scenario)}
          className={`rounded-2xl border p-4 text-left transition-all ${
            selectedId === scenario.id
              ? "border-emerald-500/50 bg-emerald-500/10"
              : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
          }`}
          aria-pressed={selectedId === scenario.id}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                scenario.level === "A1"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : scenario.level === "A2"
                    ? "bg-blue-500/20 text-blue-400"
                    : scenario.level === "B1"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-purple-500/20 text-purple-400"
              }`}
            >
              {scenario.level}
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-200 mb-1">{scenario.titleVi}</h3>
          <p className="text-xs text-slate-400 line-clamp-2">{scenario.descriptionVi}</p>
        </button>
      ))}
    </div>
  );
}
