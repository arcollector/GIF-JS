/**
* GIF
*/
var GIF = {
	init: function( options ) {
		this.$canvas = null;
		this.ctx = null;
		if( options.canvasSelector ) {
			this.$canvas = document.querySelector( options.canvasSelector );
			if( !this.$canvas ) {
				console.error( 'missing elem <canvas> with selector', options.canvasSelector );
				return;
			}
			this.ctx = this.$canvas.getContext( '2d' );
		}

		var path = options.libPath || '';
		path += this._checkPathCorrectness( path );

		this.decoder = new Worker( path + 'gif.decoder.js');
		this.decoder.addEventListener( 'message', this._decoded.bind( this ) );

		this.encoder = new Worker( path + 'gif.encoder.js');
		this.encoder.addEventListener( 'message', this._encoded.bind( this ) );

		this._callback = null;

		this._imagesPath = options.imagesPath || '';
		this._imagesPath += this._checkPathCorrectness( this._imagesPath );
	},
	decode: function( filenameURL, callback ) {
		if( typeof callback !== 'function' ) {
			console.error( 'missing callback param' );
			return;
		}
		this._callback = callback;
		this.decoder.postMessage( this._imagesPath + filenameURL );
	},
	_decoded: function( e ) {
		this._callCallback( e.data );
	},
	display: function( imagesBlock, curIndex ) {
		curIndex = curIndex || 0;
		var imageBlock = imagesBlock[curIndex];
		this._display( imageBlock.imageData, imageBlock.canvasWidth, imageBlock.canvasHeight );
		if( imagesBlock.length > 1 ) {
			curIndex = (curIndex + 1) % imagesBlock.length;
			setTimeout( function() { GIF.display( imagesBlock, curIndex ); }, imageBlock.delayTime/100*1000 );
		}
	},
	_display: function( imageData, width, height ) {
		this.$canvas.width = width;
		this.$canvas.height = height;
	    var realImageData = this.ctx.createImageData( width, height );
	    // "convert" imageData (an Uint8Array) to a <canvas> image data type
	    realImageData.data.set( imageData );
		this.ctx.putImageData( realImageData, 0, 0 );
	},
	encode: function( options, callback ) {
		if( typeof callback !== 'function' ) {
			console.error( 'missing callback param' );
			return;
		}
		this._callback = callback;
		this.encoder.postMessage( { options: options } );
	},
	_encoded: function( e ) {
		this._callCallback( e.data );
	},
	download: function( arrayBuffer, filename ) {
		filename = filename ? filename + '' : +new Date() + '';
		var $a = document.createElement( 'a' );
		$a.setAttribute( 'download', filename + '.gif' );
		var objectURL = URL.createObjectURL( new Blob( [ arrayBuffer ], { type: 'application/octet-binary' } ) );
		$a.setAttribute( 'href', objectURL );
		$a.style.display = 'none';
		document.body.appendChild( $a );
		$a.click();
		document.body.removeChild( $a );
		//URL.revokeObjectURL( objectURL ); // in firefox this does not work
	},
	_callCallback: function( data ) {
		var callback = this._callback;
		this._callback = null;
		callback( data );
	},
	_checkPathCorrectness: function( path ) {
		return path.substring( path.length-1 ) !== '/' ? '/' : '';
	},

// **********
// COLOR CONVERSION FUNCTIONS
// **********
	_remapImageBlockPalette: function( imageBlock ) {
		var palette = imageBlock.palette;
		var imageData = imageBlock.imageData;
		var colorCount = 1 << imageBlock.colorBits;
		var paletteSize = colorCount*3;
		var newPalette = new Uint8Array( paletteSize );
		var newPaletteIndex = 0;
		var colorsDict = {};
		for( var i = 0, l = imageData.length; i < l; ) {
			var r = imageData[i++];
			var g = imageData[i++];
			var b = imageData[i++];
			i++;
			var colorDictIndex = r + ',' + g + ',' + b;
			if( !(colorDictIndex in colorsDict) ) {
				if( newPaletteIndex === paletteSize ) {
					console.error( 'target image has more than', colorCount, 'posible colors' );
					return false;
				}
				newPalette[newPaletteIndex++] = r;
				newPalette[newPaletteIndex++] = g;
				newPalette[newPaletteIndex++] = b;
				colorsDict[colorDictIndex] = true;
			}
		}
		imageBlock.palette = newPalette;
		return true;
	},
	toGrayScale: function( imageBlock, notRemapPalette ) {
		var imageData = imageBlock.imageData;
		var width = imageBlock.canvasWidth;
		var height = imageBlock.canvasHeight;
		var i = 0;
		var black = 255;
		var white = 0;
		for( var y = 0; y < height; y++ ) {
			for( var x = 0; x < width; x++ ) {
				var red = imageData[i];
				var green = imageData[i+1];
				var blue = imageData[i+2];
				var gray = red*.30 + green*.59 + blue*.11;
				black = Math.min( black, gray );
				white = Math.max( white, gray );
				gray = parseInt( gray );
				imageData[i++] = gray;
				imageData[i++] = gray;
				imageData[i++] = gray;
				i++;
			}
		}
		if( !notRemapPalette && !this._remapImageBlockPalette( imageBlock ) ) {
			return null;
		}
		return new Uint8Array( [ black, white ] );
	},
	toMonochrome: function( imageBlock, ditherFunct ) {
		var colorRange = GIF.toGrayScale( imageBlock, true );
		if( !colorRange ) {
			return false;
		}
		ditherFunct = typeof ditherFunct !== 'function' ? this._toMonochrome.bind( this ) : ditherFunct;
		return ditherFunct( imageBlock, colorRange );
	},
	_toMonochrome: function( imageBlock, colorRange ) {
		var black = colorRange[0];
		var white = colorRange[1];
		var grayMidpoint = (white + black) / 2;
		var width = imageBlock.canvasWidth;
		var height = imageBlock.canvasHeight;
		var imageData = imageBlock.imageData;
		for( var i = 0; i < imageData.length; ) {
			var gray = imageData[i];
			var whiteOrBlack = gray >= grayMidpoint ? 255 : 0;
			imageData[i++] = whiteOrBlack;
			imageData[i++] = whiteOrBlack;
			imageData[i++] = whiteOrBlack;
			i++;
		}
		if( !this._remapImageBlockPalette( imageBlock ) ) {
			return false;
		}
		imageBlock.colorBits = 1;
		return true;
	},
};

