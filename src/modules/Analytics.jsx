import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { useTasks } from '../context/TaskContext';
import { TrendingUp, TrendingDown, DollarSign, CheckSquare } from 'lucide-react';

const COLORS = ['#4ade80', '#fb923c', '#c084fc', '#60a5fa', '#f87171'];

export default function Analytics() {
    const { db, currentDate, formatCurrency, months } = useFinance();
    const { spaces, categories, tasks } = useTasks();

    // --- Helper: Prepare Financial Data ---
    const getChartData = () => {
        const year = currentDate.getFullYear();
        const currentMonthIdx = currentDate.getMonth();

        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            let m = currentMonthIdx - i;
            let y = year;
            if (m < 0) {
                m += 12;
                y -= 1;
            }

            const monthData = db[y]?.months?.[m] || { fixedIncome: [], monthlyExpenses: [], variableExpenses: [] };

            const income = (monthData.fixedIncome || []).reduce((acc, item) => acc + (item.status === 1 ? parseInt(item.amount.replace(/\./g, '')) : 0), 0);
            const expenseFixed = (monthData.monthlyExpenses || []).reduce((acc, item) => acc + (item.status === 1 ? parseInt(item.amount.replace(/\./g, '')) : 0), 0);
            const expenseVar = (monthData.variableExpenses || []).reduce((acc, item) => acc + (item.status === 1 ? parseInt(item.amount.replace(/\./g, '')) : 0), 0);
            const totalExpense = expenseFixed + expenseVar;

            last6Months.push({
                name: months[m],
                Income: income,
                Expense: totalExpense,
                Savings: income - totalExpense
            });
        }

        const currentMonthData = db[year]?.months?.[currentMonthIdx] || {};

        const totalFixed = (currentMonthData.monthlyExpenses || []).reduce((acc, item) => acc + (item.status === 1 ? parseInt(item.amount.replace(/\./g, '')) : 0), 0);
        const totalVar = (currentMonthData.variableExpenses || []).reduce((acc, item) => acc + (item.status === 1 ? parseInt(item.amount.replace(/\./g, '')) : 0), 0);

        const expenseBreakdown = [
            { name: 'Gastos Fijos', value: totalFixed },
            { name: 'Gastos Variables', value: totalVar }
        ].filter(i => i.value > 0);

        return { barData: last6Months, pieData: expenseBreakdown };
    };

    const { barData, pieData } = getChartData();

    // --- Task Completion Data (by space, daily cumulative %) ---
    const getTaskChartData = () => {
        const year = currentDate.getFullYear();
        const monthIdx = currentDate.getMonth();
        const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
        const today = new Date();

        const data = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const dataPoint = { day };
            
            spaces.forEach(space => {
                const spaceCats = categories.filter(c => c.spaceId === space.id);
                const spaceTasks = tasks.filter(t => spaceCats.some(c => c.id === t.categoryId));
                
                if (spaceTasks.length === 0) {
                    dataPoint[space.id] = 0;
                    dataPoint[`${space.id}_full`] = 0;
                    return;
                }

                // Count tasks that have been completed (we track by checking if task has checklist 100% or status completed)
                // For simplicity: completed = tasks in the "done" category OR with status 'completed'
                const totalTasks = spaceTasks.length;
                const completedTasks = spaceTasks.filter(t => t.status === 'completed').length;
                const percent = Math.round((completedTasks / totalTasks) * 100);

                // Full line (projection)
                dataPoint[`${space.id}_full`] = percent;
                
                // Main line (only up to today)
                const dateObj = new Date(year, monthIdx, day);
                if (dateObj <= today) {
                    dataPoint[space.id] = percent;
                } else {
                    dataPoint[space.id] = null;
                }
            });

            data.push(dataPoint);
        }
        return data;
    };

    const taskChartData = getTaskChartData();

    // Overall task stats
    const totalAllTasks = tasks.length;
    const completedAllTasks = tasks.filter(t => t.status === 'completed').length;
    const overallPercent = totalAllTasks > 0 ? Math.round((completedAllTasks / totalAllTasks) * 100) : 0;

    // Custom Tooltips
    const FinanceTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0b0c10]/95 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
                    <p className="font-bold text-white mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-xs" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const TaskTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0b0c10]/95 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
                    <p className="text-white/60 text-xs font-bold mb-2 uppercase tracking-wider">Día {label}</p>
                    {payload.filter(p => !p.dataKey.includes('_full')).map((entry, index) => {
                        if (entry.value === null) return null;
                        const space = spaces.find(s => s.id === entry.dataKey);
                        return (
                            <div key={index} className="flex items-center justify-between gap-6 mb-1 last:mb-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 6px ${entry.color}` }}></div>
                                    <span className="text-white text-sm font-medium">{space?.name || entry.name}</span>
                                </div>
                                <span className="text-white font-bold">{entry.value}%</span>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    const TaskCursor = ({ points, height }) => {
        if (!points || points.length === 0) return null;
        const { x } = points[0];
        return (
            <line x1={x} y1={height} x2={x} y2={0}
                stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="4 4"
            />
        );
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Análisis</h2>
                    <p className="text-text-muted text-sm mt-1">Visualiza tus patrones de gasto, ahorro y productividad.</p>
                </div>
                <button className="btn-primary" onClick={() => {}}>
                    Exportar Métricas
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. Bar Chart: Income vs Expense */}
                <div className="glass-card p-6 lg:col-span-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <TrendingUp size={20} className="text-green-400" />
                            Ingresos vs Gastos
                            <span className="text-xs font-normal text-text-muted ml-2">(Últimos 6 meses)</span>
                        </h3>
                    </div>
                    <div className="h-[300px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4} barCategoryGap="20%">
                                <defs>
                                    <linearGradient id="barIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#4ade80" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="#4ade80" stopOpacity={0.08} />
                                    </linearGradient>
                                    <linearGradient id="barExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f87171" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="#f87171" stopOpacity={0.08} />
                                    </linearGradient>
                                    <linearGradient id="strokeIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#4ade80" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#4ade80" stopOpacity={0.3} />
                                    </linearGradient>
                                    <linearGradient id="strokeExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#f87171" stopOpacity={0.3} />
                                    </linearGradient>
                                    <filter id="glowIncome" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                    </filter>
                                    <filter id="glowExpense" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#52525b"
                                    tick={{ fill: '#71717a', fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#52525b"
                                    tick={{ fill: '#71717a', fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                />
                                <Tooltip content={<FinanceTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="Income" name="Ingresos" fill="url(#barIncome)" stroke="url(#strokeIncome)" strokeWidth={2} radius={[6, 6, 0, 0]} maxBarSize={36} style={{ filter: 'drop-shadow(0px 0px 8px rgba(74, 222, 128, 0.4))' }}
                                    shape={(props) => {
                                        const { x, y, width, height, fill, stroke, strokeWidth: sw } = props;
                                        const r = 6;
                                        return (
                                            <g>
                                                <path d={`M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height}`} fill={fill} />
                                                <path d={`M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height}`} fill="none" stroke={stroke} strokeWidth={sw} filter="url(#glowIncome)" />
                                            </g>
                                        );
                                    }}
                                />
                                <Bar dataKey="Expense" name="Gastos" fill="url(#barExpense)" stroke="url(#strokeExpense)" strokeWidth={2} radius={[6, 6, 0, 0]} maxBarSize={36} style={{ filter: 'drop-shadow(0px 0px 8px rgba(248, 113, 113, 0.4))' }}
                                    shape={(props) => {
                                        const { x, y, width, height, fill, stroke, strokeWidth: sw } = props;
                                        const r = 6;
                                        return (
                                            <g>
                                                <path d={`M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height}`} fill={fill} />
                                                <path d={`M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height}`} fill="none" stroke={stroke} strokeWidth={sw} filter="url(#glowExpense)" />
                                            </g>
                                        );
                                    }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-4 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 8px #4ade80' }}></div>
                            <span className="text-white/80 text-xs font-semibold tracking-wide">Ingresos</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" style={{ boxShadow: '0 0 8px #f87171' }}></div>
                            <span className="text-white/80 text-xs font-semibold tracking-wide">Gastos</span>
                        </div>
                    </div>
                </div>

                {/* 2. Donut Chart: Expense Breakdown */}
                <div className="glass-card p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                        <DollarSign size={20} className="text-orange-400" />
                        Distribución de Gastos
                    </h3>
                    <div className="h-[250px] w-full flex items-center justify-center relative z-10">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <defs>
                                        <filter id="glow-pie" x="-50%" y="-50%" width="200%" height="200%">
                                            <feGaussianBlur stdDeviation="4" result="blur" />
                                            <feMerge>
                                                <feMergeNode in="blur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        style={{ filter: 'url(#glow-pie)' }}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.name === 'Gastos Fijos' ? '#f87171' : '#fb923c'} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<FinanceTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm">
                                Sin datos este mes
                            </div>
                        )}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <span className="text-xs text-text-muted block">Total</span>
                            <span className="font-bold text-white text-lg">
                                {formatCurrency(pieData.reduce((a, b) => a + b.value, 0))}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-4 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" style={{ boxShadow: '0 0 8px #f87171' }}></div>
                            <span className="text-white/80 text-xs font-semibold tracking-wide">Fijos</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-orange-400" style={{ boxShadow: '0 0 8px #fb923c' }}></div>
                            <span className="text-white/80 text-xs font-semibold tracking-wide">Variables</span>
                        </div>
                    </div>
                </div>

                {/* 3. Area Chart: Savings Trend */}
                <div className="glass-card p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                        <TrendingDown size={20} className="text-blue-400" />
                        Tendencia de Ahorro
                    </h3>
                    <div className="h-[250px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="name" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} dy={10} />
                                <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip content={<FinanceTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="Savings"
                                    name="Ahorro Mensual"
                                    stroke="#60a5fa"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorSavings)"
                                    style={{ filter: 'drop-shadow(0px 0px 4px rgba(96, 165, 250, 0.5))' }}
                                    activeDot={{ r: 5, fill: '#60a5fa', stroke: '#fff', strokeWidth: 2, style: { filter: 'drop-shadow(0px 0px 6px #60a5fa)' } }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* ── Task Completion Chart (Habit-tracker style) ── */}
            <div className="glass-card p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <CheckSquare size={20} className="text-acid" />
                        Productividad por Espacio
                        <span className="text-xs font-normal text-text-muted ml-2">(% tareas completadas)</span>
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-white/40 font-bold">GLOBAL</span>
                        <span className={`text-lg font-bold ${overallPercent >= 70 ? 'text-acid' : overallPercent >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{overallPercent}%</span>
                    </div>
                </div>

                <div className="h-[280px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={taskChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                                {spaces.map(space => (
                                    <filter key={`glow-task-${space.id}`} id={`glow-task-${space.id}`} x="-100%" y="-100%" width="300%" height="300%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                ))}
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                            
                            <XAxis
                                dataKey="day"
                                stroke="#52525b"
                                tick={{ fill: '#71717a', fontSize: 11 }}
                                tickLine={false}
                                axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                                interval={1}
                            />
                            <YAxis
                                stroke="#52525b"
                                tick={{ fill: '#71717a', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                ticks={[0, 25, 50, 75, 100]}
                                domain={[0, 100]}
                            />

                            <Tooltip content={<TaskTooltip />} cursor={<TaskCursor />} />

                            {/* Projection lines (faint) */}
                            {spaces.map(space => (
                                <Line
                                    key={`full-${space.id}`}
                                    type="stepAfter"
                                    dataKey={`${space.id}_full`}
                                    name={`${space.name} (Proj.)`}
                                    stroke={space.color}
                                    strokeWidth={1}
                                    strokeOpacity={0.2}
                                    activeDot={false}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            ))}

                            {/* Main active lines with glow */}
                            {spaces.map(space => (
                                <Line
                                    key={space.id}
                                    type="monotone"
                                    dataKey={space.id}
                                    name={space.name}
                                    stroke={space.color}
                                    strokeWidth={2}
                                    animationDuration={400}
                                    style={{ filter: `drop-shadow(0px 0px 4px ${space.color})` }}
                                    activeDot={{ r: 5, fill: space.color, stroke: '#fff', strokeWidth: 2, style: { filter: `drop-shadow(0px 0px 6px ${space.color})` } }}
                                    connectNulls={false}
                                    dot={false}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-4 relative z-10">
                    {spaces.map(space => (
                        <div key={`legend-${space.id}`} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: space.color, boxShadow: `0 0 8px ${space.color}` }}></div>
                            <span className="text-white/80 text-xs font-semibold tracking-wide">{space.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
