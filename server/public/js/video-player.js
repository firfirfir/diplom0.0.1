'use strict';

var supportsVideo = !!document.createElement('video').canPlayType;

if (supportsVideo) {
    var videoContainer = document.getElementById('videoContainer');
    var video = document.getElementById('video');
    var videoControls = document.getElementById('video-controls');

    //video.currentTime = 0;

    var audios = [
        {
            name: '1',
            path: "http://localhost:100/public/audio/default/1.mp3",
            delay: 0
        }, {
            name: '2',
            path: "http://localhost:100/public/audio/default/2.mp3",
            delay: 0
        }
    ];

///Work with delay in vtt files/////////////////////////////////////
//		var allText =''
//
//		function readTextFile(file){
//
//	    var rawFile = new XMLHttpRequest();
//	    rawFile.open("GET", file, false);
//	    rawFile.onreadystatechange = function ()
//	    {
//	        if(rawFile.readyState === 4)
//	        {
//	            if(rawFile.status === 200 || rawFile.status == 0)
//	            {
//	                allText = rawFile.responseText;
//	                //alert(allText);
//	            }
//	        }
//	    }
//	    rawFile.send(null);
//	}

////////////////////////////////////////////////////////////////////////////////////////////////

    if (getCookie('userAudio')) {
        audios.push({
            name: 'Users',
            path: 'http://' + location.host + '/uploads/' + getCookie('userAudio'),
            delay: parseInt(getCookie('userAudioDelay')) || 0
        })
    }

    var index = localStorage.getItem('audio_id');
    index = index && audios[index] ? index : 0;
    var audio = new Audio(audios[index].path);

    var audioSelect = document.getElementById("audioSelect");

    video.controls = false;

    videoControls.setAttribute('data-state', 'visible');

    var playpause = document.getElementById('playpause');
    var stop = document.getElementById('stop');
    var mute = document.getElementById('mute');
    var volinc = document.getElementById('volinc');
    var voldec = document.getElementById('voldec');
    var progress = document.getElementById('progress');
    var progressBar = document.getElementById('progress-bar');
    var fullscreen = document.getElementById('fs');
    var subtitles = document.getElementById('subtitles');
    var settings = document.getElementById('settings');
    var settingsPanel = document.getElementById('settingsPanel');


    var supportsProgress = (document.createElement('progress').max !== undefined);
    if (!supportsProgress) progress.setAttribute('data-state', 'fake');

    var fullScreenEnabled = !!(document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitSupportsFullscreen || document.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);

    if (!fullScreenEnabled) {
        fullscreen.style.display = 'none';
    }

    var checkVolume = function (dir) {
        if (dir) {
            var currentVolume = Math.floor(video.volume * 10) / 10;
            if (dir === '+') {
                if (currentVolume < 1)  audio.volume = video.volume += 0.1;
            }
            else if (dir === '-') {
                if (currentVolume > 0)  audio.volume = video.volume -= 0.1;
            }
            if (currentVolume <= 0) {

                video.muted = true;
                audio.volume = 0;

            } else {

                video.muted = false;
                audio.volume = video.volume;

            }
        }
        changeButtonState('mute');
        console.log(audio.volume)
    }

    var alterVolume = function (dir) {
        checkVolume(dir);
    }

    var setFullscreenData = function (state) {
        videoContainer.setAttribute('data-fullscreen', !!state);

        fullscreen.setAttribute('data-state', !!state ? 'cancel-fullscreen' : 'go-fullscreen');
    }

    var isFullScreen = function () {
        return !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
    }

    var handleFullscreen = function () {

        if (isFullScreen()) {

            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
            setFullscreenData(false);
        }
        else {
            if (videoContainer.requestFullscreen) videoContainer.requestFullscreen();
            else if (videoContainer.mozRequestFullScreen) videoContainer.mozRequestFullScreen();
            else if (videoContainer.webkitRequestFullScreen) {
                video.webkitRequestFullScreen();
            }
            else if (videoContainer.msRequestFullscreen) videoContainer.msRequestFullscreen();
            setFullscreenData(true);
        }
    }

    if (document.addEventListener) {

        video.addEventListener('loadedmetadata', function () {
            progress.setAttribute('max', video.duration);
        });


        var changeButtonState = function (type) {

            if (type == 'playpause') {
                if (video.paused || video.ended) {
                    playpause.setAttribute('class', 'btn btn-default glyphicon glyphicon-play col-md-1');
                }
                else {
                    playpause.setAttribute('class', 'btn btn-default glyphicon glyphicon-pause col-md-1');
                }
            }

            else if (type == 'mute') {
                mute.setAttribute('class', video.muted ? 'btn btn-default glyphicon glyphicon-volume-off col-md-1' : 'btn btn-default glyphicon glyphicon-volume-up col-md-1');
                mute.setAttribute('data-state', video.muted ? 'unmute' : 'mute');
                console.log('audio', audio.muted)
            }
        }


        video.addEventListener('play', function () {

            if (video.currentTime == 0.325079) {

                if(audios[index].delay >= 0) {

                    setTimeout(function () {

                        audio.currentTime = 0;
                        audio.play();

                    }, audios[index].delay)

                } else {

                    audio.currentTime = audios[index].delay * (-1) / 1000;
                    audio.play();

                }

            } else {

                audio.play();

            }

            changeButtonState('playpause');

        }, false);
        video.addEventListener('pause', function () {

            audio.pause();
            changeButtonState('playpause');

        }, false);
        video.addEventListener('volumechange', function () {

            checkVolume();

        }, false);


        playpause.addEventListener('click', function (e) {
            if (video.paused || video.ended) video.play();
            else video.pause();
        });


        for (var i = 0; i < video.textTracks.length; i++) {
            video.textTracks[i].mode = 'hidden';
        }


        var subtitleMenuButtons = [];
        var createMenuItem = function (id, lang, label) {
            var listItem = document.createElement('li');
            var button = listItem.appendChild(document.createElement('button'));
            button.setAttribute('id', id);
            button.className = 'subtitles-button btn';
            if (lang.length > 0) button.setAttribute('lang', lang);
            button.value = label;
            button.setAttribute('data-state', 'inactive');
            button.appendChild(document.createTextNode(label));
            button.addEventListener('click', function (e) {

                subtitleMenuButtons.map(function (v, i, a) {
                    subtitleMenuButtons[i].setAttribute('data-state', 'inactive');
                });

                var lang = this.getAttribute('lang');
                for (var i = 0; i < video.textTracks.length; i++) {

                    if (video.textTracks[i].language == lang) {
                        video.textTracks[i].mode = 'showing';
                        this.setAttribute('data-state', 'active');
                    }
                    else {
                        video.textTracks[i].mode = 'hidden';
                    }
                }
                subtitlesMenu.classList.add('animation-hide');
            });
            subtitleMenuButtons.push(button);
            return listItem;
        }


        var subtitlesMenu;
        if (video.textTracks) {

            var df = document.getElementById('mainSettingsPanel');
            var subtitlesMenu = df.appendChild(document.createElement('ul'));
            subtitlesMenu.className = 'subtitles-menu col-md-1 col-md-offset-10 animation animation-hide';
            subtitlesMenu.appendChild(createMenuItem('subtitles-off', '', 'Off'));

            for (var i = 0; i < video.textTracks.length; i++) {

                if (video.textTracks[i].language == 'u') {

                    var result = getCookie('userSubtitles');
                    if (!result) continue;

                }

                subtitlesMenu.appendChild(createMenuItem('subtitles-' + video.textTracks[i].language, video.textTracks[i].language, video.textTracks[i].label));

            }
            //videoControls.appendChild(subtitlesMenu);
            df.appendChild(subtitlesMenu);
        }
        subtitles.addEventListener('click', function (e) {

            if (subtitlesMenu) {

                var result = subtitlesMenu.classList.contains('animation-hide');

                if (result) subtitlesMenu.classList.remove('animation-hide');
                else subtitlesMenu.classList.add('animation-hide');
            }


            console.log(subtitlesMenu.classList)
        });


        stop.addEventListener('click', function (e) {
            video.pause();
            video.currentTime = 0;
            progress.value = 0;

            changeButtonState('playpause');
        });
        mute.addEventListener('click', function (e) {
            video.muted = !video.muted;
            audio.muted = !audio.muted;
            changeButtonState('mute');
        });
        volinc.addEventListener('click', function (e) {
            alterVolume('+');
        });
        voldec.addEventListener('click', function (e) {
            alterVolume('-');
        });
        fs.addEventListener('click', function (e) {
            handleFullscreen();
        });


        video.addEventListener('timeupdate', function () {

            if (!progress.getAttribute('max')) progress.setAttribute('max', video.duration);
            progress.value = video.currentTime;
            progressBar.style.width = Math.floor((video.currentTime / video.duration) * 100) + '%';
        });


        progress.addEventListener('click', function (e) {

            var pos = (e.pageX - (this.offsetLeft + this.offsetParent.offsetLeft + this.offsetParent.offsetParent.offsetLeft)) / this.offsetWidth;
            video.currentTime = pos * video.duration;
        });


        document.addEventListener('fullscreenchange', function (e) {
            setFullscreenData(!!(document.fullScreen || document.fullscreenElement));
        });
        document.addEventListener('webkitfullscreenchange', function () {
            setFullscreenData(!!document.webkitIsFullScreen);
        });
        document.addEventListener('mozfullscreenchange', function () {
            setFullscreenData(!!document.mozFullScreen);
        });
        document.addEventListener('msfullscreenchange', function () {
            setFullscreenData(!!document.msFullscreenElement);
        });
    }
}


audios.map(function (audio, index) {

    var newAudio = document.createElement('li');
    newAudio.innerHTML = '<a href="#">' + audios[index].name + '</a>';
    audioSelect.appendChild(newAudio);

    newAudio.addEventListener('click', function (e) {

        (function (index) {
            localStorage.setItem('audio_id', index);
            location.reload();
            //audio = new Audio(audios[index][Object.keys(audios[index])[0]]);
        })(index);

    });
});


function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

settings.addEventListener('click', function (e) {


    if (settingsPanel.classList.contains('animation-hide')) {

        settingsPanel.classList.remove('animation-hide');

    } else {

        settingsPanel.classList.add('animation-hide');
    }

    //settingsPanel.style.display = (settingsPanel.style.display == 'inline' ? 'none' : 'inline');

});

