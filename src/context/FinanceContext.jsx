import React, { createContext, useContext, useState, useEffect } from 'react';

// Initial Data Structure (Simulated DB)
const INITIAL_DB = {
    months: ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"],
    2026: {
        annual: [
            { id: 1, name: 'Impuesto Moto', date: 'Ene 15', amount: '1.200.000', status: 0 },
            { id: 2, name: 'Suscripción Adobe', date: 'Feb 20', amount: '450.000', status: 1 },
            { id: 3, name: 'Seguro Hogar', date: 'Jun 05', amount: '3.500.000', status: 0 },
        ],
        months: {
            0: { // Enero
                fixedIncome: [
                    { id: 1, name: 'Salario Base', date: 'Ene 30', amount: '4.500.000', status: 1 },
                    { id: 2, name: 'Freelance Design', date: 'Ene 05', amount: '1.200.000', status: 1 },
                ],
                monthlyExpenses: [
                    { id: 1, name: 'Arriendo', date: 'Ene 05', amount: '1.500.000', status: 1 },
                    { id: 2, name: 'Servicios Públicos', date: 'Ene 10', amount: '250.000', status: 0 },
                    { id: 3, name: 'Internet / Plan', date: 'Ene 12', amount: '120.000', status: 0 },
                ],
                variableExpenses: [
                    { id: 1, name: 'Uber / Transporte', date: 'Ene 02', amount: '45.000', status: 1 },
                    { id: 2, name: 'Rappi / Comida', date: 'Ene 15', amount: '35.000', status: 1 },
                ]
            }
        }
    }
};

