import  {Markup, Telegraf}  from 'telegraf';
import  dotenv  from 'dotenv';
import {commands} from './const.js';


const log = console.log;

dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => {
    // console.log(ctx.message,'message')
    ctx.reply(`Hello ${ctx.message.from.first_name}`)
});
bot.help((ctx) => {
    ctx.reply(commands)
});

bot.command('course', async (ctx) => {
    try{
        await ctx.replyWithPhoto({
            url: 'https://picsum.photos/536/354'
        })
        await ctx.replyWithHTML('<b>Courses</b>', Markup.inlineKeyboard(
            [
                [
                    Markup.button.callback('Btn1','btn_1'),Markup.button.callback('Btn2','btn_2'),
                    Markup.button.callback('Btn3','btn_3')
                ],
                [
                ,Markup.button.callback('Btn4','btn_4'),
                ]
            ] 
        ));
    } catch(e){
        log(e,'e')
    }
});

function addActionBot(name,src,text){
    bot.action(name,async (ctx) => {
        try{
            await ctx.answerCbQuery();
            if (src != false){
              await ctx.replyWithPhoto({
                source: src
              })
            };
            await ctx.replyWithHTML(text,{
                // disable_web_page_preview: true
            });
        }catch(e){
    
        }
    });
};

addActionBot('btn_1','./img/img1.jpg','This is just a photo');
addActionBot('btn_2','./img/img2.jpg','This is just a photo');
addActionBot('btn_3','./img/img3.jpg','This is just a photo');


// bot.on('sticker', (ctx) => ctx.reply('👍'));
// bot.hears('hi', (ctx) => ctx.reply('Hey there'));

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

