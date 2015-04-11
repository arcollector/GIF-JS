/**
* GIF
*/
var GIF = {
	init: function( canvasSelector ) {
		this.$canvas = null;
		this.ctx = null;
		if( canvasSelector ) {
			this.$canvas = document.querySelector( canvasSelector );
			if( !this.$canvas ) {
				console.error( 'missing elem <canvas> with selector', canvasSelector );
				return;
			}
			this.ctx = this.$canvas.getContext( '2d' );
		}

		this.decoder = new Worker( 'gif.decoder.js');
		this.decoder.addEventListener( 'message', this._decoded.bind( this ) );

		this.encoder = new Worker( 'gif.encoder.js');
		this.encoder.addEventListener( 'message', this._encoded.bind( this ) );

		this._callback = null;
	},
	decode: function( filenameURL, callback ) {
		if( typeof callback !== 'function' ) {
			console.error( 'missing callback param' );
			return;
		}
		this._callback = callback;
		this.decoder.postMessage( filenameURL );
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
		URL.revokeObjectURL( objectURL );
	},
	_callCallback: function( data ) {
		var callback = this._callback;
		this._callback = null;
		callback( data );
	},
};