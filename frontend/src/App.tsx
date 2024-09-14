import "./App.css";
import AppGrid from "./components/UI/AppGrid";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";

function App() {
  return (
    <AppGrid>
      <Header />
      <Dashboard />
    </AppGrid>
  );
}

export default App;
