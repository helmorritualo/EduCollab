import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState<{
    username: string;
    password: string;
  }>({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Add a check to ensure username and password are not empty
      if (!formData.username || !formData.password) {
        setError("Username and password are required");
        setIsLoading(false);
        return;
      }
      
      const success = await login(formData.username, formData.password);
      if (!success) {
        setError("Invalid username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        (err as Error).message ||
          (err as { response?: { data?: { error?: string } } }).response?.data
            ?.error ||
          "An error occurred during login. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error message when form data changes
  useEffect(() => {
    if (error) setError("");
  }, [formData, error]);

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-blue-800 via-blue-600 to-blue-400 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none">
            <circle cx="320" cy="80" r="120" fill="#fff" />
            <rect x="40" y="300" width="200" height="80" rx="40" fill="#fff" />
          </svg>
        </div>
        <div className="mb-6 z-10">
          <svg
            className="h-16 w-16 text-white drop-shadow-lg"
            fill="none"
            viewBox="0 0 48 48"
          >
            <rect x="8" y="8" width="32" height="32" rx="8" fill="#2563eb" />
            <path
              d="M16 24h16M24 16v16"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold mb-4 drop-shadow-lg z-10 tracking-tight">
          EduCollab
        </h1>
        <p className="text-lg mb-8 max-w-md text-blue-100 z-10 font-medium">
          Welcome to EduCollab, collaborative platform for modern
          education.
          <br />
          <span className="italic text-blue-200">
            Connect, learn, and grow together with teachers and students.
          </span>
        </p>
        <blockquote className="mb-8 text-blue-200 italic z-10">
          "Empowering education through collaboration."
        </blockquote>
        <ul className="space-y-3 text-blue-100 z-10">
          <li className="flex items-center gap-2">
            <span className="bg-white/20 rounded-full p-2">
              <svg
                className="h-5 w-5 text-green-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
            Real-time collaboration
          </li>
          <li className="flex items-center gap-2">
            <span className="bg-white/20 rounded-full p-2">
              <svg
                className="h-5 w-5 text-green-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
            Flexible learning tools
          </li>
        </ul>
      </div>
      {/* Right Side: Login Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-8 py-12 overflow-y-auto max-h-screen">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold text-blue-700 mb-6 text-center">
            Sign In
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium text-blue-700 mb-1"
                htmlFor="username"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-blue-700 mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675m2.062 2.062A9.956 9.956 0 012 9c0 5.523 4.477 10 10 10 1.657 0 3.236-.336 4.675-.938m-2.062-2.062A9.956 9.956 0 0022 15c0-5.523-4.477-10-10-10-1.657 0-3.236.336-4.675.938"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition flex items-center justify-center"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              ) : null}
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-blue-500">
            Don&apos;t have an account?{" "}
            <Link to="/register"  className="underline cursor-pointer hover:text-blue-700">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
