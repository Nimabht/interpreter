import nerdamer from "nerdamer/all.min";
import range from "./range";
import * as mathjs from "mathjs";

class MathInterpreter {
  constructor(initialEquations = {}) {
    this.equations = {
      E1: "x+y+z=0",
      ...initialEquations,
    };
  }

  execute(text) {
    if (text.startsWith("SET")) {
      const res = this.handleSetCommand(text);
      return res;
    } else if (text.startsWith("EVAL")) {
      const res = this.handleEvalCommand(text);
      return res;
    } else if (text.startsWith("PRINTEQ")) {
      const res = this.handlePrintEquationCommand(text);
      return res;
    } else if (text.startsWith("PLOT")) {
      const res = this.handlePlotEquationCommand(text);
      return res;
    } else {
      return `Uncaught SyntaxError: Unexpected identifier '${
        text.split(" ")[0]
      }'`;
    }
  }

  handleSetCommand(text) {
    try {
      const [, equationName, expression] = text.split(" ");
      this.equations[equationName] = expression.trim();
      return `Equation ${equationName} stored: ${this.equations[equationName]}`;
    } catch (error) {
      return "Invalid SET command. Please use the format: SET EquationName expression";
    }
  }

  handleEvalCommand(text) {
    try {
      const [, equationName, variable] = text.split(" ");
      if (!variable) {
        return `Error executing EVAL command: variable parameter not found!`;
      }
      if (this.equations[equationName] !== undefined) {
        const result = this.evaluateExpression(
          this.equations[equationName],
          variable,
        );
        return `The Evaluation result: ${result}`;
      } else {
        return `Equation ${equationName} not found.`;
      }
    } catch (error) {
      return `Error executing EVAL command:, ${error}`;
    }
  }

  handlePrintEquationCommand(text) {
    try {
      const [, equationName] = text.split(" ");
      if (this.equations[equationName] !== undefined) {
        return `Stored Equation ${equationName}: ${this.equations[equationName]}`;
      } else {
        return `Equation ${equationName} not found.`;
      }
    } catch (error) {
      return "Invalid PRINTEQ command. Please use the format: PRINTEQ EquationName";
    }
  }

  evaluateExpression(equation, variable) {
    try {
      const result = nerdamer.solve(
        equation.replace("=", "-(").concat(")"),
        variable,
      );
      return result.toString().replace("[", "").replace("]", "");
    } catch (error) {
      return `Error evaluating expression "${equation}": ${error}`;
    }
  }

  handlePlotEquationCommand(text) {
    try {
      let [, equationName, scaleS, scaleE] = text.split(" ");
      scaleS = parseInt(scaleS);
      scaleE = parseInt(scaleE);
      if (!scaleS || !scaleE) {
        return "Invalid PLOT command. Please use the format: PLOT EquationName scaleS scaleE";
      }
      if (this.equations[equationName] !== undefined) {
        const equation = this.equations[equationName];
        const variables = this.variablesOfEquation(equation);
        if (variables.length == 1) {
          // const xValue = +nerdamer
          //   .solve(equation.replace("=", "-(").concat(")"), variables[0])
          //   .toString()
          //   .replace("[", "")
          //   .replace("]", "");
          const result = nerdamer
            .solve(equation.replace("=", "-(").concat(")"), variables[0])
            .toString()
            .replace(/\[|\]/g, "");

          const xValue = mathjs.evaluate(result);

          const xValues = Array((scaleE - scaleS) * 10).fill(xValue);
          const yValues = range(scaleS, scaleE, 0.1);
          return {
            dimension: 2,
            xValues,
            yValues,
          };
        } else if (variables.length == 2) {
          let xValues = [];
          let yValues = [];
          for (let i = scaleS; i < scaleE; i = i + 0.05) {
            let temp = {};
            temp[variables[0]] = i;
            const result = nerdamer(equation.replace("=", "-(").concat(")"))
              .evaluate(temp)
              .solveFor(variables[1])
              .toString();

            if (result.includes("i")) continue;

            if (result.includes(",")) {
              const answers = result.split(",");
              for (const answer of answers) {
                yValues.push(mathjs.evaluate(answer));
                xValues.push(i);
              }
              continue;
            }

            yValues.push(mathjs.evaluate(result));
            xValues.push(i);
          }
          return {
            dimension: 2,
            xValues,
            yValues,
          };
        } else if (variables.length == 3) {
          let xValues = [];
          let yValues = [];
          let zValues = [];
          let zMatrix = [];

          for (let i = scaleS; i < scaleE; i = i + 0.05) {
            let row = [];
            for (let j = scaleS; j < scaleE; j = j + 0.05) {
              xValues.push(i);
              yValues.push(j);
              let temp = {};
              temp[variables[0]] = i;
              temp[variables[1]] = j;
              const result = nerdamer(equation.replace("=", "-(").concat(")"))
                .evaluate(temp)
                .solveFor(variables[2])
                .toString();

              if (result.includes("i")) continue;

              if (result.includes(",")) {
                const answers = result.split(",");
                for (const answer of answers) {
                  row.push(mathjs.evaluate(answer));
                }
                continue;
              }
              row.push(mathjs.evaluate(result));
            }
            zMatrix.push(row);
          }
          return {
            dimension: 3,
            xValues,
            yValues,
            zValues,
            zMatrix,
          };
        } else {
          return "Unsupported Equation for PLOT command!";
        }
      } else {
        return `Equation ${equationName} not found.`;
      }
    } catch (error) {
      return "Invalid PLOT command. Please use the format: PLOT EquationName scaleS scaleE";
    }
  }

  variablesOfEquation(equation) {
    return nerdamer(equation.replace("=", "-(").concat(")")).variables();
  }
}

export default MathInterpreter;
