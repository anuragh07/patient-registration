import { useState, useEffect } from 'react';
import PatientForm from "./components/PatientForm";
import SqlQueryExecutor from "./components/SqlQueryExecutor";

function App() {
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('currentView') || 'menu';
  });

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  return (
    <div className="full-screen">
      {currentView === 'form' && <PatientForm />}
      {currentView === 'query' && <SqlQueryExecutor />}

      {(currentView === 'form' || currentView === 'query') && (
        <button
          className="nav-button"
          onClick={() => setCurrentView('menu')}
          style={{ marginTop: '20px' }}
        >
          Back to Main Menu
        </button>
      )}

      {currentView === 'menu' && (
        <div className="main-menu">
          <h1 className="animated-heading">Welcome!</h1>

          <div className="button-container">
            <button
              className="nav-button primary"
              onClick={() => setCurrentView('form')}
            >
              Patient Registration Form
            </button>
            <button
              className="nav-button secondary"
              onClick={() => setCurrentView('query')}
            >
              Query Existing Records
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