GIF.Dither = {
	_bayerTable: new Uint8Array( [
		0, 32, 8, 40, 2, 34, 10, 42 ,
		48, 16, 56, 24, 50, 18, 58, 26 ,
		12, 44, 4, 36, 14, 46, 6, 38 ,
		60, 28, 52, 20, 62, 30, 54, 22 ,
		3, 35, 11, 43, 1, 33, 9, 41 ,
		51, 19, 59, 27, 49, 17, 57, 25 ,
		15, 47, 7, 39, 13, 45, 5, 37 ,
		63, 31, 55, 23, 61, 29, 53, 21 ,
	] ),
	Bayer: function( imageBlock ) {
		var width = imageBlock.canvasWidth;
		var height = imageBlock.canvasHeight;
		var imageData = imageBlock.imageData;
		var i = 0;
		for( var y = 0; y < height; y++ ) {
			for( var x = 0; x < width; x++ ) {
				var gray = imageData[i];
				var whiteOrBlack = (gray/4) > GIF.Dither._bayerTable[(y&7)*8+(x&7)] ? 255 : 0;
				imageData[i++] = whiteOrBlack;
				imageData[i++] = whiteOrBlack;
				imageData[i++] = whiteOrBlack;
				i++;
			}
		}
		if( !GIF._remapImageBlockPalette( imageBlock ) ) {
			return false;
		}
		imageBlock.colorBits = 1;
		return true;
	},

	/* FLOYD DITHER
	* 	0 X 7
	* 	3 5 1
	*/
	Floyd: function( imageBlock, colorRange ) {
		var theDither = new GIF._Dither( imageBlock, colorRange, {
			table: new Uint8Array( [
				0, 0, 7,
				3, 5, 1
			] ),
			rows: 2,
			cols: 3
		} );
		theDither.dither();
		if( !GIF._remapImageBlockPalette( imageBlock ) ) {
			return false;
		}
		imageBlock.colorBits = 1;
		return true;
	},

	/* STUCKI DITHER
	* 	0 0 X 8 4
	* 	2 4 8 4 2
	*	1 2 4 2 1
	*/
	Stucki: function( imageBlock, colorRange ) {
		var theDither = new GIF._Dither( imageBlock, colorRange, {
			table: new Uint8Array( [
				0, 0, 0, 8, 4,
				2, 4, 8, 4, 2,
				1, 2, 4, 2, 1,
			] ),
			rows: 3,
			cols: 5
		} );
		theDither.dither();
		if( !GIF._remapImageBlockPalette( imageBlock ) ) {
			return false;
		}
		imageBlock.colorBits = 1;
		return true;
	},

	/* BURKES DITHER
	* 	0 0 X 8 4
	* 	2 4 8 4 2
	*/
	Burkes: function( imageBlock, colorRange ) {
		var theDither = new GIF._Dither( imageBlock, colorRange, {
			table: new Uint8Array( [
				0, 0, 0, 8, 4,
				2, 4, 8, 4, 2,
			] ),
			rows: 2,
			cols: 5
		} );
		theDither.dither();
		if( !GIF._remapImageBlockPalette( imageBlock ) ) {
			return false;
		}
		imageBlock.colorBits = 1;
		return true;
	},

	/* SIERRA DITHER
	* 	0 0 X 5 3
	* 	2 4 5 4 2
	* 	0 2 3 2 0
	*/
	Sierra: function( imageBlock, colorRange ) {
		var theDither = new GIF._Dither( imageBlock, colorRange, {
			table: new Uint8Array( [
				0, 0, 0, 5, 3,
				2, 4, 5, 4, 2,
				0, 2, 3, 2, 0,
			] ),
			rows: 3,
			cols: 5
		} );
		theDither.dither();
		if( !GIF._remapImageBlockPalette( imageBlock ) ) {
			return false;
		}
		imageBlock.colorBits = 1;
		return true;
	},

	/* Jarvis, Judice & Ninke DITHER
	* 	0 0 X 7 5
	* 	3 5 7 5 3
	* 	1 3 5 3 1
	*/
	JarvisJudiceNinke: function( imageBlock, colorRange ) {
		var theDither = new GIF._Dither( imageBlock, colorRange, {
			table: new Uint8Array( [
				0, 0, 0, 7, 5,
				3, 5, 7, 5, 3,
				1, 3, 5, 3, 1,
			] ),
			rows: 3,
			cols: 5
		} );
		theDither.dither();
		if( !GIF._remapImageBlockPalette( imageBlock ) ) {
			return false;
		}
		imageBlock.colorBits = 1;
		return true;
	},

	/* Stevenson & Arce DITHER
	* 	0   0   0  X  0  32   0
	* 	12  0  26  0  30  0  16
	*	0   12  0 26  0  12   0
	*   5   0  12  0  12  0   5
	*/
	StevensonArce: function( imageBlock, colorRange ) {
		var theDither = new GIF._Dither( imageBlock, colorRange, {
			table: new Uint8Array( [
				0, 0, 0, 0, 0, 32, 0,
				12, 0, 26, 0, 30, 0, 16,
				0, 12, 0, 26, 0, 12, 0,
				5, 0, 12, 0, 12, 0, 5,
			] ),
			rows: 4,
			cols: 7
		} );
		theDither.dither();
		if( !GIF._remapImageBlockPalette( imageBlock ) ) {
			return false;
		}
		imageBlock.colorBits = 1;
		return true;
	},
};

