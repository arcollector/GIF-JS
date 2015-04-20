/**
* UTILS
*/

var recalcPalette = function( imageBlock ) {
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
};

Dither = function( imageBlock, colorRange, ditherData ) {
	this.imageBlock = imageBlock;
	this.imageData = imageBlock.imageData;
	this.imageDataLengh = imageBlock.imageData.length;
	this.width = imageBlock.canvasWidth;
	this.height = imageBlock.canvasHeight;
	if( colorRange ) {
		this.black = colorRange[0];
		this.white = colorRange[1];
		this.grayMidpoint = ( this.white + this.black ) / 2;
	} else {
		this.black = this.white = this.grayMidpoint = 0;
	}
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
Dither.prototype = {

	getPixelMonochrome: function( x, y ) {
		var imageDataIndex = (y*this.width*4 + x*4) % (this.imageDataLengh);
		return this.imageData[imageDataIndex];
	},

	setPixelMonochrome: function( x, y, color ) {
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
		this.imageData[imageDataIndex] = color;
		this.imageData[imageDataIndex+1] = color;
		this.imageData[imageDataIndex+2] = color;
	},

	setDiffusionErrorMonochrome: function( x, y, error ) {
		for( var row = 0; row < this.ditherTableRows; row++ ) {
			for( var col = 0; col < this.ditherTableCols; col++ ) {
				var val = this.ditherTable[row*this.ditherTableCols + col];
				if( !val ) {
					continue;
				}
				var x1 = x + (col - this.ditherTablePivot);
				var y1 = y + row;
				if( x1 < 0 || y1 < 0 || x1 > this.width || y1 > this.height ) {
					continue;
				}
				var pixelDithered = this.getPixelMonochrome( x1, y1 ) + (error*val)/this.ditherTableTotal;
				this.setPixelMonochrome( x1, y1, pixelDithered );
			}
		}
	},

	ditherMonochrome: function() {
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
				this.setDiffusionErrorMonochrome( x, y, error );
			}
		}
		this.imageBlock.imageData = this.ditheredImageData;
	},

	// *******************************************************
	// *******************************************************

	getPixelRGB: function( x, y ) {
		var imageDataIndex = (y*this.width*4 + x*4) % (this.imageDataLengh);
		return new Uint8Array( [
			this.imageData[imageDataIndex],
			this.imageData[imageDataIndex+1],
			this.imageData[imageDataIndex+2],
		] );
	},

	setPixelRGB: function( x, y, rgb ) {
		if( x > this.width || y > this.height || x < 0 || y < 0 ) {
			return;
		}
		var r = rgb[0];
		var g = rgb[1];
		var b = rgb[2];
		r = parseInt( Math.min( 255, Math.max( r, 0 ) ) );
		g = parseInt( Math.min( 255, Math.max( g, 0 ) ) );
		b = parseInt( Math.min( 255, Math.max( b, 0 ) ) );
		var imageDataIndex = y*this.width*4 + x*4;
		this.imageData[imageDataIndex] = r;
		this.imageData[imageDataIndex+1] = g;
		this.imageData[imageDataIndex+2] = b;
	},

	setDiffusionErrorRGB: function( x, y, r, g, b, mr, mg, mb ) {
		var dr = r - mr;
		var dg = g - mg;
		var db = b - mb;

		for( var row = 0; row < this.ditherTableRows; row++ ) {
			for( var col = 0; col < this.ditherTableCols; col++ ) {
				var val = this.ditherTable[row*this.ditherTableCols + col];
				if( !val ) {
					continue;
				}
				var x1 = x + (col - this.ditherTablePivot);
				var y1 = y + row;
				if( x1 < 0 || y1 < 0 || x1 > this.width || y1 > this.height ) {
					continue;
				}
				var rgb = this.getPixelRGB( x1, y1 );
				rgb[0] += (dr*val)/this.ditherTableTotal;
				rgb[1] += (dg*val)/this.ditherTableTotal;
				rgb[2] += (db*val)/this.ditherTableTotal;
				this.setPixelRGB( x1, y1, rgb );
			}
		}
	},

	ditherRGB: function() {
		var min = new Uint8Array( [ 255, 255, 255 ] );
		var max = new Uint8Array( [ 0, 0, 0 ] );

		for( var i = 0; i < this.imageDataLengh; ) {
			var r = this.imageData[i++];
			var g = this.imageData[i++];
			var b = this.imageData[i++];
			i++;
			min[0] = Math.min( min[0], r );
			min[1] = Math.min( min[1], g );
			min[2] = Math.min( min[2], b );
			max[0] = Math.max( max[0], r );
			max[1] = Math.max( max[1], g );
			max[2] = Math.max( max[2], b );
		}

		var mid = new Uint8Array( [
			(max[0] + min[0]) / 2,
			(max[1] + min[1]) / 2,
			(max[2] + min[2]) / 2,
		] );

		var i = 0;
		for( var y = 0; y < this.height; y++ ) {
			for( var x = 0; x < this.width; x++ ) {
				var r = this.imageData[i];
				var g = this.imageData[i+1];
				var b = this.imageData[i+2];
				var mr = r > mid[0] ? 255 : 0;
				var mg = g > mid[1] ? 255 : 0;
				var mb = b > mid[2] ? 255 : 0;
				this.ditheredImageData[i++] = mr;
				this.ditheredImageData[i++] = mg;
				this.ditheredImageData[i++] = mb;
				this.ditheredImageData[i++] = 255;
				this.setDiffusionErrorRGB( x, y, r, g, b, mr, mg, mb );
			}
		}
		this.imageBlock.imageData = this.ditheredImageData;
	},
};

