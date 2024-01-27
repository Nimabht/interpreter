export default (str) => {
  const pairs = str.split(",").map((entry) => entry.trim());
  const result = pairs.reduce((equation, pair, index, array) => {
    if (index % 2 === 0 && index + 1 < array.length) {
      equation += `${pair}=${array[index + 1]} `;
    }
    return equation;
  }, "");

  return result.trim();
};
