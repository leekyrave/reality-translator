import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
//   const tokenPreview = localStorage.getItem("token"); // for debugging, show saved token

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              ✓ Logged in
            </span>
          </div>

          {/* Token — for debugging */}
          {/* {tokenPreview && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">
                JWT token saved
              </p>
              <p className="text-xs text-gray-700 font-mono break-all">
                {tokenPreview}
              </p>
            </div>
          )} */}

          <p className="text-gray-500 text-sm mb-6">
            Authorization was successful. The token is stored in{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
              Cookies
            </code>
            .
          </p>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white
                       font-medium rounded-xl text-sm transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;