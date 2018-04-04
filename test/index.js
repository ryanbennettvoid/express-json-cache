
const Promise = require( 'bluebird' );
const Log = require( 'log' ), log = new Log();
const test = require( 'tape' );
const express = require( 'express' );
const request = require( 'request' );
const lo = require( 'lodash' );
const requestCache = require( '../index.js' );

const ENDPOINT_A = '/my/endpoint/A';
const ENDPOINT_B = '/my/endpoint/B';
const PORT = 8888;
const OPTS = { delay: 1000, debug: 'verbose' };
const myRequestCache = requestCache( OPTS );

const sendRequest = ( method, endpoint ) => {
  return new Promise( ( resolve, reject ) => {
    request( {
      method,
      url: `http://localhost:${PORT}${endpoint}`,
      json: true
    }, ( err, res, body ) => {
      if ( err ) return reject( err );
      if ( res.statusCode !== 200 ) return reject( body );
      resolve( body );
    } )
  } );
}

// ----

test( 'start server', ( t ) => {

  const app = express();

  app.use( myRequestCache );

  app.get( ENDPOINT_A, ( req, res ) => {
    const msg = ( new Date() ).getTime();
    res.setCache( msg );
    res.json( msg );
  } )
  ;

  app.get( ENDPOINT_B, ( req, res ) => {
    const msg = ( new Date() ).getTime();
    res.setCache( msg );
    res.json( msg );
  } )
  ;

  app.listen( PORT, () => {
    t.end();
  } );

} );

test( 'check that request is cached < delay (A)', ( t ) => {

  const nums = [];

  for ( let i = 0; i < 3; i++ ) {
    nums.push( i );
  }

  return Promise.reduce( nums, ( acc, num ) => {

    return sendRequest( 'GET', ENDPOINT_A )
    .then( ( response ) => {
      log.debug( 'response: ', response );
      return acc.concat( response );
    } )
    ;

  }, [] )
  .then( ( results ) => {
    t.equal( lo.uniq( results ).length, 1 );
  } )
  .catch( ( err ) => {
    t.fail( err );
  } )
  .finally( () => {
    t.end();
  } )
  ;

} );

test( 'wait for cache to invalidate', ( t ) => {

  setTimeout( () => {
    t.end();
  }, OPTS.delay + 1000 );

} );

test( 'check that cache is invalidated > delay (A)', ( t ) => {

  // should show unique results for each
  // request if spaced out > delay

  const numIterations = 3;

  const nums = [];

  for ( let i = 0; i < numIterations; i++ ) {
    nums.push( i );
  }

  return Promise.reduce( nums, ( acc, num ) => {

    return Promise.delay( OPTS.delay + 100 )
    .then( () => {
      return sendRequest( 'GET', ENDPOINT_A );
    } )
    .then( ( response ) => {
      log.debug( 'response: ', response );
      return acc.concat( response );
    } )
    ;

  }, [] )
  .then( ( results ) => {
    log.debug( 'results: ', results );
    t.equal( lo.uniq( results ).length, numIterations );
  } )
  .catch( ( err ) => {
    t.fail( err );
  } )
  .finally( () => {
    t.end();
  } )
  ;

} );

// --- 

test( 'check that request is cached < delay (B)', ( t ) => {

  const nums = [];

  for ( let i = 0; i < 3; i++ ) {
    nums.push( i );
  }

  return Promise.reduce( nums, ( acc, num ) => {

    return sendRequest( 'GET', ENDPOINT_B )
    .then( ( response ) => {
      log.debug( 'response: ', response );
      return acc.concat( response );
    } )
    ;

  }, [] )
  .then( ( results ) => {
    t.equal( lo.uniq( results ).length, 1 );
  } )
  .catch( ( err ) => {
    t.fail( err );
  } )
  .finally( () => {
    t.end();
  } )
  ;

} );

test( 'check that caching considers different query params < delay (B)', ( t ) => {

  const nums = [];

  for ( let i = 0; i < 3; i++ ) {
    nums.push( i );
  }

  return Promise.reduce( nums, ( acc, num ) => {

    return sendRequest( 'GET', `${ENDPOINT_B}?n=${num}` )
    .then( ( response ) => {
      log.debug( 'response: ', response );
      return acc.concat( response );
    } )
    ;

  }, [] )
  .then( ( results ) => {
    t.equal( lo.uniq( results ).length, nums.length );
  } )
  .catch( ( err ) => {
    t.fail( err );
  } )
  .finally( () => {
    t.end();
  } )
  ;

} );

test( 'wait for cache to invalidate', ( t ) => {

  setTimeout( () => {
    t.end();
  }, OPTS.delay + 1000 );

} );

test( 'check that cache is invalidated > delay (B)', ( t ) => {

  // should show unique results for each
  // request if spaced out > delay

  const numIterations = 3;

  const nums = [];

  for ( let i = 0; i < numIterations; i++ ) {
    nums.push( i );
  }

  return Promise.reduce( nums, ( acc, num ) => {

    return Promise.delay( OPTS.delay + 100 )
    .then( () => {
      return sendRequest( 'GET', ENDPOINT_B );
    } )
    .then( ( response ) => {
      log.debug( 'response: ', response );
      return acc.concat( response );
    } )
    ;

  }, [] )
  .then( ( results ) => {
    log.debug( 'results: ', results );
    t.equal( lo.uniq( results ).length, numIterations );
  } )
  .catch( ( err ) => {
    t.fail( err );
  } )
  .finally( () => {
    t.end();
  } )
  ;

} );

test( 'wait for cache to invalidate', ( t ) => {

  setTimeout( () => {
    t.end();
  }, OPTS.delay + 1000 );

} );

// ----

test( 'clear cache when < delay (B)', ( t ) => {

  const nums = [];

  for ( let i = 0; i < 3; i++ ) {
    nums.push( i );
  }

  return Promise.reduce( nums, ( acc, num ) => {

    return Promise.resolve()
    .then( () => {
      myRequestCache.clear();
      return sendRequest( 'GET', ENDPOINT_B )
    } )
    .then( ( response ) => {
      log.debug( 'response: ', response );
      return acc.concat( response );
    } )
    ;

  }, [] )
  .then( ( results ) => {
    t.equal( lo.uniq( results ).length, nums.length );
  } )
  .catch( ( err ) => {
    t.fail( err );
  } )
  .finally( () => {
    t.end();
  } )
  ;

} );

test( 'wait to log cleared cache', ( t ) => {

  myRequestCache.clear();

  setTimeout( () => {
    t.end();
    process.exit();
  }, OPTS.delay + 1000 );

} );