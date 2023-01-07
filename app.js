import express from 'express';
import './utils/db.js';

const app = express();
app.listen(3000,function(){
    console.log('listening',3000);
})