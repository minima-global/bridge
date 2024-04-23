import BridgeWidget from "../BridgeWidget";
import Navigation from "../BridgeWidget/Navigation";
import ContentGrid from "../UI/ContentGrid";

const Dashboard = () => {
  return (
    <main>
      <ContentGrid>
        <Navigation />
        <BridgeWidget />
      </ContentGrid>
    </main>
  );
};

export default Dashboard;
