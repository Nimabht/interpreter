export default function (start, end, step = 1) {
  if (arguments.length === 1) {
    end = start;
    start = 0;
  }

  const result = [];
  if (start < end && step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
  } else if (start > end && step < 0) {
    for (let i = start; i > end; i += step) {
      result.push(i);
    }
  }

  return result;
}
