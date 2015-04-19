/**
* TEST
*/

// in firefox you need to setup the option fileuri.strict_origin_policy to false
// in chrome you need to enable the flag access-files-from-file

var filenameURL = 'sgmpe.gif'; // LZWMinCodeSize = 8

GIF.init( {
	canvasSelector: '.picture',
	libPath: '../../', // relative from the ubication of this file
	imagesPath: 'tests/dithering.from.256.colors.to.monochrome', // relative from the ubication of gif.decoder.js file
} );

GIF.decode( filenameURL, function( imagesBlock ) {
	if( !imagesBlock ) {
		return;
	}

	Tests.init( imagesBlock[0] ); // use the first image as test bed
} );

var Tests = {
	imageBlock: null,
	imageDataCopy: null,
	imageDataLength: 0,
	curCase: 0,
	isRunning: false,

	restoreImageData: function( imageData ) {
		for( var i = 0; i < Tests.imageDataLength; i++ ) {
			imageData[i] = Tests.imageDataCopy[i];
		}
	},

	encodeDownloadNext: function( imageBlock ) {
		GIF.encode( {
			canvasWidth: imageBlock.canvasWidth,
			canvasHeight: imageBlock.canvasHeight,
			backgroundColorIndex: imageBlock.backgroundColorIndex,
			colorBits: imageBlock.colorBits,
			palette: imageBlock.palette,
			bitmaps: [ {
				isInterlaced: imageBlock.isInterlaced, // (optional)
				top: imageBlock.top, // (optional, 0 default)
				left: imageBlock.left, // (optional, 0 default)
				width: imageBlock.width,
				height: imageBlock.height,
				imageData: imageBlock.imageData,
				isUncompressed: false,
			} ],
		}, function( file ) {
			file && GIF.download( file );
			Tests.isRunning = false;
			Tests.curCase !== Tests.cases.length && console.log( 'TEST NEXT: press <return> key to trigger next case' );
		} );
	},

	cases: [
		function() { // gray scale test
			console.log( 'TEST #: gray scale test' );
			var imageBlock = Tests.imageBlock;
			Tests.restoreImageData( imageBlock.imageData );
			if( !GIF.toGrayScale( imageBlock ) ) {
				console.error( 'gray scale test has failed' );
				return;
			}
			GIF.display( [ imageBlock ] );
			Tests.encodeDownloadNext( imageBlock );
		},
		function() { // monochrome test
			console.log( 'TEST #: monochrome test' );
			var imageBlock = Tests.imageBlock;
			Tests.restoreImageData( imageBlock.imageData );
			if( !GIF.toMonochrome( imageBlock ) ) {
				console.error( 'monochrome test has failed' );
				return;
			}
			GIF.display( [ imageBlock ] );
			Tests.encodeDownloadNext( imageBlock );
		},
		function() { // bayer dithering test
			console.log( 'TEST #: bayer dithering test' );
			var imageBlock = Tests.imageBlock;
			Tests.restoreImageData( imageBlock.imageData );
			if( !GIF.toMonochrome( imageBlock, GIF.Dither.Bayer ) ) {
				console.error( 'bayer dithering test has failed' );
				return;
			}
			GIF.display( [ imageBlock ] );
			Tests.encodeDownloadNext( imageBlock );
		},
		function() { // floyd dithering test
			console.log( 'TEST #: floyd dithering test' );
			var imageBlock = Tests.imageBlock;
			Tests.restoreImageData( imageBlock.imageData );
			if( !GIF.toMonochrome( imageBlock, GIF.Dither.Floyd ) ) {
				console.error( 'bayer dithering test has failed' );
				return;
			}
			GIF.display( [ imageBlock ] );
			Tests.encodeDownloadNext( imageBlock );
		},
		function() { // stucki dithering test
			console.log( 'TEST #: stucki dithering test' );
			var imageBlock = Tests.imageBlock;
			Tests.restoreImageData( imageBlock.imageData );
			if( !GIF.toMonochrome( imageBlock, GIF.Dither.Stucki ) ) {
				console.error( 'stucki dithering test has failed' );
				return;
			}
			GIF.display( [ imageBlock ] );
			Tests.encodeDownloadNext( imageBlock );
		},
		function() { // burkes dithering test
			console.log( 'TEST #: burkes dithering test' );
			var imageBlock = Tests.imageBlock;
			Tests.restoreImageData( imageBlock.imageData );
			if( !GIF.toMonochrome( imageBlock, GIF.Dither.Burkes ) ) {
				console.error( 'burkes dithering test has failed' );
				return;
			}
			GIF.display( [ imageBlock ] );
			Tests.encodeDownloadNext( imageBlock );
		},
		function() { // sierra dithering test
			console.log( 'TEST #: sierra dithering test' );
			var imageBlock = Tests.imageBlock;
			Tests.restoreImageData( imageBlock.imageData );
			if( !GIF.toMonochrome( imageBlock, GIF.Dither.Sierra ) ) {
				console.error( 'sierra dithering test has failed' );
				return;
			}
			GIF.display( [ imageBlock ] );
			Tests.encodeDownloadNext( imageBlock );
		},
		function() { // jarvis, judice & ninke dithering test
			console.log( 'TEST #: jarvis, judice & ninke dithering test' );
			var imageBlock = Tests.imageBlock;
			Tests.restoreImageData( imageBlock.imageData );
			if( !GIF.toMonochrome( imageBlock, GIF.Dither.JarvisJudiceNinke ) ) {
				console.error( 'jarvis, judice & ninke dithering test has failed' );
				return;
			}
			GIF.display( [ imageBlock ] );
			Tests.encodeDownloadNext( imageBlock );
		},
		function() { // stevenson & arce dithering test
			console.log( 'TEST #: stevenson & arce dithering test' );
			var imageBlock = Tests.imageBlock;
			Tests.restoreImageData( imageBlock.imageData );
			if( !GIF.toMonochrome( imageBlock, GIF.Dither.StevensonArce ) ) {
				console.error( 'stevenson & arce dithering test has failed' );
				return;
			}
			GIF.display( [ imageBlock ] );
			Tests.encodeDownloadNext( imageBlock );
		},
	],

	init: function( imageBlock ) {
		Tests.curCase = 0;
		Tests.imageBlock = imageBlock; // save a reference
		// make a copy of the image data to be used in the successive test
		var imageData = imageBlock.imageData;
		Tests.imageDataLength = imageData.length;
		Tests.imageDataCopy = new Uint8Array( Tests.imageDataLength );
		for( var i = 0; i < Tests.imageDataLength; i++ ) {
			Tests.imageDataCopy[i] = imageData[i];
		}
		window.addEventListener( 'keyup', function( e ) {
			if( e.keyCode !== 13 ) {
				return;
			}
			if( Tests.isRunning ) {
				console.warn( 'a test is currently running, please wait...' );
				return;
			}
			Tests.isRunning = true;
			Tests.cases[Tests.curCase]();
			if( ++Tests.curCase === Tests.cases.length ) {
				console.log( 'TEST END' );
				window.removeEventListener( 'keyup' );
			}
		} );
		console.log( 'TEST INIT: press <return> key to trigger first test case' );
	},
};
