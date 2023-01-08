import mongodb from 'mongodb';
// oC4IwyMLujIyECUA
export const MongoClient = mongodb.MongoClient;
const url = 'mongodb+srv://Beksultan:oC4IwyMLujIyECUA@cluster0.nnynldx.mongodb.net/?retryWrites=true&w=majority';

let client = null;

MongoClient.connect(url,(error,_client) => {
    if (error){
        console.log(error);
        return;
    }; 
    client = _client;
    console.log(_client,'client')
    // const db =  client.db('test');

});


// const db =  client.db('test');

// db.collection('users').insertOne({
//     name: 'John',
//     age: 21
// })
//     // db.collection('users').insertOne({
//     //     name: 'John',
//     //     age: 21
//     // })
//     // .then(res => {
//     //     console.log(res,'res')
//     // })
//     // .catch(e => console.log(e));

//     // db.collection('users').insertMany([
//     //     {
//     //         name: 'Test1',
//     //         age: '27'
//     //     },
//     //     {
//     //         name: 'Test2',
//     //         age: '28'
//     //     }
//     // ])
//     // .then(res => console.log(res))
//     // .catch(e => console.log(e))

//     // db.collection('users').findOne({age: '27'})
//     // .then(res => console.log(res,'res'))
//     // .catch(e => console.log(e,'e'))

//     // db.collection('users').find({hyst: 'sf'}).toArray()
//     // .then(res => console.log(res))
//     // .catch(e => console.log(e,'e'))

//     // db.collection('users').updateOne({age: 21},{
//     //     $set: {
//     //         age: 85
//     //     }
//     // })
//     // .then((res) => console.log(res,'res'))
//     // .catch((e) => console.log(e,'e'));

//     // db.collection('users').updateMany({age: 21},{
//     //     $inc: {
//     //         age: 10
//     //     }
//     // })
//     // .then((res) => console.log(res,'res'))
//     // .catch((e) => console.log(e,'e'));

//     // db.collection('users').deleteMany({})
//     // .then((res) => console.log(res,'res'))
//     // .catch((e) => console.log(e,'e'));
// });

