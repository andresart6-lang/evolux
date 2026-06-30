import React from 'react';
import { AlignLeft, CheckSquare, Calendar, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../../../context/ThemeContext';

export default function TaskCard({ task, categoryColor, onEdit, onDragStart }) {
    const { toggleChecklistItem } = useTasks();
    const { isDark } = useTheme();

    const totalChecks = task.checklist?.length || 0;
    const completedChecks = task.checklist?.filter(c => c.is_completed).length || 0;
    const progress = totalChecks === 0 ? 0 : Math.round((completedChecks / totalChecks) * 100);

    const isCompleted = task.status === 'completed';

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
            className={`
                group relative backdrop-blur-md rounded-2xl cursor-pointer
                border shadow-lg transition-all duration-300
                overflow-hidden select-none
                ${isDark 
                    ? 'bg-[#0a0a0a]/80 border-white/5 hover:border-white/10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
                    : 'bg-white/80 border-black/[0.06] hover:border-black/[0.12] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]'
                }
                ${isCompleted ? 'opacity-50 grayscale hover:grayscale-0' : ''}
            `}
        >
            {/* Colored Left Border Indicator */}
            <div 
                className="absolute left-0 top-0 bottom-0 w-1 opacity-80"
                style={{ backgroundColor: categoryColor, boxShadow: `0 0 10px ${categoryColor}40` }}
            />

            {/* Main clickable area */}
            <div className="p-4 pl-5" onClick={() => onEdit(task)}>
                <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="min-w-0 flex-1">
                        <h4 className={`text-sm font-bold text-white mb-1 truncate transition-colors group-hover:text-acid ${isCompleted ? 'line-through text-white/50' : ''}`}>
                            {task.title}
                        </h4>
                        
                        {task.description && (
                            <p className="text-xs text-text-muted line-clamp-2 mb-2 leading-snug">
                                {task.description}
                            </p>
                        )}

                        <div className="flex items-center gap-3 text-[10px] font-bold text-white/40 tracking-wider">
                            {task.date && (
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} className="text-white/30" />
                                    <span>{new Date(task.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</span>
                                </div>
                            )}
                            
                            {totalChecks > 0 && (
                                <div className="flex items-center gap-1">
                                    <CheckSquare size={12} className={completedChecks === totalChecks ? 'text-acid' : 'text-white/30'} />
                                    <span className={completedChecks === totalChecks ? 'text-acid' : ''}>{completedChecks}/{totalChecks}</span>
                                </div>
                            )}
                            
                            {task.description && totalChecks === 0 && (
                                <AlignLeft size={12} className="text-white/30" />
                            )}
                        </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-white/5 text-white/50">
                        <ChevronRight size={14} />
                    </div>
                </div>
            </div>

            {/* Inline Checklist Preview */}
            {totalChecks > 0 && (
                <div className="px-4 pl-5 pb-3 space-y-0.5">
                    <div className="border-t border-white/5 pt-2 space-y-0.5">
                        {task.checklist.map(item => (
                            <div 
                                key={item.id} 
                                className="flex items-center gap-2 py-1 px-1 rounded-lg hover:bg-white/5 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleChecklistItem(task.id, item.id);
                                }}
                            >
                                <div className={`flex-shrink-0 transition-all duration-300 ${item.is_completed ? 'text-acid' : 'text-white/20'}`}>
                                    {item.is_completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                </div>
                                <span className={`text-[11px] flex-1 transition-all duration-300 leading-tight ${item.is_completed ? 'line-through text-white/25' : 'text-white/60'}`}>
                                    {item.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Subtle progress bar at the bottom if there's a checklist */}
            {totalChecks > 0 && (
                 <div className="absolute bottom-0 left-1 right-0 h-0.5 bg-white/5">
                     <div 
                        className="h-full transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%`, backgroundColor: progress === 100 ? '#bef264' : categoryColor }}
                     />
                 </div>
            )}
        </div>
    );
}
