import Layer from './Layer';

function Conv2d(config) {

	Layer.call(this, config);

	console.log("construct Conv2d");

	this.kernelSize = config.kernelSize;
	this.filters = config.filters;
	this.strides = config.strides;
	this.fmShape = undefined;
	this.width = undefined;
	this.height = undefined;
	this.fmCenters = [];
	this.depth = config.filters;
	this.layerType = "conv2d";

}

Conv2d.prototype = Object.assign(Object.create(Layer.prototype), {

	init: function (center) {

		console.log("init conv2d");

		this.center = center;
		this.fmCenters = calculateFmCenters(this.filters);

		let initX = -this.width / 2;
		let initY = -this.height / 2;

		let count = 0;

		this.neuralGroup = new THREE.Group();
		this.neuralGroup.position.set(this.center.x, this.center.y, this.center.z);

		for (let i = 0; i < this.filters; i++) {

			let fmCenter = this.fmCenters[i];

			for (let j = 0; j < this.width; j++) {

				for (let k = 0; k < this.height; k++) {

					let geometry = new THREE.BoxGeometry(1, 1, 1);
					let material = new THREE.MeshBasicMaterial({
						color: 0xffffff,
						shading: THREE.FlatShading,
						vertexColors: THREE.VertexColors,
						transparent: true
					});

					let cube = new THREE.Mesh(geometry, material);

					this.neuralList.push(cube);

					cube.position.set(1.3 * (j + initX) + fmCenter.x, fmCenter.y, 1.3 * (k + initY) + fmCenter.z);
					cube.elementType = "neural";
					cube.layerIndex = this.layerIndex;
					cube.positionIndex = count;
					count++;

					this.neuralGroup.add(cube);

				}

			}

			this.scene.add(this.neuralGroup);

		}

		function calculateFmCenters(filters) {

			let fmCenters = [];

			let initXTranslate = -40 * (filters - 1) / 2;

			for (let i = 0; i < filters; i++) {

				let xTranslate = initXTranslate + 40 * i;
				let fmCenter = {};
				fmCenter.x = xTranslate;
				fmCenter.y = 0;
				fmCenter.z = 0;
				fmCenters.push(fmCenter);

			}

			return fmCenters;

		}

	},

	assemble: function (layerIndex) {

		console.log("Assemble conv2d, layer index: " + layerIndex);

		this.layerIndex = layerIndex;

		this.inputShape = this.lastLayer.outputShape;
		this.width = (this.inputShape[0] - this.kernelSize) / this.strides + 1;
		this.height = (this.inputShape[1] - this.kernelSize) / this.strides + 1;
		this.fmShape = [this.width, this.height];
		this.outputShape = [this.width, this.height, this.filters];

	},

	calculateRelativeIndex: function (positionIndex) {

		let neuralIndexList = [];

		let [xStart, yStart] = this.calculateInputXYFromIndex(positionIndex);

		for (let i = 0; i < this.kernelSize; i++) {
			for (let j = 0; j < this.kernelSize; j++) {

				for (let k = 0; k < this.lastLayer.depth; k++) {
					let neuralIndex = xStart + yStart * this.lastLayer.width + i + j * this.lastLayer.width;
					neuralIndex = neuralIndex + this.lastLayer.width * this.lastLayer.height * k;

					neuralIndexList.push(neuralIndex);
				}

			}
		}

		return neuralIndexList;
	},

	calculateInputXYFromIndex: function (positionIndex) {

		let remaining = positionIndex % (this.width * this.height);

		let fmXPos = remaining % this.width;
		let fmYPos = Math.floor(remaining / this.width);

		let inputXPos = this.strides * fmXPos;
		let inputYPos = this.strides * fmYPos;

		return [inputXPos, inputYPos];

	}

});

export default Conv2d;