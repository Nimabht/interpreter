import Plotly from "plotly.js";
import { useEffect } from "react";

const Plot = ({ plot }) => {
  useEffect(() => {
    console.log(plot);

    const layout = {
      autosize: false,
      width: 500,
      height: 500,
    };

    if (plot.dimension === 2) {
      const trace = {
        x: plot.xValues,
        y: plot.yValues,
        type: "scatter",
        mode: "markers",
      };

      Plotly.newPlot("plot", [trace], layout);
    }

    if (plot.dimension === 3) {
      console.log(plot);
      const trace = {
        z: plot.zMatrix,
        type: "surface",
      };

      layout.scene = {
        aspectmode: "manual",
        aspectratio: {
          x: 1,
          y: 1,
          z: 1,
        },
      };

      layout.scene.camera = {
        eye: {
          x: 1.25,
          y: 1.25,
          z: 0.5,
        },
        center: {
          x: 0,
          y: 0,
          z: 0,
        },
      };

      Plotly.newPlot("plot", [trace], layout);
    }
  }, [plot]);

  return (
    <div className="p-4">
      <div id="plot" className="rounded-[5px] overflow-hidden"></div>
    </div>
  );
};

export default Plot;
