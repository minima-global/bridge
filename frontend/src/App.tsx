import "./App.css";
import AppGrid from "./components/UI/AppGrid";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <AppGrid>
      <Header />
      <ErrorBoundary>
        <Dashboard />
      </ErrorBoundary>
      <Footer />
    </AppGrid>
  );
}

export default App;
