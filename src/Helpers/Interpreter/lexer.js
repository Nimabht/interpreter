export default (input, field) => {
  if (field === "command") {
    return input.split(" ")[0];
  }
  if (field === "parameters") {
    const splitArray = input.split(" ");
    splitArray.shift();
    return splitArray;
  }
};
