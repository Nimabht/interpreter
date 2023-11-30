import { useState } from "react";
import MathInterpreter from "./Helpers/mathInterpreter";
import EquationTable from "./components/EquationTable";
import Terminal, { ColorMode, TerminalOutput } from "react-terminal-ui";
import Plot from "./components/Plot";

function App() {
  const [equations, setEquations] = useState({});
  const [plot, setPlot] = useState({});
  const [terminalLineData, setTerminalLineData] = useState([
    <TerminalOutput>Welcome to the Dragon Terminal!</TerminalOutput>,
  ]);
  const handleExecute = (input) => {
    if (input === "") {
      setTerminalLineData((prev) => {
        return [...prev, <TerminalOutput>{`> ${input}`}</TerminalOutput>];
      });
      return;
    }
    if (input === "clear") {
      setTerminalLineData([]);
      return;
    }
    const interpreter = new MathInterpreter(equations);
    const result = interpreter.execute(input);
    if (!!result.dimension) {
      setPlot(result);
      setTerminalLineData((prev) => {
        return [...prev, <TerminalOutput>{`> ${input}`}</TerminalOutput>];
      });
      return;
    }
    setTerminalLineData((prev) => {
      return [
        ...prev,
        <TerminalOutput>{`> ${input}`}</TerminalOutput>,
        <TerminalOutput>{result}</TerminalOutput>,
      ];
    });
    setEquations({ ...interpreter.equations });
  };

  return (
    <div className="flex px-2 justify-center items-center gap-2">
      <div className="w-1/2 flex flex-col justify-between items-center px-2 pt-5 pb-1 h-screen">
        <EquationTable equations={equations} />
        <Plot plot={plot} />
      </div>
      <div className="w-1/2 py-5 h-screen">
        <Terminal
          name="Dragon Terminal"
          prompt="🐉 >"
          colorMode={ColorMode.Dark}
          onInput={(terminalInput) => handleExecute(terminalInput)}
        >
          {terminalLineData}
        </Terminal>
      </div>
    </div>
  );
}

export default App;
