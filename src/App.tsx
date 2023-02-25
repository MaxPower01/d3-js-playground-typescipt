import { useState } from "react";
import "./App.css";
import RacingBarChart from "./modules/RacingBarChart/RacingBarChart";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <RacingBarChart />
    </div>
  );
}

export default App;
