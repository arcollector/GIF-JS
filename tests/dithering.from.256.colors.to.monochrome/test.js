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

	Test.init( imagesBlock[0] ); // use the first image as test bed
} );

var Test = {
	imageBlock: null,
	imageDataCopy: null,
	imageDataLength: 0,
	curCase: 0,
	isRunning: false,

	restoreImageData: function( imageData ) {
		for( var i = 0; i < Test.imageDataLength; i++ ) {
			imageData[i] = Test.imageDataCopy[i];
		}
	},

	start: function() {
		var imageBlock = Test.imageBlock;
		Test.restoreImageData( imageBlock.imageData );
		return imageBlock;
	},

	dither: function( imageBlock, type, callback ) {
		GIF.dither( imageBlock, type, callback );
	},

	display: function( imageBlock ) {
		GIF.display( imageBlock );
	},

	encode: function( imageBlock, callback ) {
		GIF.encode(
			{
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
			},
			callback
		);
	},

	download: function( file ) {
		GIF.download( file );
		Test.isRunning = false;
		Test.curCase !== Test.cases.length && console.log( 'TEST NEXT: press <return> key to trigger next case' );
	},

	cases: [
		function() { // gray scale test
			console.log( 'TEST #: gray scale test' );
			var imageBlock = Test.start();
			Test.dither( imageBlock, GIF.DitherType.GRAY_SCALE, function( imageBlock ) {
				if( !imageBlock ) {
					console.error( 'test dithering fail' );
					return;
				}
				Test.display( imageBlock );
				Test.encode( imageBlock, function( file ) {
					if( !file ) {
						console.error( 'test encoding fail' );
						return;
					}
					Test.download( file );
				} );
			} );
		},
		function() { // monochrome test
			console.log( 'TEST #: monochrome test' );
			var imageBlock = Test.start();
			Test.dither( imageBlock, GIF.DitherType.MONOCHROME, function( imageBlock ) {
				if( !imageBlock ) {
					console.error( 'test dithering fail' );
					return;
				}
				Test.display( imageBlock );
				Test.encode( imageBlock, function( file ) {
					if( !file ) {
						console.error( 'test encoding fail' );
						return;
					}
					Test.download( file );
				} );
			} );
		},
		function() { // bayer dithering test
			console.log( 'TEST #: bayer dithering test' );
			var imageBlock = Test.start();
			Test.dither( imageBlock, GIF.DitherType.MONOCHROME_BAYER, function( imageBlock ) {
				if( !imageBlock ) {
					console.error( 'test dithering fail' );
					return;
				}
				Test.display( imageBlock );
				Test.encode( imageBlock, function( file ) {
					if( !file ) {
						console.error( 'test encoding fail' );
						return;
					}
					Test.download( file );
				} );
			} );
		},
		function() { // floyd dithering test
			console.log( 'TEST #: floyd dithering test' );
			var imageBlock = Test.start();
			Test.dither( imageBlock, GIF.DitherType.MONOCHROME_FLOYD, function( imageBlock ) {
				if( !imageBlock ) {
					console.error( 'test dithering fail' );
					return;
				}
				Test.display( imageBlock );
				Test.encode( imageBlock, function( file ) {
					if( !file ) {
						console.error( 'test encoding fail' );
						return;
					}
					Test.download( file );
				} );
			} );
		},
		function() { // stucki dithering test
			console.log( 'TEST #: stucki dithering test' );
			var imageBlock = Test.start();
			Test.dither( imageBlock, GIF.DitherType.MONOCHROME_STUCKI, function( imageBlock ) {
				if( !imageBlock ) {
					console.error( 'test dithering fail' );
					return;
				}
				Test.display( imageBlock );
				Test.encode( imageBlock, function( file ) {
					if( !file ) {
						console.error( 'test encoding fail' );
						return;
					}
					Test.download( file );
				} );
			} );
		},
		function() { // burkes dithering test
			console.log( 'TEST #: burkes dithering test' );
			var imageBlock = Test.start();
			Test.dither( imageBlock, GIF.DitherType.MONOCHROME_BURKES, function( imageBlock ) {
				if( !imageBlock ) {
					console.error( 'test dithering fail' );
					return;
				}
				Test.display( imageBlock );
				Test.encode( imageBlock, function( file ) {
					if( !file ) {
						console.error( 'test encoding fail' );
						return;
					}
					Test.download( file );
				} );
			} );
		},
		function() { // sierra dithering test
			console.log( 'TEST #: sierra dithering test' );
			var imageBlock = Test.start();
			Test.dither( imageBlock, GIF.DitherType.MONOCHROME_SIERRA, function( imageBlock ) {
				if( !imageBlock ) {
					console.error( 'test dithering fail' );
					return;
				}
				Test.display( imageBlock );
				Test.encode( imageBlock, function( file ) {
					if( !file ) {
						console.error( 'test encoding fail' );
						return;
					}
					Test.download( file );
				} );
			} );
		},
		function() { // jarvis, judice & ninke dithering test
			console.log( 'TEST #: jarvis, judice & ninke dithering test' );
			var imageBlock = Test.start();
			Test.dither( imageBlock, GIF.DitherType.MONOCHROME_JARVIS_JUDICE_NINKE, function( imageBlock ) {
				if( !imageBlock ) {
					console.error( 'test dithering fail' );
					return;
				}
				Test.display( imageBlock );
				Test.encode( imageBlock, function( file ) {
					if( !file ) {
						console.error( 'test encoding fail' );
						return;
					}
					Test.download( file );
				} );
			} );
		},
		function() { // stevenson & arce dithering test
			console.log( 'TEST #: stevenson & arce dithering test' );
			var imageBlock = Test.start();
			Test.dither( imageBlock, GIF.DitherType.MONOCHROME_STEVENSON_ARCE, function( imageBlock ) {
				if( !imageBlock ) {
					console.error( 'test dithering fail' );
					return;
				}
				Test.display( imageBlock );
				Test.encode( imageBlock, function( file ) {
					if( !file ) {
						console.error( 'test encoding fail' );
						return;
					}
					Test.download( file );
				} );
			} );
		},
	],

	init: function( imageBlock ) {
		Test.curCase = 0;
		Test.imageBlock = imageBlock; // save a reference
		// make a copy of the image data to be used in the successive test
		var imageData = imageBlock.imageData;
		Test.imageDataLength = imageData.length;
		Test.imageDataCopy = new Uint8Array( Test.imageDataLength );
		for( var i = 0; i < Test.imageDataLength; i++ ) {
			Test.imageDataCopy[i] = imageData[i];
		}
		window.addEventListener( 'keyup', function( e ) {
			if( e.keyCode !== 13 ) {
				return;
			}
			if( Test.isRunning ) {
				console.warn( 'a test is currently running, please wait...' );
				return;
			}
			Test.isRunning = true;
			Test.cases[Test.curCase]();
			if( ++Test.curCase === Test.cases.length ) {
				console.log( 'TEST END' );
				window.removeEventListener( 'keyup' );
			}
		} );
		console.log( 'TEST INIT: press <return> key to trigger first test case' );
	},
};
