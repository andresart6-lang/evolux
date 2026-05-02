import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

export function useTasks() {
    return useContext(TaskContext);
}

export function TaskProvider({ children }) {
    // ── Spaces (top-level tabs: Personal, Laboral, Proyectos, etc.) ──
    const [spaces, setSpaces] = useState(() => {
        const saved = localStorage.getItem('app_spaces');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'space_personal', name: 'Personal', color: '#3b82f6' },
            { id: 'space_work', name: 'Laboral', color: '#f97316' },
            { id: 'space_projects', name: 'Proyectos', color: '#a855f7' }
        ];
    });

    // ── Categories (Kanban columns within a space) ──
    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem('app_categories');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Migration: if old categories don't have spaceId, assign them to the first space
            return parsed.map(c => ({
                ...c,
                spaceId: c.spaceId || 'space_personal'
            }));
        }
        return [
            { id: 'cat_todo', name: 'Por Hacer', color: '#3b82f6', spaceId: 'space_personal' },
            { id: 'cat_in_progress', name: 'En Progreso', color: '#eab308', spaceId: 'space_personal' },
            { id: 'cat_done', name: 'Terminado', color: '#22c55e', spaceId: 'space_personal' },
            { id: 'cat_work_todo', name: 'Por Hacer', color: '#f97316', spaceId: 'space_work' },
            { id: 'cat_work_progress', name: 'En Progreso', color: '#eab308', spaceId: 'space_work' },
            { id: 'cat_work_done', name: 'Terminado', color: '#22c55e', spaceId: 'space_work' },
            { id: 'cat_proj_todo', name: 'Por Hacer', color: '#a855f7', spaceId: 'space_projects' },
            { id: 'cat_proj_progress', name: 'En Progreso', color: '#eab308', spaceId: 'space_projects' },
            { id: 'cat_proj_done', name: 'Terminado', color: '#22c55e', spaceId: 'space_projects' },
        ];
    });

    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('app_tasks');
        if (saved) return JSON.parse(saved);
        return [];
    });

    // Persist
    useEffect(() => {
        localStorage.setItem('app_spaces', JSON.stringify(spaces));
    }, [spaces]);

    useEffect(() => {
        localStorage.setItem('app_categories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem('app_tasks', JSON.stringify(tasks));
    }, [tasks]);

    // ── Space Methods ──
    const addSpace = (name, color) => {
        const spaceId = `space_${Date.now()}`;
        const newSpace = { id: spaceId, name, color };
        setSpaces([...spaces, newSpace]);
        // Auto-create default columns for the new space
        const defaultCats = [
            { id: `cat_${Date.now()}_1`, name: 'Por Hacer', color: '#3b82f6', spaceId },
            { id: `cat_${Date.now()}_2`, name: 'En Progreso', color: '#eab308', spaceId },
            { id: `cat_${Date.now()}_3`, name: 'Terminado', color: '#22c55e', spaceId },
        ];
        setCategories(prev => [...prev, ...defaultCats]);
        return newSpace;
    };

    const updateSpace = (id, updates) => {
        setSpaces(spaces.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const deleteSpace = (id) => {
        if (spaces.length <= 1) return; // Don't allow deleting the last space
        setSpaces(spaces.filter(s => s.id !== id));
        // Delete all categories and tasks belonging to this space
        const catIds = categories.filter(c => c.spaceId === id).map(c => c.id);
        setCategories(categories.filter(c => c.spaceId !== id));
        setTasks(tasks.filter(t => !catIds.includes(t.categoryId)));
    };

    // ── Categories Methods ──
    const addCategory = (name, color, spaceId) => {
        const newCat = { id: `cat_${Date.now()}`, name, color, spaceId };
        setCategories([...categories, newCat]);
        return newCat;
    };

    const updateCategory = (id, updates) => {
        setCategories(categories.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const deleteCategory = (id) => {
        setCategories(categories.filter(c => c.id !== id));
        setTasks(tasks.filter(t => t.categoryId !== id));
    };

    // ── Tasks Methods ──
    const addTask = (categoryId, title, description = '', date = null) => {
        const newTask = {
            id: `task_${Date.now()}`,
            categoryId,
            title,
            description,
            date,
            status: 'pending',
            checklist: []
        };
        setTasks([...tasks, newTask]);
        return newTask;
    };

    const updateTask = (id, updates) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const moveTask = (taskId, newCategoryId) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, categoryId: newCategoryId } : t));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const toggleTaskStatus = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
    };

    // ── Checklist Methods ──
    const addChecklistItem = (taskId, text) => {
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    checklist: [...t.checklist, { id: `chk_${Date.now()}`, text, isCompleted: false }]
                };
            }
            return t;
        }));
    };

    const toggleChecklistItem = (taskId, checklistId) => {
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    checklist: t.checklist.map(c => c.id === checklistId ? { ...c, isCompleted: !c.isCompleted } : c)
                };
            }
            return t;
        }));
    };

    const deleteChecklistItem = (taskId, checklistId) => {
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    checklist: t.checklist.filter(c => c.id !== checklistId)
                };
            }
            return t;
        }));
    };

    const value = {
        spaces,
        categories,
        tasks,
        addSpace,
        updateSpace,
        deleteSpace,
        addCategory,
        updateCategory,
        deleteCategory,
        addTask,
        updateTask,
        moveTask,
        deleteTask,
        toggleTaskStatus,
        addChecklistItem,
        toggleChecklistItem,
        deleteChecklistItem
    };

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
