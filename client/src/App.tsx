import { BrowserRouter as Router, Routes} from "react-router-dom";
import AuthProvider from "./contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // data stays fresh for 5 minutes
      gcTime: 1000 * 60 * 10, // data is cached for 10 minutes
      refetchOnMount: "always"
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;