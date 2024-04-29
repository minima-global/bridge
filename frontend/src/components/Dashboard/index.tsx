import BridgeWidget from "../BridgeWidget";
import Navigation from "../BridgeWidget/Navigation";
import ContentGrid from "../UI/ContentGrid";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  return (
    <main>
      <ToastContainer />
      <ContentGrid>
        <Navigation />
        <BridgeWidget />
      </ContentGrid>
    </main>
  );
};

export default Dashboard;