// Initial Accounts Data (Finance Module)
const INITIAL_ACCOUNTS = [
    { id: 1, name: 'Nequi', amount: 1000000 },
    { id: 2, name: 'DaviBank', amount: 2500000 },
    { id: 3, name: 'Efectivo', amount: 500000 },
];

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
    const [db, setDb] = useState(INITIAL_DB);
    const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Helper: Update DB State
    const updateDb = (section, operation, payload) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        setDb(prevDb => {
            // Deep clone the year and month structure we are about to modify
            const newDb = { ...prevDb };

            // Ensure path exists with immutable copies
            newDb[year] = { ...newDb[year] } || { annual: [], months: {} };
            newDb[year].months = { ...newDb[year].months } || {};
            newDb[year].months[month] = { ...newDb[year].months[month] } || { fixedIncome: [], monthlyExpenses: [], variableExpenses: [] };

            // Determine target array and clone it
            let targetArray;
            if (section === 'annual') {
                targetArray = [...(newDb[year].annual || [])];
                newDb[year].annual = targetArray;
            } else {
                targetArray = [...(newDb[year].months[month][section] || [])];
                newDb[year].months[month][section] = targetArray;
            }

            if (operation === 'update') {
                // payload: { id, field, value }
                const index = targetArray.findIndex(item => item.id === payload.id);
                if (index !== -1) {
                    targetArray[index] = { ...targetArray[index], [payload.field]: payload.value };
                }
            } else if (operation === 'add') {
                targetArray.push(payload);
            } else if (operation === 'delete') {
                // Filter returns a new array, so we must re-assign to the state structure
                if (section === 'annual') {
                    newDb[year].annual = targetArray.filter(item => item.id !== payload.id);
                } else {
                    newDb[year].months[month][section] = targetArray.filter(item => item.id !== payload.id);
                }
            }

            return newDb;
        });
    };

    // Helper: Manage Accounts (Finance Module)
    const updateAccount = (id, newAmount, newName = null) => {
        setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, amount: parseInt(newAmount) || 0, name: newName || acc.name } : acc));
    };

    const addAccount = (name, amount) => {
        setAccounts(prev => [...prev, { id: Date.now(), name, amount: parseInt(amount) || 0 }]);
    };

    const removeAccount = (id) => {
        setAccounts(prev => prev.filter(acc => acc.id !== id));
    };


    // Helper: Calculate Totals (with Status Filter)
    const calculateTotal = (items) => {
        if (!items) return 0;
        return items.reduce((acc, item) => {
            // Only count if status is 1 (Green/Paid)
            if (item.status !== 1) return acc;

            // Remove non-numeric characters except checks for potential decimals if needed (here assuming integers with dots)
            const cleanAmount = parseInt(item.amount.replace(/\./g, '').replace(/\$/g, '')) || 0;
            return acc + cleanAmount;
        }, 0);
    };

    // Helper: Get Data for Current View
    const getDisplayData = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Ensure Year exists
        const yearData = db[year] || { annual: [], months: {} };
        // Ensure Month exists
        const monthData = yearData.months[month] || { fixedIncome: [], monthlyExpenses: [], variableExpenses: [] };

        return {
            annual: yearData.annual || [],
            fixedIncome: monthData.fixedIncome || [],
            monthlyExpenses: monthData.monthlyExpenses || [],
            variableExpenses: monthData.variableExpenses || []
        };
    };

    // Helper: Get Previous Month Data for Trends
    const getPreviousMonthData = () => {
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        let prevYear = currentYear;
        let prevMonth = currentMonth - 1;

        if (prevMonth < 0) {
            prevYear -= 1;
            prevMonth = 11;
        }

        // Parse DB safely
        const yearData = db[prevYear] || { months: {} };
        const monthData = yearData.months ? (yearData.months[prevMonth] || { fixedIncome: [], monthlyExpenses: [], variableExpenses: [] }) : { fixedIncome: [], monthlyExpenses: [], variableExpenses: [] };

        return {
            fixedIncome: monthData.fixedIncome || [],
            monthlyExpenses: monthData.monthlyExpenses || [],
            variableExpenses: monthData.variableExpenses || []
        };
    };

    const data = getDisplayData();
    const prevData = getPreviousMonthData();

    // Derived Totals
    const totalIncome = calculateTotal(data.fixedIncome);
    const totalFixedExpenses = calculateTotal(data.monthlyExpenses);
    const totalVariableExpenses = calculateTotal(data.variableExpenses);
    const totalExpenses = totalFixedExpenses + totalVariableExpenses;
    const savings = totalIncome - totalExpenses; // "Disponible"

    const prevTotalIncome = calculateTotal(prevData.fixedIncome);
    const prevTotalFixed = calculateTotal(prevData.monthlyExpenses);
    const prevTotalVariable = calculateTotal(prevData.variableExpenses || []);

    // Calculate Trends
    const calculateTrend = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0; // If nothing last month and something this month = 100% growth (symbolic)
        return Math.round(((current - previous) / previous) * 100);
    };

    const incomeTrend = calculateTrend(totalIncome, prevTotalIncome);
    const fixedExpenseTrend = calculateTrend(totalFixedExpenses, prevTotalFixed);
    const variableExpenseTrend = calculateTrend(totalVariableExpenses, prevTotalVariable);

    // Accounts Total
    const totalAccounts = accounts.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const formatCurrency = (val) => '$' + val.toLocaleString('es-CO');

    const value = {
        db, setDb,
        accounts, setAccounts,
        currentDate, setCurrentDate,
        updateDb,
        updateAccount,
        addAccount,
        removeAccount,
        data,
        totals: {
            income: totalIncome,
            fixedExpenses: totalFixedExpenses,
            variableExpenses: totalVariableExpenses,
            totalExpenses,
            savings,
            accountsTotal: totalAccounts
        },
        trends: {
            income: incomeTrend,
            fixedExpenses: fixedExpenseTrend,
            variableExpenses: variableExpenseTrend
        },
        formatCurrency,
        months: INITIAL_DB.months
    };

    return (
        <FinanceContext.Provider value={value}>
            {children}
        </FinanceContext.Provider>
    );
};
