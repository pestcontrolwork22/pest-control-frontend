import { Routes, Route, BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/user/Home";
import { Layout } from "./components/common/Layout";
import Contract from "./pages/user/Contract";
import ContractView from "./components/ContractView";
import JobViewPage from "./components/JobView";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="/Contracts" element={<Contract />} />
            <Route path="/contracts/:id" element={<ContractView />} />
            <Route
              path="/contracts/:id/jobs/:jobId"
              element={<JobViewPage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
