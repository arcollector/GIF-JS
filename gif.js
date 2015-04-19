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

		this.ditherer = new Worker( path + 'gif.dither.js');
		this.ditherer.addEventListener( 'message', this._dithered.bind( this ) );

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

	// display can also works with instances of ImageData
	display: function( imagesBlock, curIndex ) {
		imagesBlock = !Array.isArray( imagesBlock ) ? [ imagesBlock ] : imagesBlock;
		curIndex = curIndex || 0;
		var imageBlock = imagesBlock[curIndex];
		this._display( imageBlock.imageData || imageBlock.data, imageBlock.canvasWidth || imageBlock.width, imageBlock.canvasHeight || imageBlock.height );
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

	loadImage: function( filenameURL, callback ) {
		if( typeof callback !== 'function' ) {
			console.error( 'missing callback param' );
			return;
		}
		this._callback = callback;
		var $img = new Image();
		$img.src = this._imagesPath + filenameURL;
		$img.onload = this._imageLoadedOk.bind( this );
		$img.onerror = this._imageLoadedFail.bind( this );
	},
	_imageLoadedOk: function( e ) {
		// get the image data by using <canvas> getImageData native function
		var $canvas = document.createElement( 'canvas' );
		var $img = e.target;
		var width = $canvas.width = $img.width;
		var height = $canvas.height = $img.height;
		var ctx = $canvas.getContext( '2d' );
		ctx.drawImage( e.target, 0, 0 );
		var image = ctx.getImageData( 0, 0, width, height );
		this._callCallback( {
			canvasWidth: width,
			canvasHeight: height,
			imageData: image.data,
		} );
	},
	_imageLoadedFail: function( e ) {
		this._callCallback( null );
	},

	dither: function( imageBlock, type, callback ) {
		if( typeof callback !== 'function' ) {
			console.error( 'missing callback param' );
			return;
		}
		this._callback = callback;
		this.ditherer.postMessage( {
			imageBlock: imageBlock,
			type: type
		} );
	},
	_dithered: function( e ) {
		this._callCallback( e.data );
	},

	_callCallback: function( data ) {
		var callback = this._callback;
		this._callback = null;
		callback( data );
	},
	_checkPathCorrectness: function( path ) {
		return path.length && path.substring( path.length-1 ) !== '/' ? '/' : '';
	},
};

GIF.DitherType = {
	MONOCHROME: 0x01,
	MONOCHROME_BAYER: 0x02,
	MONOCHROME_FLOYD: 0x03,
	MONOCHROME_STUCKI: 0x04,
	MONOCHROME_BURKES: 0x05,
	MONOCHROME_SIERRA: 0x06,
	MONOCHROME_JARVIS_JUDICE_NINKE: 0x07,
	MONOCHROME_STEVENSON_ARCE: 0x08,

	GRAY_SCALE: 0x10,

};
