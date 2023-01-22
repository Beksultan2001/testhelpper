import mongoose from 'mongoose';
import { generateID } from './utils.js';

const log = console.log;

const wordSchema = new mongoose.Schema({
    newId: String,
    word: String
});

export const EngWords = mongoose.model('engwords', wordSchema);
export const RusWords = mongoose.model('ruswords', wordSchema);

export async function insertWords(word1,word2,ctx){
    
    var newId = generateID();
    
    let eng = await EngWords.create({newId: newId, word: word1});
    let rus = await RusWords.create({newId: newId, word: word2});

    ctx.reply('Accepted');
};

export async function deleteWord(word,ctx){

    let engWords = await EngWords.find({word: word});
    // let rusRes = await RusWords.deleteMany({word: word});

    if (engWords.length >= 1){
        log(engWords[0]);
    }else {
        ctx.reply('There is no such word');
        return;
    };

    for(let {newId} of engWords){
        let res1 = await EngWords.deleteMany({newId: newId});
        let res2 = await RusWords.deleteMany({newId: newId});
    };

    ctx.reply('Successfully deleted');

};

