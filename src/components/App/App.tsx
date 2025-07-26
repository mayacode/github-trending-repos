import MainLayout from '../MainLayout/MainLayout';
import './App.css';
import { useDarkMode } from './useDarkMode';

function App() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
}

export default App;