// *******************************************************
// *******************************************************

/**
* GRAY SCALE TRANSFORMATION
*/

var toGrayScale = function( imageBlock, notRecalcPalette ) {
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
	imageBlock.colorBits = 8;
	if( !notRecalcPalette && !recalcPalette( imageBlock ) ) {
		return null;
	}
	return new Uint8Array( [ black, white ] );
};

// *******************************************************
// *******************************************************

/**
* MONOCHROME TRANSFORMATION
*/

var toMonochrome = function( imageBlock, colorRange ) {
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
	imageBlock.colorBits = 1;
	if( !recalcPalette( imageBlock ) ) {
		return false;
	}
	return true;
};

var toMonochromeUsingFilter = function( imageBlock, colorRange, filter ) {
	new Dither( imageBlock, colorRange, filter ).ditherMonochrome();

	imageBlock.colorBits = 1;
	if( !recalcPalette( imageBlock ) ) {
		return false;
	}
	return true;
};

// *******************************************************
// *******************************************************

/**
* BAYER TRANSFORMATION
*/

var BayerTable = new Uint8Array( [
	0, 32, 8, 40, 2, 34, 10, 42 ,
	48, 16, 56, 24, 50, 18, 58, 26 ,
	12, 44, 4, 36, 14, 46, 6, 38 ,
	60, 28, 52, 20, 62, 30, 54, 22 ,
	3, 35, 11, 43, 1, 33, 9, 41 ,
	51, 19, 59, 27, 49, 17, 57, 25 ,
	15, 47, 7, 39, 13, 45, 5, 37 ,
	63, 31, 55, 23, 61, 29, 53, 21 ,
] );

var toMonochromeBayer = function( imageBlock ) {
	var width = imageBlock.canvasWidth;
	var height = imageBlock.canvasHeight;
	var imageData = imageBlock.imageData;
	var i = 0;
	for( var y = 0; y < height; y++ ) {
		for( var x = 0; x < width; x++ ) {
			var gray = imageData[i];
			var whiteOrBlack = (gray/4) > BayerTable[(y&7)*8+(x&7)] ? 255 : 0;
			imageData[i++] = whiteOrBlack;
			imageData[i++] = whiteOrBlack;
			imageData[i++] = whiteOrBlack;
			i++;
		}
	}
	imageBlock.colorBits = 1;
	if( !recalcPalette( imageBlock ) ) {
		return false;
	}
	return true;
};

// *******************************************************
// *******************************************************

// FLOYD DITHER
// 	0 X 7
// 	3 5 1
//
var FloydTable = {
	table: new Uint8Array( [
		0, 0, 7,
		3, 5, 1
	] ),
	rows: 2,
	cols: 3
};

// *******************************************************
// *******************************************************

// STUCKI DITHER
// 	0 0 X 8 4
// 	2 4 8 4 2
//	1 2 4 2 1
//
var StuckiTable = {
	table: new Uint8Array( [
		0, 0, 0, 8, 4,
		2, 4, 8, 4, 2,
		1, 2, 4, 2, 1,
	] ),
	rows: 3,
	cols: 5
};

// *******************************************************
// *******************************************************

// BURKES DITHER
// 	0 0 X 8 4
// 	2 4 8 4 2
//
var BurkesTable = {
	table: new Uint8Array( [
		0, 0, 0, 8, 4,
		2, 4, 8, 4, 2,
	] ),
	rows: 2,
	cols: 5
};

// *******************************************************
// *******************************************************

// SIERRA DITHER
// 	0 0 X 5 3
// 	2 4 5 4 2
// 	0 2 3 2 0
//
var SierraTable = {
	table: new Uint8Array( [
		0, 0, 0, 5, 3,
		2, 4, 5, 4, 2,
		0, 2, 3, 2, 0,
	] ),
	rows: 3,
	cols: 5
};

// *******************************************************
// *******************************************************

