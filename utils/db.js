import mongoose from 'mongoose';
import { generateID ,mixArray} from './utils.js';
import  {Markup, Telegraf}  from 'telegraf';

const log = console.log;

class MongoDB {
    constructor(){
        this.wordSchema = new mongoose.Schema({
            newId: String,
            word: String
        });
        this.EngWords = mongoose.model('engwords', this.wordSchema);
        this.RusWords = mongoose.model('ruswords', this.wordSchema);
    };
    async randomWord(ctx){


        let listEng = await this.EngWords.find({});

        let {newId,word : engWord} = listEng[Math.floor(Math.random() * listEng.length)];

        let rusWord = await this.RusWords.findOne({newId: newId});
        let arr = [rusWord];

        let listRus = await this.RusWords.find({});
        
        for(let i = 0; i<3; i++){

            let elem = listRus[Math.floor(Math.random() * listRus.length)];

            let {newId : id} = elem;

            let check = arr.some(t => t.newId == id)
            
            if (!check && newId != id){
                arr.push(elem);
            }else {
                i--;
            }
        };

        arr = mixArray(arr);

        function btn(word,id)
        {
            let obj = {
                type: 'quiz',
                id: id,
                newId: newId,
            };
            let text = 'ran-'+(id===newId) + '-' + word;
            return Markup.button.callback(word,text);
        };

        // arr = arr.map((t) => [Markup.button.callback(t.word,'1')]);

        ctx.replyWithHTML(('<b>' + engWord+'</b>'),Markup.inlineKeyboard([[btn(arr[0].word,arr[0].newId),btn(arr[1].word,arr[1].newId)],[btn(arr[2].word,arr[2].newId),btn(arr[3].word,arr[3].newId)]]));

        // let list = await this.EngWords.find({ createdAt: { $gte: yesterday }});

        // let {word:Rus} = await this.RusWords.findOne({newId: newId});

        // let {newId,word} = list[Math.floor(Math.random() * list.length)];
        // let {word:Rus} = await this.RusWords.findOne({newId: newId});
        // ctx.reply(`${word} - ${Rus}`);

        
    }
    async insertWords(word1,word2,ctx){

        let check = await this.EngWords.findOne({word: word1});
        if (check){
            ctx.reply('There is a already such word');
            return;
        }
        var newId = generateID();
    
        let eng = await this.EngWords.create({newId: newId, word: word1});
        let rus = await this.RusWords.create({newId: newId, word: word2});    

        ctx.reply('Accepted');

    }
    async deleteWord(word,ctx){
        
        let engWords = await this.EngWords.find({word: word});
    
        if (engWords.length >= 1){
            log(engWords[0]);
        }else {
            ctx.reply('There is no such word');
            return;
        };
    
        for(let {newId} of engWords){
            let res1 = await this.EngWords.deleteMany({newId: newId});
            let res2 = await this.RusWords.deleteMany({newId: newId});
        };
    
        ctx.reply('Successfully deleted');
    }

};

export const mongo = new MongoDB();
