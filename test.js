import nerdamer from "nerdamer/all.js";

const res = nerdamer("2x + 7 + x - 22y = 9x");

const res2 = nerdamer("-z-x").evaluate({z:"2",x:"-5"})

console.log(res2.toString());
// console.log(res);

// const variables = nerdamer(res.evaluate().toString()).variables();
// console.log(res2.evaluate().toString());
// console.log(variables);
