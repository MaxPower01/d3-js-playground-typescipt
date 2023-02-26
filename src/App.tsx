import "./App.css";
import defaultParams from "./modules/RacingBarChart/defaultRacingBarChartParams";
import RacingBarChart from "./modules/RacingBarChart/RacingBarChart";

function App() {
  return (
    <div className="App">
      <RacingBarChart params={defaultParams} />
    </div>
  );
}

export default App;
