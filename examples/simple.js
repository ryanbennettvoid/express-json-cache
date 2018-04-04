
const express = require( 'express' ), app = express();
const requestCache = require( '../index.js' );
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