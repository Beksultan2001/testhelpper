import mongoose from 'mongoose';
import { generateID ,mixArray} from './utils.js';
import  {Markup, Telegraf}  from 'telegraf';

const log = console.log;

class MongoDB {
    constructor(){
        this.wordSchema = new mongoose.Schema({
            newId: String,
            word: String,
            created: {
                type: Date,
                required: true
            }
        });
        this.saveDates = new mongoose.Schema({
            timeInsert: String
        });
        this.EngWords = mongoose.model('engwords', this.wordSchema);
        this.RusWords = mongoose.model('ruswords', this.wordSchema);
        this.modelDates = mongoose.model('randomInsert', this.saveDates);
    };

    async randomWord(ctx){

        let oThis = this;
        
        
        let p1 = new Promise( async (resolve,reject) => {

            let listEng = await this.EngWords.find({});
            let bool = true;
            let today = new Date();
            today = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
            while(bool){
                let {newId,word : engWord} = listEng[Math.floor(Math.random() * listEng.length)];
                let generate = `${today}/${newId}`;
                let checkItexists = await oThis.modelDates.findOne({timeInsert: generate});
                if (!checkItexists){
                    let insertWord = await oThis.modelDates.create({timeInsert: generate});
                    bool = false;
                    resolve({newId,engWord});
                    break;
                }
            };
        });

        p1.then((t) => {
            Handle(t.newId,t.engWord);
        }).catch((e) => {
            log(e,'e');
        });
        
        async function Handle(newId,engWord){

            let rusWord = await oThis.RusWords.findOne({newId: newId});
            let arr = [rusWord];
    
            let listRus = await oThis.RusWords.find({});
            
            for(let i = 0; i<5; i++){
    
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
                let text = 'ran-'+(id===newId) + '-' + word;
                return Markup.button.callback(word,text);
            };
    
            let markList = [];
    
            for(let i = 0; i<arr.length; i+=2){
                markList.push(helper(arr.slice(i,i+2)));
            };
    
            function helper(list){
                list = list.map((t) => {
                    return btn(t.word,t.newId)
                });
                return list;
            };
    
            ctx.replyWithHTML(('<b>' + engWord+'</b>'),Markup.inlineKeyboard(markList));
        };

    }
    async insertWords(word1,word2,ctx){

        let check = await this.EngWords.findOne({word: word1});
        if (check){
            ctx.reply('There is a already such word');
            return;
        }
        var newId = generateID();
        var newDate = Date()

        let engWord = new this.EngWords({
            newId: newId,
            word: word1,
            created: newDate
        });
    
        let p1 = new Promise((resolve,reject) => {
            engWord.save((error,callback) => {
                if (error){
                    reject(error);
                }else {
                    resolve('Saved');
                }
            });
        });

        let rusWord = new this.RusWords({
            newId: newId,
            word: word2,
            created: newDate
        });

        let p2 = new Promise((resolve,reject) => {
            rusWord.save((error,callback) => {
                if (error){
                    reject(error);
                }else {
                    resolve('Saved');
                }
            });
        });
        
        try  {
            Promise.all([p1, p2]).then((values) => {
                console.log(values);
                ctx.reply('Accepted')
            })
        }catch(e) {
            log(e,'e1');
        };

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
    async searchWord(word,ctx){
        let oThis = this;
        let engWords = await this.EngWords.find({word:  new RegExp(word, 'i')});
        let rusWords = await this.RusWords.find({word: new RegExp(word, 'i')});
    
        await Promise.all([engWords, rusWords])
        .then(async ([engWords, rusWords]) => {
            let listWords = [];
            if (engWords.length >= 1) {
                for(let {newId,word : eng} of engWords){
                    let {word:rus} = await oThis.RusWords.findOne({newId: newId});
                    listWords.push(`${eng} - ${rus}`);
                };
                ctx.replyWithHTML(listWords.join('\n'));
            } else if (rusWords.length >= 1) {
                for(let {newId,word : rus} of rusWords){
                    let {word:eng} = await oThis.EngWords.findOne({newId: newId});
                    listWords.push(`${eng} - ${rus}`);
                };
                ctx.replyWithHTML(listWords.join('\n'));
            } else {
                ctx.reply('There is no such word');
                return;
            };
        })
        .catch(err => {
            console.error(err);
        });
    }

};

export const mongo = new MongoDB();
