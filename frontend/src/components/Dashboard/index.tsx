import ActivitiesPage from "../Activities";
import AppLoading from "../AppLoading";
import BridgeWidget from "../BridgeWidget";
import Allowance from "../BridgeWidget/Allowance";
import Navigation from "../BridgeWidget/Navigation";
import DatabaseLocked from "../DatabaseLocked";
import Favorites from "../Favorites";
import Help from "../Help";
import ReadMode from "../ReadMode";
import Settings from "../Settings";
import ContentGrid from "../UI/ContentGrid";

import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  return (
    <main className="h-full">
      <ReadMode />
      <Help />
      <Settings />
      <DatabaseLocked />
      <Favorites />
      <ActivitiesPage />
      <AppLoading />
      <ContentGrid>
        <Navigation />
        <Allowance />
        <BridgeWidget />
      </ContentGrid>
    </main>
  );
};

export default Dashboard;
