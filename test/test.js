/**
* TEST
*/

// in firefox you need to setup the option fileuri.strict_origin_policy to false
// in chrome you need to enable the flag access-files-from-file

var libPath = '../';

GIF.init( {
	canvasSelector: '.picture',
	libPath: '../', // relative from the ubication of this file
	imagesPath: 'test/', // relative from the ubication of gif.decoder.js file
} );

var filenameURL = 'interlace.gif'; // LZWMinCodeSize = 2 && isInterlaced
var filenameURL = 'sample_1.gif'; // LZWMinCodeSize = 2
var filenameURL = 'cb_interlaced.gif'; // LZWMinCodeSize = 8 && isInterlaced
var filenameURL = 'uncompressed_GIF.gif'; // LZWMinCodeSize = 7
var filenameURL = 'sample_2_animation.gif'; // LZWMinCodeSize = 3 && imageBlock.top & imageBlock.left not zero
var filenameURL = 'dummkopfs.gif'; // LZWMinCodeSize = 8

// *************************************
// DECODING EXAMPLE
// *************************************
GIF.decode( filenameURL, function( imagesBlock ) {
	if( !imagesBlock ) {
		return;
	}
	GIF.display( imagesBlock );

	// *************************************
	// ENCODING example using the same fetched image
	// *************************************
	// setup the bitmaps array
	var bitmaps = [];
	for( var i = 0, l = imagesBlock.length; i < l; i++ ) {
		var imageBlock = imagesBlock[i];
		// setup bitmapData using the image block data and graphics control extension
		var bitmapData = {
			// this data comes from the graphics control extension (there 4 fields are optional)
			delayTime: imageBlock.delayTime || 0, // ie: 1 second is 100
			transparentColorFlag: imageBlock.transparentColorFlag || false,
			transparentColorIndex: imageBlock.transparentColorIndex || 0,
			disposalMethod: imageBlock.disposalMethod,

			palette: imageBlock.palette, // here is where you can overwrite the palette specified on the header // (optional)
			colorBits: imageBlock.colorBits, // not optional is you specified an local palette
			isInterlaced: imageBlock.isInterlaced, // (optional)
			top: imageBlock.top, // (optional, 0 default)
			left: imageBlock.left, // (optional, 0 default)
			width: imageBlock.width,
			height: imageBlock.height,
			imageData: imageBlock.imageData,
			isUncompressed: false,
		};
		bitmaps.push( bitmapData );
	}

	GIF.encode( {
		// setup the general options
		canvasWidth: imagesBlock[0].canvasWidth,
		canvasHeight: imagesBlock[0].canvasHeight,
		backgroundColorIndex: imagesBlock[0].backgroundColorIndex,
		colorBits: imagesBlock[0].colorBits,
		palette: imagesBlock[0].palette, // also know as the global palette, optional if each image block has it own local palette
		bitmaps: bitmaps,
	}, function( file ) {
		GIF.download( file );
	} );
} );
