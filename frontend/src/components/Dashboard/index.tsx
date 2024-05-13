import AppLoading from "../AppLoading";
import BridgeWidget from "../BridgeWidget";
import Navigation from "../BridgeWidget/Navigation";
import Favorites from "../Favorites";
import ReadMode from "../ReadMode";
import Settings from "../Settings";
import ContentGrid from "../UI/ContentGrid";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  return (
    <main className="h-full">
      <ReadMode />
      <ToastContainer />
      <Settings />
      <Favorites form={false} />
      <AppLoading />
      <ContentGrid>
        <Navigation />
        <BridgeWidget />
      </ContentGrid>
    </main>
  );
};

export default Dashboard;
