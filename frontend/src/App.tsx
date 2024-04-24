import "./App.css";
import AppGrid from "./components/UI/AppGrid";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import Header from "./components/Header";

function App() {


  return (
    <AppGrid>
      <Header />
      <Dashboard />
      <Footer />
    </AppGrid>
  );
}

export default App;
