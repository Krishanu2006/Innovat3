import { Routes, Route, Navigate } from 'react-router-dom';
import { useWeb3 } from './context/Web3Context';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';

function App() {
  const { account } = useWeb3();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/dashboard"
        element={account ? <Dashboard /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;