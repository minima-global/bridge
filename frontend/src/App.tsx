import "./App.css";
import AppGrid from "./components/UI/AppGrid";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import packageJson from "../package.json";

function App() {
  return (
    <AppGrid>
      <Header />
      <Dashboard />
      <footer><p className="text-right p-2 text-neutral-800 font-bold dark:text-neutral-400 text-xs">{packageJson.version}</p></footer>
    </AppGrid>
  );
}

export default App;
