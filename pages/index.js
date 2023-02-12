import { useState } from "react";
import Level1 from "./level1";
import Level2 from "./Level2";
import Level3 from "./Level3";
import live from "./live";
import {  BrowserRouter as Router, Route, Routes, Switch, useNavigate } from 'react-router-dom';

export default function Home() {
    const [level, setLevel] = useState(1);

    let currentLevel

    if (level === 1) {
        currentLevel = <Level1 level={level} setLevel={setLevel} />
    }
    else if (level === 2) {
        currentLevel = <Level2 level={level} setLevel={setLevel} />
    }
    else if (level === 3) {
        currentLevel = <Level3 level={level} setLevel={setLevel} />
    }
 
    return (
        <div>
            { currentLevel }
          <Router>
            <Routes> 
              <Route path="/live">
                <live />
              </Route>
            </Routes>
          </Router>
        </div>
    )
}