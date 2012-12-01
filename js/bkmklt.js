( function( _w ) {
  
  var WG = new Object();
  
  var Bookmarklet = function( options ) {
    this.options = {
      widget: {
        tmpl: "<div class='wg_bkmklt'>\
          <input id='wg_bkmklt_input' type='text' size='25' value='#{value}' />\
          <button id='wg_bkmklt_save_button'>Save</button>\
        </div>"
      }
    }
    for ( var i in options ) {
      if ( options.hasOwnProperty( i ) ) {
        this.options[ i ] = options[ i ];
      }
    }
    this.init();
  }
  
  Bookmarklet.prototype.init = function() {
    this.initWidget();
  }
  
  Bookmarklet.prototype.tmpl = function( str_tmpl, params ) {
    var result = str_tmpl;
    
    for ( var i in params ) {
      if ( params.hasOwnProperty( i ) ) {
        result = result.replace( new RegExp( '#{' + i + '}', 'g' ), params[ i ] );
      }
    }
    
    return result;
  }
  
  Bookmarklet.prototype.initWidget = function() {
    var str_tmpl = this.options.widget.tmpl;
    document.body.innerHTML += this.tmpl( str_tmpl, {
      value: this.getValue()
    } );
  }
  
  Bookmarklet.prototype.getValue = function() {
    return "mnbmnb";
  }
  
  WG.Bookmarklet = Bookmarklet;
  
  _w.WG = WG;
  
  new _w.WG.Bookmarklet();
  
} )( window );