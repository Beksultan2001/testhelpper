import express from 'express';
import mongoose from 'mongoose';

import  {Markup, Telegraf}  from 'telegraf';
import  dotenv  from 'dotenv';
import TelegramBot  from 'telegram-bot-api';
import {mongo} from './utils/db.js';
import {isRussian,mixArray} from './utils/utils.js';

const log = console.log;

const PORT = 5001;
const URL = 'mongodb+srv://Beksultan:oC4IwyMLujIyECUA@cluster0.nnynldx.mongodb.net/test?retryWrites=true&w=majority';

const app = express();

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const bot2 = new TelegramBot({token: process.env.BOT_TOKEN,polling: true});

bot.start((ctx) => {
    ctx.reply(`Hello ${ctx.message.from.first_name}`);
});
class BOT{
    constructor(){
        this.lastCommand = null;
        this._starter();
    }
    insertWord(ctx){
        let list = ctx.message.text.split('-');
        if (list.length != 2){
            ctx.reply('Invalid Words', 'Try again');
            return;
        };
        let [eng,rus] = list;
        if(isRussian(rus)){
            mongo.insertWords(eng.trim(),rus.trim(),ctx);
        }else {
            mongo.insertWords(rus.trim(),eng.trim(),ctx);
        }
    };
    getText(ctx){
        
        let last = this.lastCommand;
        switch(last){
            case '/insert' : {
                this.insertWord(ctx);
                break;
            }
            case '/delete' : {
                mongo.deleteWord(ctx.message.text,ctx);
                break;
            };
            case '/search' : {
                mongo.searchWord(ctx.message.text,ctx);
                break;
            };
        };

    }
    async middleWare(ctx,next){

        let oThis = this;

        let commands = await bot2.getMyCommands();

        commands = commands.map((cmd) => cmd.command);

        if (ctx.message && ctx.message.text.startsWith('/') && !commands.includes(ctx.message.text.slice(1))){
            ctx.reply('Invalid Command');
            return;
        };

        if (ctx.message && ctx.message.text.startsWith('/')) {

            oThis.lastCommand = ctx.message.text;
            let last = oThis.lastCommand;
            switch(last){
                case '/insert':
                    ctx.reply('write words');
                    break;
                case '/delete':
                    ctx.reply('write a word to delete');
                    break;
                case '/listwords':
                    let arr = await mongo.EngWords.find({});
                    let obj = {};
                    for(let {newId,word} of arr){
                        obj[newId] = word;
                    };
                    let rusWords = await mongo.RusWords.find({});
                    let listWords = rusWords.map((t) => {
                        return `${obj[t.newId]} - ${t.word}`;
                    });
                    for(let i = 0; i<listWords.length; i+=25){
                        let sliceList = listWords.slice(i,i+25);
                        await ctx.replyWithHTML(sliceList.join('\n'));
                    }
                    break;
                case '/search': {
                    ctx.reply('Write word to search');
                    break;
                }
                case '/lastwords': {
                    let today = new Date();
                    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    let arr = await mongo.EngWords.find({created: {
                        $gte: yesterday,
                        $lt: today
                    }});
                    let obj = {};
                    for(let {newId,word} of arr){
                        obj[newId] = word;
                    };
                    let rusWords = await mongo.RusWords.find({created: {
                        $gte: yesterday,
                        $lt: today
                    }});
                    let listWords = rusWords.map((t) => {
                        return `${obj[t.newId]} - ${t.word}`;
                    });
                    if (!listWords.length){
                        ctx.reply('there is no words');
                        return;
                    }
                    ctx.replyWithHTML(listWords.join('\n'));
                    break;
                }
                case '/random':
                    mongo.randomWord(ctx);
                    break;
            };

            return 

        };

        return next();
    }
    async _starter(){

        bot.use(this.middleWare.bind(this));
        bot.on('text', this.getText.bind(this));
        bot.action(/.*/, async ctx => {            
            let data = ctx.update.callback_query.data;
            let text = ctx.update.callback_query.message.text;
            ctx.answerCbQuery();
            if (data.indexOf('ran') != -1){
                let list = data.split('-');

                if (list[1] == 'true'){                    
                    ctx.replyWithHTML('<b>True</b>' + '\n' + text + ' - ' + list[2]);
                    mongo.randomWord(ctx);
                }else {
                    ctx.replyWithHTML('<b>Wrong option</b> : ' + list[2]);
                }
            };
        });
    }
};

const newBot = new BOT();

mongoose.set('strictQuery', true);

app.use(express.json());

app.get('/',function(req,res){
    EngWords.find({},function(err,words){
        if (err){
            console.error(err,'err')
        }else {
            console.log(words,'words')
        }
    })
    res.send('Hi');
});


bot.launch();


process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


function startApp(){
    try{
        mongoose.connect(URL,{ useNewUrlParser: true });
        app.listen(PORT,function(){
            console.log('Listenning ',PORT);
        })
    }catch(e){
        console.error(e,'error')
    }
};
startApp();
