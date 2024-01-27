import Plotly from "plotly.js";
import { useEffect } from "react";

const Plot = ({ plot }) => {
  useEffect(() => {
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
        marker: {
          size: 6,
        },
      };

      Plotly.newPlot("plot", [trace], layout);
    }

    if (plot.dimension === 3) {
      const trace = {
        x: plot.xValues,
        y: plot.yValues,
        z: plot.zValues,
        type: "scatter3d",
        mode: "markers",
        marker: {
          size: 6,
        },
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
          x: 1.5,
          y: 1.5,
          z: 1.5,
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
