import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useUser } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { FinanceProvider } from './context/FinanceContext';
import { TaskProvider } from './context/TaskContext';
import Auth from './modules/Auth';
import MainLayout from './layout/MainLayout';
import Dashboard from './modules/Dashboard';
import Goals from './modules/Goals';
import Fitness from './modules/Fitness';
import Tasks from './modules/Tasks';
import Finance from './modules/Finance';
import Analytics from './modules/Analytics';
import Personalization from './modules/Personalization';
import Profile from './modules/Profile';
import { useEffect } from 'react';

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('home');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const renderContent = () => {
    switch (currentTab) {
      case 'home': return <Dashboard />;
      case 'wallet': return <Finance />;
      case 'goals': return <Goals />;
      case 'fitness': return <Fitness />;
      case 'tasks': return <Tasks />;
      case 'analytics': return <Analytics />;
      case 'personalization': return <Personalization />;
      case 'profile': return <Profile />;
      default: return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <MainLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderContent()}
    </MainLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <FinanceProvider>
          <TaskProvider>
            <AppRoutes />
          </TaskProvider>
        </FinanceProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;