module.exports = (mongoose) => {
    //const url = 'mongodb://'+user+':'+pass+'@127.0.0.1:27017/cardapio01';

    // const options = {
    //     user: 'admin',
    //     pass: 'admin',
    //     auth: {
    //         authdb: 'admin'
    //     }
    // };
    // const url = 'mongodb://127.0.0.1:27017/cardapio01';
    // mongoose.connect(url, options);

    const url = 'mongodb://127.0.0.1:27017/nerdezoeiro';
    mongoose.connect(url)
}