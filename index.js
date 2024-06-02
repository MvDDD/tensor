const fs = require("fs");
const Tensor = require("./tensor.js")

function diff(a, b) {
	return Math.abs(a - b);
}

let model = new Tensor({ nodes: [1, 1, 1] }, "qua");

;(async()=>{
	let corr = 0
	let wrong = 0
	while (corr + wrong < 1000){
for (let i = 0; i < 100; i += 1){
	await model.train([i], 100, 0.1);
	model.select((a, b) => {
		return diff(a.in[0], a.out[0]) < diff(b.in[0], b.out[0]);
	});
	let p = [model.run([i])[0], parseFloat(i) ** 2]
	console.log(p, Math.round(p[0]*1000) == Math.round(p[1]*1000))
	if (Math.round(p[0]*1000) == Math.round(p[1]*1000)){corr += 1}else{wrong += 1}
		if (((corr/wrong) <100000 )&&(corr > 1000)) break
}
}
let r1 = []
for (let i = 0; i < 10; i += 0.01) {
	let p = [model.run([i])[0], i]
	r1.push([Math.round(p[0]*10) == Math.round(p[1]*10), p])
}
fs.writeFileSync("model.json", JSON.stringify(model.GET_model(), null, 4), ()=>{})
r1.forEach((run) => {console.log(((run)))});

})()