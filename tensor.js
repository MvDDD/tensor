class Tensor {
	constructor(arch, type) {
		if (arch.path) {
			let model = JSON.parse(require('fs').readFileSync(arch.path, "utf-8"));
			this.nodes = model.nodes;
			this.paths = model.paths;
		} else {
			let nodes = Array.from({ length: arch.nodes.length });
			nodes = nodes.map((_, i) => Array.from({ length: arch.nodes[i] }).fill(0));
			this.nodes = nodes;
			if (arch.paths) {
				this.paths = arch.paths.map(layer => {
					return layer.map(path => {
						if (path.length !== 3) {
							path.push(Math.random() - 0.5);
						}
						return path;
					});
				});
			} else {
				let paths = [];
				for (let i = 0; i < arch.nodes.length - 1; i++) {
					const layer = [];
					for (let j = 0; j < arch.nodes[i]; j++) {
						for (let k = 0; k < arch.nodes[i + 1]; k++) {
							layer.push([j, k, Math.random(), type]);
						}
					}
					paths.push(layer);
				}
				this.paths = paths;
			}
		}
	}
	async train(input, runs, loss) {
		let output = [];
		let promises = []
		output.push({ in: input, out: this.run(input), paths:this.paths })
		for (let epoch = 0; epoch < runs; epoch++) {
			promises.push(new Promise((res)=>{
				let nodes = JSON.parse(JSON.stringify(this.nodes));
				let paths = this.mutate(JSON.parse(JSON.stringify(this.paths)), epoch/1000);
				if (nodes[0].length !== input.length) throw "invalid input";
				input.forEach((val, i) => {
					nodes[0][i] = val;
				});
				paths.forEach((layer, i) => {
					layer.forEach(path => {
						nodes[i + 1][path[1]] += this.nodeCalc(nodes[i][path[0]], path[2], path[3]);
					});
				});
				output.push({ in: input, out: nodes[nodes.length - 1], paths });
				res()
			}))
		}
		await Promise.all(promises)
		this.results = output;
	}
	mutate(paths, loss) {
		return paths.map(layer =>
			layer.map(path =>
				[path[0], path[1], path[2] + ((Math.random()-0.5) * loss)]
				)
			);
	}
	nodeCalc(prev, val, type){
		switch (type){
		case "lin":
			return prev * val
		case "qua":
			return prev * (val**2)
		case "sig":
			const sig = 1 / (1 + Math.exp(-(prev * val)));
			return sig * (1 - sig);
		case "mod":
			return prev % val
		case "sin":
			return Math.sin(prev/val)
		case "cos":
			return Math.cos(prev/val)
		case "tan":
			return Math.tan(prev/val)
		default:
			return this.nodeCalc(prev, val, "lin")
		}
	}
	select(func) {
		this.paths = this.results.reduce((a, b) => func(a, b) ? a : b).paths
	}
	run(input) {
		let nodes = JSON.parse(JSON.stringify(this.nodes));
		let paths = JSON.parse(JSON.stringify(this.paths));
		if (nodes[0].length !== input.length) throw "invalid input";
		input.forEach((val, i) => {
			nodes[0][i] = val;
		});
		paths.forEach((layer, i) => {
			layer.forEach(path => {
				nodes[i + 1][path[1]] += this.nodeCalc(nodes[i][path[0]], path[2]);
			});
		});
		return nodes[nodes.length - 1];
	}
	GET_model() {
		return { nodes: this.nodes, paths: this.paths };
	}
}
module.exports = Tensor