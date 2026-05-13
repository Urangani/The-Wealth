import React from "react";
import { StrategyPipelineCard } from "./StrategyPipelineCard";

interface Stage {
  key: string;
  label: string;
}

interface PipelineBoardProps {
  stages: Stage[];
  strategiesByStage: Map<string, any[]>;
  onSelectStrategy: (id: string) => void;
  onPromote: (id: string, currentStage: string) => void;
  inferredStageFn: (s: any) => string;
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  stages,
  strategiesByStage,
  onSelectStrategy,
  onPromote,
  inferredStageFn,
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-7 gap-4 overflow-x-auto pb-4">
      {stages.map((st) => {
        const list = strategiesByStage.get(st.key) || [];
        return (
          <div key={st.key} className="min-w-[200px] rounded-2xl border border-white/5 bg-white/[0.02] p-3 flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-3 px-1">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{st.label}</div>
                <div className="text-[10px] text-gray-500">{list.length} strategies</div>
              </div>
            </div>

            <div className="space-y-2 flex-1">
              {list.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-4 border border-dashed border-white/5 rounded-xl">
                  Empty
                </div>
              ) : (
                list.map((s) => (
                  <StrategyPipelineCard
                    key={s.id}
                    strategy={s}
                    onSelect={onSelectStrategy}
                    onPromote={onPromote}
                    inferredStage={inferredStageFn(s)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
