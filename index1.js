import express from 'express';
import mongoose from 'mongoose';

import  {Markup, Telegraf}  from 'telegraf';
import  dotenv  from 'dotenv';
import TelegramBot  from 'telegram-bot-api';
import {commands} from './const.js';
import {EngWords,RusWords,insertWords,deleteWord} from './utils/db.js';
import {generateID,isRussian} from './utils/utils.js';

const log = console.log;

const questions = [
    {
      question: 'What is the capital of France?',
      options: ['Paris', 'Rome', 'Berlin', 'Madrid'],
      correctAnswer: 'Paris'
    },
    {
      question: 'What is the largest planet in the solar system?',
      options: ['Earth', 'Jupiter', 'Mars', 'Saturn'],
      correctAnswer: 'Jupiter'
    },
    // more questions...
  ]

const PORT = 5000;
const URL = 'mongodb+srv://Beksultan:oC4IwyMLujIyECUA@cluster0.nnynldx.mongodb.net/test?retryWrites=true&w=majority';

const app = express();

dotenv.config(); 
const bot = new Telegraf(process.env.BOT_TOKEN);
const bot2 = new TelegramBot({token: process.env.BOT_TOKEN,polling: true});
let lastCommand = null;

bot.start((ctx) => {
    ctx.reply(`Hello ${ctx.message.from.first_name}`)
});

bot.help((ctx) => {
    ctx.reply(commands)
});

// const dsfsdf = bot2.getMyCommands;

bot.use(async (ctx, next) => {
    bot2.getMyCommands()
    .then(async (commands) => {
        
        commands = commands.map((cmd) => cmd.command);
        if (ctx.hasOwnProperty('message') && ctx.message.text.startsWith('/') && !commands.includes(ctx.message.text.slice(1))){
            ctx.reply('Invalid Command');
            return
        };
        if (ctx.message && ctx.message.text.startsWith('/') && commands.includes(ctx.message.text.slice(1))) {
            // The message is a command - store it as the last command received
            lastCommand = ctx.message.text;
            if (lastCommand == '/insert'){
                ctx.reply('Write Words');
            };
            if (lastCommand == '/delete'){
                ctx.reply('Write a word that You wanna delete');
            };
            if (lastCommand == '/listwords'){
                // var arr = await db.collection('engwords').find({}).toArray();
              
                let arr = await EngWords.find({});
                var obj = {};
                for(let {newId,word} of arr){
                    obj[newId] = word;
                };
                var listIds = arr.map((t) => t.newId);

                // // collection.find({ _id: { $in: arr } }).toArray((err, docs) => {
                // //     console.log(docs);
                // //     // client.close();
                // // });

                let rusWords = await RusWords.find({});
                // var rusWords = await db.collection('ruswords').find({ newId: { $in: listIds } }).toArray();

                var listWords = rusWords.map((t) => {
                    return `${obj[t.newId]} - ${t.word}`;
                });
                ctx.replyWithHTML(listWords.join('\n'));
            }

            return;
        }

        return next();

    })
    .catch((err) => {
        console.error(err);
    });
});

bot.command('start_quiz', ctx => {
    // code to start the quiz
    ctx.reply(questions[0].question, Markup.inlineKeyboard(
      questions[0].options.map(option => Markup.button.callback(option, option))
    ))
  })

// bot.on('callback_query', (callbackQuery) => {
//     const action = callbackQuery.data;
//     const message = callbackQuery.message;
//     // const chatId = message.chat.id;
//     if (action === 'btn_1') {
//         bot.sendMessage('sfsd', 'Button 1 was clicked!');
//     } else if (action === 'btn_2') {
//         bot.sendMessage('sfs', 'Button 2 was clicked!');
//     };

// });
bot.action(/.*/, ctx => {
    // get the current question number
    // const currentQuestion = ctx.session.currentQuestion || 0;
    // console.log(currentQuestion,'ques')
    
    // check if the answer is correct
    // if (ctx.match[0] === questions[currentQuestion].correctAnswer) {
    //   ctx.session.score = ctx.session.score || 0
    //   ctx.session.score++
    //   ctx.reply(`Correct! Your current score is ${ctx.session.score}.`)
    // } else {
    //   ctx.reply('Incorrect.')
    // }
    // // increment the current question number
    // ctx.session.currentQuestion = currentQuestion + 1
    // // check if there are more questions
    // if (questions[ctx.session.currentQuestion]) {
    //   ctx.reply(questions[ctx.session.currentQuestion].question, Markup.inlineKeyboard(
    //     questions[ctx.session.currentQuestion].options.map(option => Markup.callbackButton(option, option))
    //   ).extra())
    // } else {
    //   ctx.reply(`Quiz finished! Your final score is ${ctx.session.score}.`)
    // }
  })
  
bot.on('text', (ctx) => {
    if (lastCommand === '/insert'){
        let list = ctx.message.text.split('-');
        if (list.length != 2){
            ctx.reply('Invalid Words', 'Try again');
            return
        };
        let [eng,rus] = list;
        if(isRussian(rus)){
            insertWords(eng.trim(),rus.trim(),ctx);
        }else {
            insertWords(rus.trim(),eng.trim(),ctx);
        }

    }else if (lastCommand === '/delete'){
        deleteWord(ctx.message.text,ctx);
    };

});

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

// const dsfsdf = bot.commands.map((cmd) => cmd.command);

// Enable graceful stop


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
