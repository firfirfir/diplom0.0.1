var multer  =   require('multer');
var fs  =   require('fs');

var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + parseInt(Math.random() * 10000000) +  file.originalname);
    }
});

var upload = multer({ storage: storage });
var addTime = require('./../middlewares/addTimeToSubtext');

module.exports = function(app){

    app.get('/player',  function(req, res) {

        res.render('index', {
            domain: 'localhost:100',
            userSubtitlePath: req.cookies.userSubtitles
        });

    });

    app.post('/audio', upload.single('file'),  function(req, res) {

        res.cookie('userAudio', req.file.filename, { maxAge: 900000});
        res.cookie('userAudioDelay', req.body.delay, { maxAge: 900000});
        res.redirect('back');

    });


    app.post('/subtitle', upload.single('file'),  function(req, res) {

        var a;
        fs.readFile(`./uploads/${req.file.filename}`, 'utf8', function(err, data) {

            if (err) throw err;

            var delay = req.body.delay;
            if(delay) {
                var text = data;
                var arrayValues = text.split("\r\n\r\n").map(function (item) {
                    var parts = item.split("\r\n");
                    return {
                        number: parts[0],
                        time: parts[1],
                        text: parts[2],
                    };
                });

                var newArr = arrayValues.map((item) => {
                   if(item.time) {
                        var timeArr  = item.time.trim().split('-->');
                        var time = {
                            start: addTime(delay, timeArr[0].split(':')),
                            end: addTime(delay, timeArr[1].split(':'))
                        }
                   //if(time.start[0].indexOf('-') == -1) {
                       item.time = `${time.start[0]}:${time.start[1]}:${time.start[2]}.${time.start[3]} --> ${time.end[0]}:${time.end[1]}:${time.end[2]}.${time.end[3]}`;
                       return item;
                   //}
                }
            });


            var newTextFile ='WEBVTT\r\n';

            newArr.map((item) => {
                if(item) {
                newTextFile += `\r\n${item.number}\r\n${item.time}\r\n${item.text}\r\n`;
                }
            });


            fs.writeFile(`./uploads/${req.file.filename}`, newTextFile, function (err) {
                if (err) return console.log(err);
                console.log(`Rewrite > ${req.file.filename}`);
            });

            }

        });

        res.cookie('userSubtitles', req.file.filename, { maxAge: 900000});
        res.cookie('userSubtitlesDelay', req.body.delay, { maxAge: 900000});
        res.redirect('back');

    });


}