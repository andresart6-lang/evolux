import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { FinanceProvider } from './context/FinanceContext';
import { TaskProvider } from './context/TaskContext';
import MainLayout from './layout/MainLayout';
import Dashboard from './modules/Dashboard';
import Goals from './modules/Goals';
import Fitness from './modules/Fitness';
import Tasks from './modules/Tasks';

import Finance from './modules/Finance';
import Analytics from './modules/Analytics';
import Personalization from './modules/Personalization'; // Assuming this exists or will be lazily loaded if needed
import Profile from './modules/Profile';

function App() {
  const [currentTab, setCurrentTab] = useState('home');

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

  return (
    <ThemeProvider>
      <UserProvider>
        <FinanceProvider>
          <TaskProvider>
            <MainLayout currentTab={currentTab} onTabChange={setCurrentTab}>
              {renderContent()}
            </MainLayout>
          </TaskProvider>
        </FinanceProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
