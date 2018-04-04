# express-json-cache

`express-json-cache` is a simple express middleware for caching JSON responses.

- The `delay` option is the max age of a cache entry before it is invalidated.
- A single cache instance can be shared among multiple routes. It holds a dictionary mapping keys to values.
- A cache key is composed from the HTTP method, endpoint and query parameters.

Minimal example:
``` js
const express = require( 'express' ), app = express();
const requestCache = require( 'express-json-cache' );
const myRequestCache = requestCache( { delay: 3000, debug: true } );

app.get( '/', myRequestCache, ( req, res ) => {

  const msg = {
    cake: 'isGood',
    timestamp: ( new Date() ).getTime()
  };

  res.setCache( msg );
  res.json( msg );

} )
;

app.listen( process.env.PORT||8080, () => {
  console.log( 'listening...' );
} );
```

Usage (per route):
``` js
const requestCache = require( 'express-json-cache' );
const myRequestCache = requestCache( { delay: 3000 } );

// uses cache middleware
app.get( '/', myRequestCache, ( req, res ) => {

  const msg = {
    cake: 'isGood',
    timestamp: ( new Date() ).getTime()
  };

  res.setCache( msg ); // set cache value here
  res.json( msg );

} );

// does not use cache middleware
app.get( '/another', ( req, res ) => {
    ...
    res.json(...);
} );
```

Or the `router.use` approach:
``` js
const requestCache = require( 'express-json-cache' );
const myRequestCache = requestCache( { delay: 3000 } );

// everything after this uses the cache middleware
app.use( myRequestCache );

app.get( '/', ( req, res ) => {

  const msg = {
    cake: 'isGood',
    timestamp: ( new Date() ).getTime()
  };

  res.setCache( msg );
  res.json( msg );

} );

app.get( '/another', ( req, res ) => {
    ...
    res.setCache(...);
    res.json(...);
} );
```

Clear the cache:
``` js
myRequestCache.clear();
```

Testing:
``` js
npm install -g tape
npm test
```