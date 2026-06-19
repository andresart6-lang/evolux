import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import * as spacesDb from '../services/spaces';
import * as categoriesDb from '../services/categories';
import * as tasksDb from '../services/tasks';
import * as checklistDb from '../services/checklist';

const TaskContext = createContext();

export function useTasks() {
    return useContext(TaskContext);
}

export function TaskProvider({ children }) {
    const { userId, isAuthenticated } = useAuth();
    const [spaces, setSpaces] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        if (!userId || !isAuthenticated) {
            setSpaces([]);
            setCategories([]);
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            let [spacesData, categoriesData, tasksData] = await Promise.all([
                spacesDb.getSpaces(userId),
                categoriesDb.getCategories(userId),
                tasksDb.getTasks(userId),
            ]);

            if (!spacesData || spacesData.length === 0) {
                const defaultSpace = await spacesDb.createSpace(userId, { name: 'Principal', color: '#3b82f6' });
                spacesData = [defaultSpace];

                const defaultCats = [
                    { name: 'Por Hacer', color: '#3b82f6', space_id: defaultSpace.id },
                    { name: 'En Progreso', color: '#eab308', space_id: defaultSpace.id },
                    { name: 'Terminado', color: '#22c55e', space_id: defaultSpace.id },
                ];

                const createdCats = [];
                for (const cat of defaultCats) {
                    const newCat = await categoriesDb.createCategory(userId, cat);
                    createdCats.push(newCat);
                }
                categoriesData = createdCats;
            }

            setSpaces(spacesData || []);
            setCategories(categoriesData || []);
            setTasks(tasksData || []);
        } catch (error) {
            console.error('Error loading task data:', error);
        } finally {
            setLoading(false);
        }
    }, [userId, isAuthenticated]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const addSpace = async (name, color) => {
        if (!userId) return null;
        try {
            const newSpace = await spacesDb.createSpace(userId, { name, color });
            setSpaces(prev => [...prev, newSpace]);

            const defaultCats = [
                { name: 'Por Hacer', color: '#3b82f6', space_id: newSpace.id },
                { name: 'En Progreso', color: '#eab308', space_id: newSpace.id },
                { name: 'Terminado', color: '#22c55e', space_id: newSpace.id },
            ];

            for (const cat of defaultCats) {
                const newCat = await categoriesDb.createCategory(userId, cat);
                setCategories(prev => [...prev, newCat]);
            }

            return newSpace;
        } catch (error) {
            console.error('Error adding space:', error);
            return null;
        }
    };

    const updateSpace = async (id, updates) => {
        if (!userId) return;
        try {
            await spacesDb.updateSpace(id, userId, updates);
            setSpaces(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        } catch (error) {
            console.error('Error updating space:', error);
        }
    };

    const deleteSpace = async (id) => {
        if (!userId || spaces.length <= 1) return;
        try {
            await spacesDb.deleteSpace(id, userId);
            const catsToDelete = categories.filter(c => c.space_id === id).map(c => c.id);
            setCategories(prev => prev.filter(c => c.space_id !== id));
            setTasks(prev => prev.filter(t => !catsToDelete.includes(t.category_id)));
            setSpaces(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting space:', error);
        }
    };

    const addCategory = async (name, color, spaceId) => {
        if (!userId) return null;
        try {
            const newCat = await categoriesDb.createCategory(userId, { name, color, space_id: spaceId });
            setCategories(prev => [...prev, newCat]);
            return newCat;
        } catch (error) {
            console.error('Error adding category:', error);
            return null;
        }
    };

    const updateCategory = async (id, updates) => {
        if (!userId) return;
        try {
            await categoriesDb.updateCategory(id, userId, updates);
            setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    const deleteCategory = async (id) => {
        if (!userId) return;
        try {
            await categoriesDb.deleteCategory(id, userId);
            setCategories(prev => prev.filter(c => c.id !== id));
            setTasks(prev => prev.filter(t => t.category_id !== id));
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const addTask = async (categoryId, title, description = '', date = null) => {
        if (!userId) return null;
        try {
            const newTask = await tasksDb.createTask(userId, {
                category_id: categoryId,
                title,
                description,
                date,
                status: 'pending',
            });
            setTasks(prev => [...prev, newTask]);
            return newTask;
        } catch (error) {
            console.error('Error adding task:', error);
            return null;
        }
    };

    const updateTask = async (id, updates) => {
        if (!userId) return;
        try {
            const dbUpdates = { ...updates };
            if (dbUpdates.categoryId) {
                dbUpdates.category_id = dbUpdates.categoryId;
                delete dbUpdates.categoryId;
            }
            await tasksDb.updateTask(id, userId, dbUpdates);
            setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const moveTask = async (taskId, newCategoryId) => {
        await updateTask(taskId, { category_id: newCategoryId });
    };

    const deleteTask = async (id) => {
        if (!userId) return;
        try {
            await tasksDb.deleteTask(id, userId);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const toggleTaskStatus = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        await updateTask(id, { status: newStatus });
    };

    const addChecklistItem = async (taskId, text) => {
        if (!userId) return null;
        try {
            const newItem = await checklistDb.addChecklistItem(userId, {
                task_id: taskId,
                text,
                is_completed: false,
            });
            setTasks(prev => prev.map(t => {
                if (t.id === taskId) {
                    return {
                        ...t,
                        checklist: [...(t.checklist || []), newItem],
                    };
                }
                return t;
            }));
            return newItem;
        } catch (error) {
            console.error('Error adding checklist item:', error);
            return null;
        }
    };

    const toggleChecklistItem = async (taskId, checklistId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const item = task.checklist?.find(c => c.id === checklistId);
        if (!item) return;

        try {
            await checklistDb.updateChecklistItem(checklistId, userId, { is_completed: !item.is_completed });
            setTasks(prev => prev.map(t => {
                if (t.id === taskId) {
                    return {
                        ...t,
                        checklist: t.checklist.map(c =>
                            c.id === checklistId ? { ...c, is_completed: !c.is_completed } : c
                        ),
                    };
                }
                return t;
            }));
        } catch (error) {
            console.error('Error toggling checklist item:', error);
        }
    };

    const deleteChecklistItem = async (taskId, checklistId) => {
        if (!userId) return;
        try {
            await checklistDb.deleteChecklistItem(checklistId, userId);
            setTasks(prev => prev.map(t => {
                if (t.id === taskId) {
                    return {
                        ...t,
                        checklist: t.checklist.filter(c => c.id !== checklistId),
                    };
                }
                return t;
            }));
        } catch (error) {
            console.error('Error deleting checklist item:', error);
        }
    };

    const value = {
        spaces,
        categories,
        tasks,
        loading,
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
        deleteChecklistItem,
        reload: loadData,
    };

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
