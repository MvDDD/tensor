const fs = require("fs");
const Tensor = require("./tensor.js")

function diff(a, b) {
	return Math.abs(a - b);
}

let model = new Tensor({ nodes: [1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1] });
let model2 = new Tensor({ nodes: [1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1]});
model.nodeCalc = (prev, val)=>{return (prev +1) * val}
model2.nodeCalc = (prev, val)=>{return (prev +1) * val}
console.log("{")
for (let i = 0; i < 10; i += 0.01) {
	model.train([i], 100, 0.1);
	model2.train([i], 100, 100);
	model.select((a, b) => {
		return diff(a.in[0], a.out[0]) > diff(b.in[0], b.out[0]);
	});
	model2.select((a, b) => {
		return diff(a.in[0], a.out[0]) < diff(b.in[0], b.out[0]);
	});
	console.log([model.run([i])[0] - i, model2.run([i])[0] - i])
}
console.log("}")
let r1 = []
let r2 = []
for (let i = 0; i < 10; i += 0.1) {
	let run1 = model.run([i])
	let run2 = model2.run([i])
	r1.push(run1[0])
	r2.push(run2[0])
}
r1.forEach((run) => {console.log(((run)))});
r2.forEach((run) => {console.log(((run)))});

console.log(model.paths, model2.paths)