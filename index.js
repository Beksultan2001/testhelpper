import  {Markup, Telegraf}  from 'telegraf';
import  dotenv  from 'dotenv';
import {commands} from './const.js';
import TelegramBot  from 'telegram-bot-api';
import {MongoClient} from './utils/db.js';
const url = 'mongodb+srv://Beksultan:oC4IwyMLujIyECUA@cluster0.nnynldx.mongodb.net/?retryWrites=true&w=majority';

const log = console.log;

dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply(`Hello ${ctx.message.from.first_name}`)
});
bot.help((ctx) => {
    ctx.reply(commands)
});

const bot2 = new TelegramBot({token: '5703636061:AAHdMzh1qZjgdMucvdmXNV0QdNruJcXJVNA',polling: true});

let lastCommand = null;

// This middleware function will be executed for every incoming message

function generateID() {
    return Math.random().toString(36).substr(2, 16);
}

function isRussian(str) {
    return /[^\x00-\x7F]/.test(str);
}

MongoClient.connect(url,(error,client) => {
    if (error){
        console.log(error);
        return;
    }; 

    const db = client.db('test');

    bot.use(async (ctx, next) => {

        bot2.getMyCommands()
        .then(async (commands) => {
            
            commands = commands.map((cmd) => cmd.command);
    
            if (ctx.message.text.startsWith('/') && !commands.includes(ctx.message.text.slice(1))){
                ctx.reply('Invalid Command');
                return
            }
            
            if (ctx.message.text && ctx.message.text.startsWith('/') && commands.includes(ctx.message.text.slice(1))) {
                // The message is a command - store it as the last command received
                lastCommand = ctx.message.text;
                if (lastCommand == '/insert'){
                    ctx.reply('Write Words');
                };
                if (lastCommand == '/listwords'){

                    var arr = await db.collection('engwords').find({}).toArray();

                    var obj = {};

                    for(let {newId,word} of arr){
                        obj[newId] = word;
                    };

                    var listIds = arr.map((t) => t.newId);

                    // collection.find({ _id: { $in: arr } }).toArray((err, docs) => {
                    //     console.log(docs);
                    //     // client.close();
                    // });
                    var rusWords = await db.collection('ruswords').find({ newId: { $in: listIds } }).toArray();

                    var listWords = rusWords.map((t) => {
                        return `${obj[t.newId]} - ${t.word}`;
                    });

                    ctx.replyWithHTML(listWords.join('\n'));
                    // for(const {newId,word} of res){
                    //     db.collection('ruswords').find({newId: newId})
                    //     .then(res => console.log(res))
                    //     .catch(e => console.log(e,'e'));
                    // }
                }
    
                return;
            }
    
            return next();
    
        })
        .catch((err) => {
            console.error(err);
        });
    });

    function insertWords(word1,word2){

        var newId = generateID();
        
        db.collection('engwords').insertOne({newId: newId, word: word1})
        .then(res => console.log(res,'res'))
        .catch(e => console.log(e,'e'));

        db.collection('ruswords').insertOne({newId: newId,word: word2})
        .then(res => console.log(res,'res'))
        .catch(e => console.log(e,'e')); 

        // db.collection('engwords').deleteMany({})
        // .then(res => console.log(res,'res'))
        // .catch(e => console.log(e,'e'));

        // db.collection('ruswords').deleteMany({})
        // .then(res => console.log(res,'res'))
        // .catch(e => console.log(e,'e')); 

    };

    bot.on('text', (ctx) => {
    
        if (lastCommand === '/insert'){
            let list = ctx.message.text.split('-');
            if (list.length != 2){
                ctx.reply('Invalid Words', 'Try again');
                return
            };

            let [eng,rus] = list;

            if(isRussian(rus)){
                insertWords(eng.trim(),rus.trim());
            }else {
                insertWords(rus.trim(),eng.trim());
            }

            ctx.reply('Accepted');

        }
    });

    
});

bot.launch();

// const dsfsdf = bot.commands.map((cmd) => cmd.command);

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