GIF._Dither = function( imageBlock, colorRange, ditherData ) {
	this.imageBlock = imageBlock;
	this.imageData = imageBlock.imageData;
	this.imageDataLengh = imageBlock.imageData.length;
	this.width = imageBlock.canvasWidth;
	this.height = imageBlock.canvasHeight;
	this.black = colorRange[0];
	this.white = colorRange[1];
	this.grayMidpoint = ( this.white + this.black ) / 2;
	this.ditheredImageData = new Uint8Array( this.width * this.height * 4 );
	this.ditherTable = ditherData.table;
	this.ditherTableRows = ditherData.rows;
	this.ditherTableCols = ditherData.cols;
	this.ditherTablePivot = parseInt( ditherData.cols / 2 );
	this.ditherTableTotal = 0;
	for( var i = 0, l = ditherData.rows*ditherData.cols; i < l; i++ ) {
		this.ditherTableTotal += ditherData.table[i];
	}
};
GIF._Dither.prototype = {
	getPixel: function( x, y ) {
		var imageDataIndex = (y*this.width*4 + x*4) % (this.imageDataLengh);
		return this.imageData[imageDataIndex];
	},
	setPixel: function( x, y, color ) {
		if( x > this.width || y > this.height || x < 0 || y < 0 ) {
			return;
		}
		if( color > this.white ) {
			color = this.white;
		}
		if( color < this.black ) {
			color = this.black;
		}
		color = parseInt( color );
		var imageDataIndex = y*this.width*4 + x*4;
		this.imageData[imageDataIndex++] = color;
		this.imageData[imageDataIndex++] = color;
		this.imageData[imageDataIndex++] = color;
	},
	setDiffusionError: function( x, y, error ) {
		for( var row = 0; row < this.ditherTableRows; row++ ) {
			for( var col = 0; col < this.ditherTableCols; col++ ) {
				var tableValue = this.ditherTable[row * this.ditherTableCols + col];
				if( !tableValue ) {
					continue;
				}
				var x1 = x + ( col - this.ditherTablePivot );
				var y1 = y + row;
				if( x1 < 0 || y1 < 0 || x1 > this.width || y1 > this.height ) {
					continue;
				}
				var pixelDithered = this.getPixel( x1, y1 ) + ( error * tableValue ) / this.ditherTableTotal;
				this.setPixel( x1, y1, pixelDithered );
			}
		}
	},
	dither: function() {
		var i = 0;
		for( var y = 0; y < this.height; y++ ) {
			for( var x = 0; x < this.width; x++ ) {
				var gray = this.imageData[i];
				var error;
				var whiteOrBlack;
				if( gray > this.grayMidpoint ) {
					whiteOrBlack = 255;
					error = gray - this.white;
				} else {
					whiteOrBlack = 0;
					error = gray - this.black;
				}
				this.ditheredImageData[i++] = whiteOrBlack;
				this.ditheredImageData[i++] = whiteOrBlack;
				this.ditheredImageData[i++] = whiteOrBlack;
				this.ditheredImageData[i++] = 255;
				this.setDiffusionError( x, y, error );
			}
		}
		this.imageBlock.imageData = this.ditheredImageData;
	},
};
