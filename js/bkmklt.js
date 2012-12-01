( function( _w ) {
  
  var WG = new Object();
  
  var Bookmarklet = function( options ) {
    this.options = {
      widget: {
        button_id: 'wg_bkmklt_save_button',
        input_id: 'wg_bkmklt_input',
        html_tmpl: "<div class='wg_bkmklt'>\
          <input id='#{input_id}' type='text' size='25' />\
          <button id='#{button_id}'>Save</button>\
        </div>",
        style_tmpl: "<style type='text/css' media='screen'>\
          .wg_bkmklt {\
            position: absolute;\
            width: 200px;\
            background-color: lightgrey;\
            right: 0;\
            top: 0;\
            padding: 5px;\
            border-radius: 0 0 0 7px;\
          }\
        </style>"
      },
      db: {
        name: 'wg_bkmklt',
        specification: '1.0',
        description: 'WikiGraph articles table',
        bytesize: 1024 * 1024,
        tables: {
          articles: 'articles'
        }
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
    this.initStorage();
    this.initWidget();
    this.bindControls();
  }
  
  var _dbExec = function( db, query, args, succ, err ) {
    if ( !( args instanceof Array ) ) {
      err = succ;
      succ = args;
    }
    args = args || [];
    succ = succ || function() { console.log( "succ" ) };
    err = err || function() { console.log( "err" ) };
    db.transaction( function ( tx ) {
      tx.executeSql( query, args, succ, err );
    });
  }
  
  var _createTable = function( db, succ, err ) {
    var query = 'CREATE TABLE IF NOT EXISTS ' +
    this.options.db.tables.articles +
    ' ' +
    '(' +
    'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
    'url TEXT NOT NULL, ' +
    'content TEXT NOT NULL' +
    ');';
    _dbExec.call( this, db, query, succ, err );
  }
  
  var _getUrl = function() {
    return "" + window.location.href;
  }
  
  Bookmarklet.prototype.initStorage = function() {
    this._db = openDatabase(
      this.options.db.name,
      this.options.db.specification,
      this.options.db.description,
      this.options.db.bytesize
    );
    _createTable.call( this, this._db );
  }
  
  Bookmarklet.prototype.bindControls = function() {
    var button = document.getElementById( this.options.widget.button_id ),
        input = document.getElementById( this.options.widget.input_id ),
        self = this;
    
    button.addEventListener( "click", function() {
      self.setValue.call( self, input.value );
    }, false );
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
    var html_tmpl = this.options.widget.html_tmpl,
        style_tmpl = this.options.widget.style_tmpl,
        input;
    
    document.head.innerHTML += this.tmpl( style_tmpl, {} );
    
    document.body.innerHTML += this.tmpl( html_tmpl, {
      value: '',
      input_id: this.options.widget.input_id,
      button_id: this.options.widget.button_id,
    });
    
    input = document.getElementById( this.options.widget.input_id );
    
    this.getValue( function( tx, res ) {
      if ( res.rows.length > 0 ) {
        input.value = res.rows.item( 0 )[ 'content' ];
      }
    }, function() {
      console.log( "Error quering value" );
    } );
  }
  
  Bookmarklet.prototype.getValue = function( succ, err ) {
    var query = "SELECT content FROM " + 
    this.options.db.tables.articles +
    " WHERE url=?;";
    _dbExec( this._db, query, [ _getUrl() ], succ, err );
  }
  
  Bookmarklet.prototype.setValue = function( v, succ, err ) {
    var query = "SELECT COUNT(*) AS cnt FROM " + 
        this.options.db.tables.articles +
        " WHERE url=?;",
        self = this;
    
    _dbExec( this._db, query, [ _getUrl() ], function( tx, res ) {
      var key_exists = ( res.rows.length > 0 ) && ( res.rows.item( 0 ).cnt > 0 );
      key_exists ? self.updValue( v, succ, err ) : self.insertValue( v, succ, err );
    }, err );
  }
  
  Bookmarklet.prototype.updValue = function( v, succ, err ) {
    var query = "UPDATE " +
    this.options.db.tables.articles +
    " SET content=? WHERE url=?;";
    _dbExec( this._db, query, [ v, _getUrl() ], succ, err );
  }
  
  Bookmarklet.prototype.insertValue = function( v, succ, err ) {
    var query = "INSERT INTO " +
    this.options.db.tables.articles +
    " (url, content) VALUES (?, ?);";
    _dbExec( this._db, query, [ _getUrl(), v ], succ, err );
  }
  
  WG.Bookmarklet = Bookmarklet;
  
  _w.WG = WG;
  
  new _w.WG.Bookmarklet();
  
} )( window );