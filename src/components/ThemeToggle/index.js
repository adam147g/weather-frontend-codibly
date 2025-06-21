import React, { useContext } from 'react';
import './themeToggle.css';
import { DarkModeContext } from '../../context/DarkModeContext';

const ThemeToggle = () => {
  const { darkMode, dispatch } = useContext(DarkModeContext);

  const handleToggle = () => {
    dispatch({ type: "TOGGLE" });
  };

  return (
    <div className={`tdnn ${!darkMode ? 'day' : ''}`} onClick={handleToggle}>
      <div className={`moon ${!darkMode ? 'sun' : ''}`}></div>
    </div>
  );
};

export default ThemeToggle;