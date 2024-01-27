import nerdamer from "nerdamer/all.min";
import range from "../range";
import * as mathjs from "mathjs";
import convertStringToEq from "../convertStringToEq";
import axios from "axios";
import lexer from "./lexer";

class MathInterpreter {
  constructor(initialEquations = {}) {
    this.equations = {
      ...initialEquations,
    };

    this.solvations = [];

    this.cache = {};
  }

  async execute(text) {
    const command = lexer(text, "command");
    if (command === "SET") {
      const res = await this.handleSetCommand(text);
      return res;
    } else if (command === "EVAL") {
      const res = await this.handleEvalCommand(text);
      return res;
    } else if (command === "SOLVE") {
      const res = await this.handleSolveCommand(text);
      return res;
    } else if (command === "EXSOLVE") {
      const res = await this.handleEXSolveCommand(text);
      return res;
    } else if (command === "PRINTEQ") {
      const res = await this.handlePrintEquationCommand(text);
      return res;
    } else if (command === "PLOT") {
      const res = await this.handlePlotEquationCommand(text);
      return res;
    } else if (command === "LOAD") {
      const res = await this.handleLoadCommand(text);
      return res;
    } else if (command === "SAVE") {
      const res = await this.handleSaveCommand(text);
      return res;
    } else if (command === "MULSOLVE") {
      const res = await this.handleMultiSolveCommand(text);
      return res;
    } else if (command === "READFS") {
      const res = await this.handleReadFsCommand(text);
      return res;
    } else {
      return `Uncaught SyntaxError: Unexpected identifier '${
        text.split(" ")[0]
      }'`;
    }
  }

  async handleReadFsCommand(text) {
    try {
      // const [, name] = text.split(" ");
      const [name] = lexer(text, "parameters");
      const response = await axios.get(`http://localhost:3000/${name}`);
      const json = response.data;
      this.equations = { ...this.equations, ...json };
      return `Equations loaded from ${name}`;
    } catch (error) {
      console.log(error);
      return "Somthing went wrong during reading file!";
    }
  }

  async handleSolveCommand(text) {
    try {
      // const [, equationName, innerVariable] = text.split(" ");
      const [equationName, innerVariable] = lexer(text, "parameters");

      if (this.equations[equationName] !== undefined) {
        const result = await this.evaluateExpression(
          this.equations[equationName],
          innerVariable,
        );
        console.log(result);
        const outerVariables = nerdamer(result).variables();
        const solvation = {
          id: Math.random().toString(32),
          expression: result,
          outerVariables,
        };
        this.solvations.push(solvation);
        return {
          message: `Provide outer variabe values ${outerVariables}`,
          solvationId: solvation.id,
        };
        // return solvation
      } else {
        return `Equation ${equationName} not found.`;
      }
    } catch (error) {
      console.log(error);
      return "Invalid SOLVE command. Please use the format: SOLVE E1 FOR INNER_VARIABLE";
    }
  }

  async handleEXSolveCommand(text) {
    try {
      // const [, solvationId, provider] = text.split(" ");
      const [solvationId, provider] = lexer(text, "parameters");

      const solvation = this.solvations.find(
        (solvation) => solvation.id === solvationId,
      );
      let keyValuePairs = text.split(" ").slice(2);
      var khkh = keyValuePairs[0].split(",");

      var resultObject = {};

      khkh.forEach(function (pair) {
        var parts = pair.split("=");
        resultObject[parts[0]] = parts[1];
      });

      const result = nerdamer(solvation.expression).evaluate(resultObject);
      console.log(result.toString());
      return result.toString();
    } catch (error) {
      console.log(error);
      return "Invalid PROVIDE command. Please use the format: PROVIDE <PROVIDE_OBJ>";
    }
  }

  async handleSetCommand(text) {
    try {
      // const [, equationName, expression] = text.split(" ");
      const [equationName, expression] = lexer(text, "parameters");

      this.equations[equationName] = expression.trim();
      return `Equation ${equationName} stored: ${this.equations[equationName]}`;
    } catch (error) {
      return "Invalid SET command. Please use the format: SET EquationName expression";
    }
  }

