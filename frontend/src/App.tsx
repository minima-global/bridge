import "./App.css";
import AppGrid from "./components/UI/appgrid";
import Dashboard from "./components/dashboard";
import Footer from "./components/footer";
import Header from "./components/header";

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
