/**
* TEST
*/

// in firefox you need to setup the option fileuri.strict_origin_policy to false
// in chrome you need to enable the flag access-files-from-file

var filenameURL = 'dragonflies_11612.jpg';
var filenameURL = 'Blue-dragonfly.jpg';
var filenameURL = 'punisher_by_rhinoting.jpg';

GIF.init( {
	libPath: '../../', // relative from the ubication of the test.html file
	imagePath: '', // not need to use where you use loadImageFromURL
} );

GIF.loadImageFromURL( filenameURL, function( imageBlock ) {
	if( !imageBlock ) {
		console.error( 'fail to load image' );
		return;
	}

	Test.init( imageBlock );
} );

var Test = {
	imageBlock: null,
	imageDataCopy: null,
	imageDataLength: 0,
	curCase: 0,
	isRunning: false,
	timestamp: 0,
	$canvas: document.querySelector( '.picture' ),

	restoreImageData: function( imageData ) {
		for( var i = 0; i < Test.imageDataLength; i++ ) {
			imageData[i] = Test.imageDataCopy[i];
		}
	},

	getImageBlock: function() {
		var imageBlock = Test.imageBlock;
		Test.restoreImageData( imageBlock.imageData );
		return imageBlock;
	},

	start: function() {
		this.timestamp = new Date();
	},

	end: function() {
		console.log( 'elapsed time:', (new Date() - this.timestamp) / 1000, 'seconds' );
	},

	dither: function( imageBlock, type, callback ) {
		GIF.dither( imageBlock, type, callback );
	},

	display: function( imageBlock ) {
		GIF.displayOnCanvas( imageBlock, Test.$canvas );
	},

	encode: function( imageBlock, callback ) {
		GIF.encode(
			{
				canvasWidth: imageBlock.canvasWidth,
				canvasHeight: imageBlock.canvasHeight,
				colorBits: imageBlock.colorBits,
				palette: imageBlock.palette,
				bitmaps: [ {
					isUncompressed: false,
					isInterlaced: false,
					top: 0,
					left: 0,
					width: imageBlock.canvasWidth,
					height: imageBlock.canvasHeight,
					imageData: imageBlock.imageData,
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
		function() { // to 256 without filter
			console.log( 'TEST #: to 256 without filter test' );
			var imageBlock = Test.getImageBlock();
			Test.start();
			Test.dither( imageBlock, GIF.DitherType._256_COLORS, function( imageBlock ) {
				if( !imageBlock ) {
					console.error( 'test dithering fail' );
					return;
				}
				Test.display( imageBlock );
				Test.encode( imageBlock, function( file ) {
					Test.end();
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
			var imageBlock = Test.getImageBlock();
			Test.start();
			Test.dither( imageBlock, GIF.DitherType._256_COLORS_FLOYD, function( imageBlock ) {
				if( !imageBlock ) {
					console.error( 'test dithering fail' );
					return;
				}
				Test.display( imageBlock );
				Test.encode( imageBlock, function( file ) {
					Test.end();
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
			var imageBlock = Test.getImageBlock();
			Test.start();
			Test.dither( imageBlock, GIF.DitherType._256_COLORS_STUCKI, function( imageBlock ) {
				if( !imageBlock ) {
					console.error( 'test dithering fail' );
					return;
				}
				Test.display( imageBlock );
				Test.encode( imageBlock, function( file ) {
					Test.end();
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
			var imageBlock = Test.getImageBlock();
			Test.start();
			Test.dither( imageBlock, GIF.DitherType._256_COLORS_BURKES, function( imageBlock ) {
				if( !imageBlock ) {
					console.error( 'test dithering fail' );
					return;
				}
				Test.display( imageBlock );
				Test.encode( imageBlock, function( file ) {
					Test.end();
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
			var imageBlock = Test.getImageBlock();
			Test.start();
			Test.dither( imageBlock, GIF.DitherType._256_COLORS_SIERRA, function( imageBlock ) {
				if( !imageBlock ) {
					console.error( 'test dithering fail' );
					return;
				}
				Test.display( imageBlock );
				Test.encode( imageBlock, function( file ) {
					Test.end();
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
			var imageBlock = Test.getImageBlock();
			Test.start();
			Test.dither( imageBlock, GIF.DitherType._256_COLORS_JARVIS_JUDICE_NINKE, function( imageBlock ) {
				if( !imageBlock ) {
					console.error( 'test dithering fail' );
					return;
				}
				Test.display( imageBlock );
				Test.encode( imageBlock, function( file ) {
					Test.end();
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
			var imageBlock = Test.getImageBlock();
			Test.start();
			Test.dither( imageBlock, GIF.DitherType._256_COLORS_STEVENSON_ARCE, function( imageBlock ) {
				if( !imageBlock ) {
					console.error( 'test dithering fail' );
					return;
				}
				Test.display( imageBlock );
				Test.encode( imageBlock, function( file ) {
					Test.end();
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
			if( Test.curCase >= Test.cases.length ) {
				console.log( 'no more tests' );
				return;
			}
			Test.isRunning = true;
			Test.cases[Test.curCase]();
			if( ++Test.curCase === Test.cases.length ) {
				console.log( 'TEST END' );
				window.removeEventListener( 'keyup' );
			}
		} );
		GIF.displayOnCanvas( imageBlock, Test.$canvas );
		console.log( 'TEST INIT: press <return> key to trigger first test case' );
	},
};
