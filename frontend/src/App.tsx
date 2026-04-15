import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import WorkspacePage from "./pages/WorkspacePage";
import SimplificationRulesPage from "./pages/SimplificationRulesPage.tsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />


          {/*/!* Routes for testing *!/*/}
          {/*<Route path="/dashboard" element={<DashboardPage />} />*/}
          {/*<Route path="/workspace" element={<WorkspacePage />} />*/}
          {/*<Route path="/cards" element={<SimplificationRulesPage />} />*/}
          {/*/!* Protected routes *!/*/}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/workspace"
            element={
              <ProtectedRoute>
                <WorkspacePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cards"
            element={
              <ProtectedRoute>
                <SimplificationRulesPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;