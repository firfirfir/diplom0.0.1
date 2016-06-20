module.exports = function (time, timeArr) {

    var tmp = timeArr[2].split('.');
    timeArr[2] = tmp[0];
    timeArr[3] = tmp[1];

    timeArr = timeArr.map((item) => parseInt(item));
    time = parseInt(time);

    if(time > 0) {

        timeArr[3] += time;

        if(timeArr[3] > 999) {
            timeArr[2] += parseInt( timeArr[3] / 1000 );
            timeArr[3] = parseInt( timeArr[3] % 1000 );
        }

        if(timeArr[2] >= 60) {
            timeArr[1] += parseInt( timeArr[2] / 60 );
            timeArr[2] = parseInt( timeArr[2] % 60 );
        }

        if(timeArr[1] >= 60) {
            timeArr[0] += parseInt( timeArr[0] / 60 );
            timeArr[1] = parseInt( timeArr[1] % 60 );
        }

    } else {
        time = time * (-1);

        var minus = false;
        var timeStr = parseInt(time).toString();
        while(timeStr.length < 9) {
            timeStr = 0 + timeStr;
        }

        //if(time >= 60000) {
            timeArr[0] -= parseInt(timeStr.slice(0, timeStr.length - 7)) || 0;
            timeArr[1] -= parseInt(timeStr.toString().slice(timeStr.length - 7, timeStr.length - 5)) || 0;
            timeArr[2] -= parseInt(timeStr.toString().slice(timeStr.length - 5, timeStr.length - 3)) || 0;
            timeArr[3] -= parseInt(timeStr.toString().slice(timeStr.length - 3)) || 0;

            if(timeArr[3] < 0 ) {

                if ((timeArr[2] > 0 || timeArr[1] > 0 || timeArr[0] > 0)) {

                    timeArr[2]--;
                    timeArr[3] += 999;

                } else {

                    timeArr[3] = timeArr[3] * (-1);
                    minus = true;

                }

            }

            if(timeArr[2] < 0 ) {

                if ((timeArr[1] > 0 || timeArr[0] > 0)) {

                    timeArr[1]--;
                    timeArr[2] += 999;

                } else {

                    timeArr[2] = timeArr[2] * (-1);
                    minus = true;

                }

            }

            if(timeArr[1] < 0) {

                if(timeArr[0] > 0) {

                    timeArr[0] --;
                    timeArr[1] += 60;

                } else {

                    timeArr[1] = timeArr[1] * (-1);
                    minus = true;

                }

            }

        }

    //}

    if(minus || timeArr[0] < 0) {
        timeArr[0] = timeArr[1] = timeArr[2] = '00';
        timeArr[3] = '000';
    } else {
        timeArr[0] = timeArr[0] < 10 && timeArr[0] >= 0 ? `0${timeArr[0]}` : timeArr[0];
        timeArr[1] = timeArr[1] < 10 && timeArr[1] >= 0 ? `0${timeArr[1]}` : timeArr[1];
        timeArr[2] = timeArr[2] < 10 && timeArr[2] >= 0 ? `0${timeArr[2]}` : timeArr[2];
        timeArr[3] = timeArr[3] >= 10 ? (timeArr[3] >= 100 ? timeArr[3] : `0${timeArr[3]}`) : `00${timeArr[3]}`;
    }

    return timeArr;
};