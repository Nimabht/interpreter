import { useState } from "react";
import MathInterpreter from "./Helpers/Interpreter/mathInterpreter";
import EquationTable from "./components/EquationTable";
import Terminal, { ColorMode, TerminalOutput } from "react-terminal-ui";
import Plot from "./components/Plot";

const interpreter = new MathInterpreter();

function App() {
  const [equations, setEquations] = useState({});
  const [plot, setPlot] = useState({});
  const [solvationId, setSolvationId] = useState("");
  const [terminalLineData, setTerminalLineData] = useState([
    <TerminalOutput>Welcome to the Dragon Terminal!</TerminalOutput>,
  ]);
  const handleExecute = async (input) => {
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
    if (input.startsWith("PROVIDE")) {
      const provider = input.split(" ").slice(1);
      const inputt = `EXSOLVE ${solvationId} ${provider}`;
      const result = await interpreter.execute(inputt);
      setTerminalLineData((prev) => {
        return [
          ...prev,
          <TerminalOutput>{`> ${input}`}</TerminalOutput>,
          <TerminalOutput>{result}</TerminalOutput>,
        ];
      });
      return;
    }
    // const interpreter = new MathInterpreter(equations);
    const result = await interpreter.execute(input);
    if (!!result.dimension) {
      setPlot(result);
      setTerminalLineData((prev) => {
        return [...prev, <TerminalOutput>{`> ${input}`}</TerminalOutput>];
      });
      return;
    }
    if (!!result.solvationId) {
      setSolvationId(result.solvationId);
      setTerminalLineData((prev) => {
        return [
          ...prev,
          <TerminalOutput>{`> ${input}`}</TerminalOutput>,
          <TerminalOutput>{result.message}</TerminalOutput>,
        ];
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
          onInput={async (terminalInput) => await handleExecute(terminalInput)}
        >
          {terminalLineData}
        </Terminal>
      </div>
    </div>
  );
}

export default App;
