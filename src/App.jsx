import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import PatientForm from './components/PatientForm';
import SqlQueryExecutor from './components/SqlQueryExecutor';

function MainMenu() {
  const navigate = useNavigate();

  return (
    <div className="main-menu">
      <h1 className="animated-heading">Welcome. . . !</h1>

      <div className="button-container">
        <button className="nav-button primary" onClick={() => navigate('/form')}>
          Patient Registration Form
        </button>
        <button className="nav-button secondary" onClick={() => navigate('/query')}>
          Query Existing Records
        </button>
      </div>
    </div>
  );
}

function PageWrapper({ children }) {
  const navigate = useNavigate();
  return (
    <div className="full-screen">
      {children}
      <button className="nav-button" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
        Back to Main Menu
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route
          path="/form"
          element={
            <PageWrapper>
              <PatientForm />
            </PageWrapper>
          }
        />
        <Route
          path="/query"
          element={
            <PageWrapper>
              <SqlQueryExecutor />
            </PageWrapper>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;