var kafka = require('kafka-node'),
http = require('http'),
apiKey = 'ce561b517673c40bc79b23e63b95bfa9',
testUrl = 'http://api.openweathermap.org/data/2.5/weather?zip=94040,us&APPID=ce561b517673c40bc79b23e63b95bfa9'
Producer = kafka.Producer,
KeyedMessage = kafka.KeyedMessage,
client = new kafka.Client('52.24.95.119:32774/','test'),
producer = new Producer(client),
km = new KeyedMessage('key', 'message'),
payloads = [
    { topic: 'topic1', messages: 'hi', partition: 0 },
    { topic: 'topic2', messages: ['hello', 'world', km] }
],
topics = ['topic1','topic2'],
consumer = new kafka.Consumer(client,
    [
        { topic: 'topic1', partition: 0 }, 
        { topic: 'topic2', offset: 0 }
    ],
    {
        autoCommit: true,
        fromOffset: false
    }
);

http.get({
    hostname: 'api.openweathermap.org',
    port: 80,
    path: '/data/2.5/weather?zip=94040,us&APPID=ce561b517673c40bc79b23e63b95bfa9',
    agent: false  // create a new agent just for this one request
}, function(response) {
    var body = '';
    response.on('data', function(d) {
        body += d;
    });
    response.on('end', function() {
        var parsed = JSON.parse(body);
        console.log(parsed);
    });
})
producer.on('ready', function () {
    console.log('producer ready');
    // setTimeout(function(){
    //     producer.send(payloads, function (err, data) {
    //         console.log(err);
    //         console.log(data);
    //     });
    // }, 5000);

    // producer.createTopics(topics, false, function (err, data) {
    //     console.log('topics created',topics);
    //     console.log(data);

    // });
    
});
 
producer.on('error', function (err) {
    console.log('producer error',err)
})

consumer.on('message', function (message) {
    console.log(message);
});

consumer.on('error', function (err) {
    console.log('consumer error',err)
})