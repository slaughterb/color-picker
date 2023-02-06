
class Picker {
	constructor(target, width, height) {
		this.target = target;
		this.width = width;
		this.height = height;
		this.target.width = width;
		this.target.height = height;
		this.addedColors = [];
		this.currentColor = { r: 0, g: 0, b: 0};
		this.addButton = document.getElementById('add-button');

		this.context = this.target.getContext('2d');
		this.pickerCircle = { 
			x: 10, 
			y: 10, 
			width: 6, 
			height: 6 
		};
		this.listenForEvents();
	}

	displayRGB(r,g,b) {
		return `rgb(${r}, ${g}, ${b})`;
	}

	// determine if term is valid hexidecimal sequence
	isHex(term) {
		return Boolean(term.match(/^[#]?[0-9a-f]{6}$/i));
	}

	searchColor(term) {
		if (!this.isHex(term)) {
			console.log('Hexidecimal must be formated (#)RRGGBB');
			console.log('hex term: ' + term);
			term = '#fbfbfb';
		}
		if (term.length === 6 && term[0] !== '#') {
			term = '#' + term;
		}
		document.getElementById('searched-color').style.backgroundColor = term;
	}

	getPresetText(addedColors) {
		if (addedColors.length === 0) {
			return ' ';
		}
		else if (addedColors.length === 1) {
			return this.rgbToHex(addedColors[0].r, addedColors[0].g, addedColors[0].b);
		}
		let res = '';
		for (let i = 0; i < addedColors.length; i++) {
			let color = addedColors[i];
			res += this.rgbToHex(color.r, color.g, color.b);
			if (i < addedColors.length - 1) {
				res += ', ';
			}
		}
		return res;
	}

	copyToClipboard(data) {
		// create temporary textarea to copy contents over 
		let tmpItem = document.createElement('textarea');
		document.body.appendChild(tmpItem);
		tmpItem.value = data;
		tmpItem.select();
		document.execCommand('copy');
		document.body.removeChild(tmpItem);
		document.getElementById('copy-color-preset').innerText = 'Copied!';
	}

	listenForEvents() {
		let isMouseDown = true;

		const onMouseDown = (ev) => {
		  let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    	  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    	  console.log('left, ' + scrollLeft);
    	  console.log('top, ' + scrollTop);
	      let currentX = ev.clientX - this.target.offsetLeft + scrollLeft;;
	      let currentY = ev.clientY - this.target.offsetTop + scrollTop;
	      if(currentY > this.pickerCircle.y 
	      	&& currentY < this.pickerCircle.y + this.pickerCircle.width 
	      	&& currentX > this.pickerCircle.x 
	      	&& currentX < this.pickerCircle.x + this.pickerCircle.width) {
	        isMouseDown = true;
	      } else {
	        this.pickerCircle.x = currentX;
	        this.pickerCircle.y = currentY;
	      }
	    }

		const onMouseMove = (ev) => {
			if (isMouseDown) {
				let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
				let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
				let currentX = ev.clientX - this.target.offsetLeft + scrollLeft;
				let currentY = ev.clientY - this.target.offsetTop + scrollTop;

				this.pickerCircle.x = currentX;
				this.pickerCircle.y = currentY;
			}
		}

		const onMouseUp = () => {
			isMouseDown = false;
		}

		this.target.addEventListener('mousedown', onMouseDown);
		this.target.addEventListener('mousemove', onMouseMove);
		this.target.addEventListener('mousemove', () => {
			return this.onChangeCallback(this.getPickedColor());
		});

		this.addButton.addEventListener('click', () => {
			if (this.addedColors.includes(this.currentColor)) {
				console.log('You\'ve already saved this color.');
				return;
			}
			this.addedColors.push(this.currentColor);
			let hexColor = this.rgbToHex(this.currentColor.r, this.currentColor.g, this.currentColor.b);
			document.getElementById('added-colors').innerHTML += this.addedColors.length + '. '+ hexColor;
			let colorSample = `  <div style="display: inline-block; border:1px solid black;width:14px;height:14px;background-color:${hexColor}"></div> <br>`
			document.getElementById('added-colors').innerHTML += colorSample;
			// reset text to default placeholder
			document.getElementById('copy-color-preset').innerText = 'Copy';
		});

		document.getElementById('clear-colors').addEventListener('click', () => {
			this.addedColors = [];
			document.getElementById('added-colors').innerText = '';
			// reset text to default placeholder
			document.getElementById('copy-color-preset').innerText = 'Copy';
		});

		document.getElementById('search-button').addEventListener('click', () => {
			return this.searchColor(document.getElementById('search-input').value);
		});

		document.getElementById('copy-color-preset').addEventListener('click', () => this.copyToClipboard(this.getPresetText(this.addedColors)));

		document.addEventListener('mouseup', onMouseUp);
	}

	getPickedColor() {
		let imageData = this.context.getImageData(this.pickerCircle.x, this.pickerCircle.y, 1, 1);
		this.currentColor = {r: imageData.data[0], g: imageData.data[1], b: imageData.data[2]};
		return this.currentColor;
	}

	draw() {
		this.build();
	}

	build() {
		let gradient = this.context.createLinearGradient(0, 0, this.width, 0);

		gradient.addColorStop(0, 'rgb(255, 0, 0)');
		gradient.addColorStop(0.15, 'rgb(255, 0, 255)');
		gradient.addColorStop(0.33, 'rgb(0, 0, 255)');
		gradient.addColorStop(0.49, 'rgb(0, 255, 255)');
		gradient.addColorStop(0.67, 'rgb(0, 255, 0)');
		gradient.addColorStop(0.84, 'rgb(255, 255, 0)');
		gradient.addColorStop(1, 'rgb(255, 0, 0');

		this.context.fillStyle = gradient;
		this.context.fillRect(0, 0, this.width, this.height);
		// apply shade
		gradient = this.context.createLinearGradient(0, 0, 0, this.height);
		gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
		gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
		gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0');
		gradient.addColorStop(1, 'rgba(0, 0, 0, 1');
		this.context.fillStyle = gradient;
		this.context.fillRect(0, 0, this.width, this.height);

		// render circle 
		this.context.beginPath();
		this.context.arc(this.pickerCircle.x, this.pickerCircle.y, 
			this.pickerCircle.width / 1.5, 0, Math.PI * 2);
		this.context.strokeStyle = 'black';
		this.context.stroke();
		this.context.closePath();
	}

	onChange(callback) {
		this.onChangeCallback = callback;
	}

	componentToHex(term) {
		var hex = term.toString(16);
		return hex.length == 1 ? '0' + hex : hex;
	}

	rgbToHex(r, g, b) {
		return '#' + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
	}
}

let picker = new Picker(document.getElementById('color-picker'), 300, 250);
setInterval(() => picker.draw(), 0.2);

picker.onChange((color) => {
	let selected = document.getElementsByClassName('selected')[0];
	selected.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
	let hexInfo = document.getElementById('selected-hex-info');
	let rgbInfo = document.getElementById('selected-rgb-info');

	hexInfo.innerText = picker.rgbToHex(color.r, color.g, color.b);
	rgbInfo.innerText = `(${color.r}, ${color.g}, ${color.b})`;
})



