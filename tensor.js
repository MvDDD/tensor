class Tensor {
	constructor(arch) {
		if (arch.path) {
			// Load model configuration from a JSON file
			let model = JSON.parse(require('fs').readFileSync(arch.path, "utf-8"));
			this.nodes = model.nodes;
			this.paths = model.paths;
		} else {
			// Initialize nodes based on arch.nodes
			let nodes = Array.from({ length: arch.nodes.length });
			nodes = nodes.map((_, i) => Array.from({ length: arch.nodes[i] }).fill(0));
			this.nodes = nodes;

			// Initialize paths either from provided arch or randomly
			if (arch.paths) {
				this.paths = arch.paths;
			} else {
				let paths = [];
				for (let i = 0; i < arch.nodes.length - 1; i++) {
					const layer = [];
					for (let j = 0; j < arch.nodes[i]; j++) {
						for (let k = 0; k < arch.nodes[i + 1]; k++) {
							layer.push([j, k, Math.random()]);
						}
					}
					paths.push(layer);
				}
				this.paths = paths;
			}
		}
	}

	train(input, runs, loss) {
		let output = [];
		output.push({ in: input, out: this.run(input), paths:this.paths })
		for (let epoch = 0; epoch < runs; epoch++) {
			let nodes = JSON.parse(JSON.stringify(this.nodes));
			let paths = this.mutate(JSON.parse(JSON.stringify(this.paths)), loss);

			// Validate input length
			if (nodes[0].length !== input.length) throw "invalid input";

			// Initialize input layer
			input.forEach((val, i) => {
				nodes[0][i] = val;
			});

			// Forward propagation through layers
			paths.forEach((layer, i) => {
				layer.forEach(path => {
					nodes[i + 1][path[1]] += this.nodeCalc(nodes[i][path[0]], path[2]);
				});
			});

			// Collect output results
			output.push({ in: input, out: nodes[nodes.length - 1], paths });
		}
		this.results = output;
	}

	mutate(paths, loss) {
		return paths.map(layer =>
			layer.map(path =>
				[path[0], path[1], path[2] + (Math.random() * loss - loss / 2)]
			)
		);
	}

	nodeCalc(prev, val){
		return prev | val
	}

	select(func) {
		// Select the best path based on a comparison function
		this.paths = this.results.reduce((a, b) => func(a, b) ? a : b).paths
	}

	run(input) {
		let nodes = JSON.parse(JSON.stringify(this.nodes));
		let paths = JSON.parse(JSON.stringify(this.paths));

		// Validate input length
		if (nodes[0].length !== input.length) throw "invalid input";

		// Initialize input layer
		input.forEach((val, i) => {
			nodes[0][i] = val;
		});

		// Forward propagation through selected path
		paths.forEach((layer, i) => {
			layer.forEach(path => {
				nodes[i + 1][path[1]] += this.nodeCalc(nodes[i][path[0]], path[2]);
			});
		});
		return nodes[nodes.length - 1];
	}

	GET_model() {
		// Return current configuration of nodes and paths
		return { nodes: this.nodes, paths: this.paths };
	}
}

module.exports = Tensor