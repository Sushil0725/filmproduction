 'use strict';
 const { app } = require('./src/app');
 const config = require('./src/config');

 const port = config.port;
 app.listen(port, () => {
   console.log(`API server listening on http://localhost:${port}`);
 });
