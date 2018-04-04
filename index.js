

const Log = require( 'log' ), log = new Log();

const DEFAULT_OPTIONS = {
  delay: 0,
  debug: false
};

module.exports = ( options ) => {

  const _options = Object.assign( {}, DEFAULT_OPTIONS, options );

  const { delay, debug } = options;

  const cache = {
    // '/path': {
    //   data: [ ... ],
    //   lastUpdate: 10000
    // }
  };

  if ( debug === 'verbose' ) {
    setInterval( () => {
      log.debug( 'cache: ', JSON.stringify( cache ) );
    }, 400 );
  }

  const fn = ( req, res, next ) => {

    const key = `${req.method} ${req.originalUrl}`;
    const now = ( new Date() ).getTime();

    const validCacheData = cache[ key ] && cache[ key ].data;

    const validCacheAge = validCacheData && 
                          cache[ key ].lastUpdate && 
                          ( now - cache[ key ].lastUpdate < delay );

    if ( validCacheData && validCacheAge ) {
      if ( debug ) log.debug( `fetched from cache: ${key}` )
      return res.json( cache[ key ].data );
    }

    res.setCache = ( value ) => {

      cache[ key ] = {
        data: value,
        lastUpdate: ( new Date() ).getTime()
      };

      if ( debug ) log.debug( `set cache: ${key}:${JSON.stringify( cache[key].data )}` );

    };

    next();

  };

  fn.clear = ( key ) => {
    if ( typeof key !== 'undefined' ) {
      delete cache[ key ];
      return;
    }
    Object.keys( cache ).forEach( ( k ) => {
      delete cache[ k ];
    } );
  };

  return fn;

}