  async handleEvalCommand(text) {
    try {
      // const [, equationName, variable] = text.split(" ");
      const [equationName, variable] = lexer(text, "parameters");

      if (!variable) {
        return `Error executing EVAL command: variable parameter not found!`;
      }
      if (this.equations[equationName] !== undefined) {
        const result = await this.evaluateExpression(
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

  async handlePrintEquationCommand(text) {
    try {
      // const [, equationName] = text.split(" ");
      const [equationName] = lexer(text, "parameters");

      if (this.equations[equationName] !== undefined) {
        return `Stored Equation ${equationName}: ${this.equations[equationName]}`;
      } else {
        return `Equation ${equationName} not found.`;
      }
    } catch (error) {
      return "Invalid PRINTEQ command. Please use the format: PRINTEQ EquationName";
    }
  }

  async handleMultiSolveCommand(text) {
    try {
      // const [, ...equationNames] = text.split(" ");
      const [...equationNames] = lexer(text, "parameters");

      const expressions = equationNames.map((name) => this.equations[name]);
      var sol = nerdamer.solveEquations(expressions);
      return convertStringToEq(sol.toString());
    } catch (error) {
      console.log(error);
      return "Invalid MULSOLVE command. Please use the format: MULSOLVE <Expressions>";
    }
  }

  async evaluateExpression(equation, variable) {
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

  async handlePlotEquationCommand(text) {
    try {
      let [equationName, scaleS, scaleE] = lexer(text, "parameters");

      scaleS = parseInt(scaleS);
      scaleE = parseInt(scaleE);
      const cached_plot = this.cache[
        `${this.equations[equationName]}_${scaleS}_${scaleE}`
      ];
      if (!!cached_plot) return cached_plot;
      if (!scaleS || !scaleE) {
        return "Invalid PLOT command. Please use the format: PLOT EquationName scaleS scaleE";
      }
      if (this.equations[equationName] !== undefined) {
        const equation = this.equations[equationName];
        const variables = await this.variablesOfEquation(equation);
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
          // let zMatrix = [];

          for (let i = scaleS; i < scaleE; i = i + 0.15) {
            // let row = [];
            for (let j = scaleS; j < scaleE; j = j + 0.15) {
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
                  xValues.push(i);
                  yValues.push(j);
                  zValues.push(mathjs.evaluate(answer));
                }
                continue;
              }

              zValues.push(mathjs.evaluate(result));
              xValues.push(i);
              yValues.push(j);
            }
            // zMatrix.push(row);
          }
          this.cache[`${equation}_${scaleS}_${scaleE}`] = {
            dimension: 3,
            xValues,
            yValues,
            zValues,
          };
          return {
            dimension: 3,
            xValues,
            yValues,
            zValues,
            // zMatrix,
          };
        } else {
          return "Unsupported Equation for PLOT command!";
        }
      } else {
        return `Equation ${equationName} not found.`;
      }
    } catch (error) {
      return String(error);
    }
  }

  async variablesOfEquation(equation) {
    return nerdamer(equation.replace("=", "-(").concat(")")).variables();
  }

  async handleLoadCommand() {
    try {
      const savedEquations =
        JSON.parse(localStorage.getItem("equations")) || {};
      const savedCaches = JSON.parse(localStorage.getItem("caches")) || {};
      this.equations = { ...this.equations, ...savedEquations };
      this.cache = { ...this.cache, ...savedCaches };
      return "Equations and caches loaded from local storage.";
    } catch (error) {
      return "Error loading equations from local storage.";
    }
  }

  async handleSaveCommand() {
    try {
      localStorage.setItem("equations", JSON.stringify(this.equations));
      localStorage.setItem("caches", JSON.stringify(this.cache));
      return "Equations saved to local storage.";
    } catch (error) {
      return "Error saving equations to local storage.";
    }
  }
}

export default MathInterpreter;