// Jarvis, Judice & Ninke DITHER
// 	0 0 X 7 5
// 	3 5 7 5 3
// 	1 3 5 3 1
//
var JarvisJudiceNinkeTable = {
	table: new Uint8Array( [
		0, 0, 0, 7, 5,
		3, 5, 7, 5, 3,
		1, 3, 5, 3, 1,
	] ),
	rows: 3,
	cols: 5
};

// *******************************************************
// *******************************************************

// Stevenson & Arce DITHER
// 	0   0   0  X  0  32   0
// 	12  0  26  0  30  0  16
//	0   12  0 26  0  12   0
//   5   0  12  0  12  0   5
//
var StevensonArceTable = {
	table: new Uint8Array( [
		0, 0, 0, 0, 0, 32, 0,
		12, 0, 26, 0, 30, 0, 16,
		0, 12, 0, 26, 0, 12, 0,
		5, 0, 12, 0, 12, 0, 5,
	] ),
	rows: 4,
	cols: 7
};

// *******************************************************
// *******************************************************

var to8ColorsUsingFilter = function( imageBlock, filter ) {
	new Dither( imageBlock, null, filter ).ditherRGB();

	imageBlock.colorBits = 3;
	return recalcPalette( imageBlock );
};

// *******************************************************
// *******************************************************

const MONOCHROME = 0x01;
const MONOCHROME_BAYER = 0x02;
const MONOCHROME_FLOYD = 0x03;
const MONOCHROME_STUCKI = 0x04;
const MONOCHROME_BURKES = 0x05;
const MONOCHROME_SIERRA = 0x06;
const MONOCHROME_JARVIS_JUDICE_NINKE = 0x07;
const MONOCHROME_STEVENSON_ARCE = 0x08;

const GRAY_SCALE = 0x10;

const _8_COLORS_FLOYD = 0x0100;
const _8_COLORS_STUCKI = 0x0200;
const _8_COLORS_BURKES = 0x0300;
const _8_COLORS_SIERRA = 0x0400;
const _8_COLORS_JARVIS_JUDICE_NINKE = 0x0500;
const _8_COLORS_STEVENSON_ARCE = 0x0600;

var filterTables = {};
filterTables[MONOCHROME_FLOYD] = FloydTable;
filterTables[MONOCHROME_STUCKI] = StuckiTable;
filterTables[MONOCHROME_BURKES] = BurkesTable;
filterTables[MONOCHROME_SIERRA] = SierraTable;
filterTables[MONOCHROME_JARVIS_JUDICE_NINKE] = JarvisJudiceNinkeTable;
filterTables[MONOCHROME_STEVENSON_ARCE] = StevensonArceTable;

filterTables[_8_COLORS_FLOYD] = FloydTable;
filterTables[_8_COLORS_STUCKI] = StuckiTable;
filterTables[_8_COLORS_BURKES] = BurkesTable;
filterTables[_8_COLORS_SIERRA] = SierraTable;
filterTables[_8_COLORS_JARVIS_JUDICE_NINKE] = JarvisJudiceNinkeTable;
filterTables[_8_COLORS_STEVENSON_ARCE] = StevensonArceTable;

// *******************************************************
// *******************************************************

/**
* MAIN
*/

var DEBUG = true;

self.addEventListener( 'message', function( e ) {
    var args = e.data;
	var imageBlock = args.imageBlock;
	var ret;
    switch( args.type ) {
        case MONOCHROME: {
			var colorRange = toGrayScale( imageBlock, true );
			ret = toMonochrome( imageBlock, colorRange );
            break;
        }
        case MONOCHROME_BAYER: {
			toGrayScale( imageBlock, true );
			ret = toMonochromeBayer( imageBlock );
            break;
        }
		case MONOCHROME_FLOYD:
		case MONOCHROME_STUCKI:
		case MONOCHROME_BURKES:
		case MONOCHROME_SIERRA:
		case MONOCHROME_JARVIS_JUDICE_NINKE:
		case MONOCHROME_STEVENSON_ARCE: {
			var colorRange = toGrayScale( imageBlock, true );
			ret = toMonochromeUsingFilter( imageBlock, colorRange, filterTables[args.type] );
			break;
		}

		case GRAY_SCALE: {
			var colorRange = toGrayScale( imageBlock, false );
			ret = !colorRange ? false : true;
			break;
		}

		case _8_COLORS_FLOYD:
		case _8_COLORS_STUCKI:
		case _8_COLORS_BURKES:
		case _8_COLORS_SIERRA:
		case _8_COLORS_JARVIS_JUDICE_NINKE:
		case _8_COLORS_STEVENSON_ARCE: {
			ret = to8ColorsUsingFilter( imageBlock, filterTables[args.type] );
			break;
		}

        default: {
			ret = false;
            break;
        }
    }
	self.postMessage( !ret ? null : imageBlock );
} );
