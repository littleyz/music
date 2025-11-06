console.log("\n %c HeoMusic 寮€婧愰潤鎬侀煶涔愭挱鏀惧櫒 %c https://github.com/zhheo/HeoMusic \n", "color: #fadfa3; background: #030307; padding:5px 0;", "background: #fadfa3; padding:5px 0;")
var local = false;
var isScrolling = false; // 娣诲姞鍏ㄥ眬鍙橀噺 isScrolling锛岄粯璁や负 false
var scrollTimer = null; // 娣诲姞瀹氭椂鍣ㄥ彉閲�
var animationFrameId = null; // 娣诲姞鍙橀噺鐢ㄤ簬璺熻釜鍔ㄧ敾甯D

if (typeof userId === 'undefined') {
  var userId = "8152976493"; // 鏇挎崲涓哄疄闄呯殑榛樿鍊�
}
if (typeof userServer === 'undefined') {
  var userServer = "netease"; // 鏇挎崲涓哄疄闄呯殑榛樿鍊�
}
if (typeof userType === 'undefined') {
  var userType = "playlist"; // 鏇挎崲涓哄疄闄呯殑榛樿鍊�
}

if (typeof remoteMusic !== 'undefined' && remoteMusic) {
  fetch(remoteMusic)
    .then(response => response.json())
    .then(data => {
      if (Array.isArray(data)) {
        localMusic = data;
      }
      loadMusicScript();
    })
    .catch(error => {
      console.error('Error fetching remoteMusic:', error);
      loadMusicScript();
    });
} else {
  loadMusicScript();
}

function loadMusicScript() {
  if (typeof localMusic === 'undefined' || !Array.isArray(localMusic) || localMusic.length === 0) {
    // 濡傛灉 localMusic 涓虹┖鏁扮粍鎴栨湭瀹氫箟锛屽姞杞� Meting2.min.js
    var script = document.createElement('script');
    script.src = './js/Meting.js';
    document.body.appendChild(script);
  } else {
    // 鍚﹀垯鍔犺浇 localEngine.js
    var script = document.createElement('script');
    script.src = './js/localEngine.js';
    document.body.appendChild(script);
    local = true;
  }
}

var volume = 0.8;

// 鑾峰彇鍦板潃鏍忓弬鏁�
// 鍒涘缓URLSearchParams瀵硅薄骞朵紶鍏RL涓殑鏌ヨ瀛楃涓�
const params = new URLSearchParams(window.location.search);

var heo = {
  // 澶勭悊婊氬姩鍜岃Е鎽镐簨浠剁殑閫氱敤鏂规硶
  handleScrollOrTouch: function(event, isTouchEvent) {
    // 妫€鏌ヤ簨浠剁殑鐩爣鍏冪礌鏄惁鍦ㄧ浉鍏冲尯鍩熷唴閮�
    let targetElement = event.target;
    let isInTargetArea = false;
    
    // 鍚戜笂閬嶅巻DOM鏍戯紝妫€鏌ユ槸鍚﹀湪鐩爣鍖哄煙鍐�
    while (targetElement && targetElement !== document) {
      if (targetElement.classList) {
        if (isTouchEvent) {
          // 瑙︽懜浜嬩欢妫€鏌� aplayer-body 鎴� aplayer-lrc
          if (targetElement.classList.contains('aplayer-body') || 
              targetElement.classList.contains('aplayer-lrc')) {
            isInTargetArea = true;
            break;
          }
        } else {
          // 榧犳爣婊氳疆浜嬩欢鍙鏌� aplayer-body
          if (targetElement.classList.contains('aplayer-body')) {
            isInTargetArea = true;
            break;
          }
        }
      }
      targetElement = targetElement.parentNode;
    }
    
    // 鍙湁褰撳湪鐩爣鍖哄煙鍐呮椂鎵嶆敼鍙� isScrolling
    if (isInTargetArea) {
      // 鍙栨秷浠讳綍姝ｅ湪杩涜鐨勫姩鐢�
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      // 璁剧疆isScrolling涓簍rue
      isScrolling = true;
      
      // 娓呴櫎涔嬪墠鐨勫畾鏃跺櫒
      if(scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }
      
      // 璁剧疆鏂扮殑瀹氭椂鍣紝鎭㈠isScrolling涓篺alse
      // 瑙︽懜浜嬩欢缁欎簣鏇撮暱鐨勬椂闂�
      const timeoutDuration = isTouchEvent ? 4500 : 4000;
      scrollTimer = setTimeout(function() {
        isScrolling = false;
        heo.scrollLyric();
      }, timeoutDuration);
    }
  },
  
  // 鍒濆鍖栨粴鍔ㄥ拰瑙︽懜浜嬩欢
  initScrollEvents: function() {
    // 鐩戝惉榧犳爣婊氳疆浜嬩欢
    document.addEventListener('wheel', (event) => {
      this.handleScrollOrTouch(event, false);
    }, { passive: true });
    
    // 鐩戝惉瑙︽懜婊戝姩浜嬩欢
    document.addEventListener('touchmove', (event) => {
      this.handleScrollOrTouch(event, true);
    }, { passive: true });
  },

  scrollLyric: function () {
    // 褰� isScrolling 涓� true 鏃讹紝璺宠繃鎵ц
    if (isScrolling) {
      return;
    }
    
    const lrcContent = document.querySelector('.aplayer-lrc');
    const currentLyric = document.querySelector('.aplayer-lrc-current');

    if (lrcContent && currentLyric) {
      let startScrollTop = lrcContent.scrollTop;
      let targetScrollTop = currentLyric.offsetTop - (window.innerHeight - 150) * 0.3; // 鐩爣浣嶇疆鍦�30%鐨刣vh浣嶇疆
      let distance = targetScrollTop - startScrollTop;
      let duration = 600; // 缂╃煭鍔ㄧ敾鏃堕棿浠ユ彁楂樻祦鐣呭害
      let startTime = null;

      function easeOutQuad(t) {
        return t * (2 - t);
      }

      function animateScroll(currentTime) {
        // 濡傛灉鐢ㄦ埛姝ｅ湪鎵嬪姩婊氬姩锛屽仠姝㈠姩鐢�
        if (isScrolling) {
          animationFrameId = null;
          return;
        }
        
        if (startTime === null) startTime = currentTime;
        let timeElapsed = currentTime - startTime;
        let progress = Math.min(timeElapsed / duration, 1);
        let easeProgress = window.innerWidth < 768 ? progress : easeOutQuad(progress);
        lrcContent.scrollTop = startScrollTop + (distance * easeProgress);
        
        if (timeElapsed < duration) {
          animationFrameId = requestAnimationFrame(animateScroll);
        } else {
          animationFrameId = null;
        }
      }

      // 鍙栨秷浠讳綍姝ｅ湪杩涜鐨勫姩鐢�
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      
      animationFrameId = requestAnimationFrame(animateScroll);
    }
  },

  getCustomPlayList: function () {
    const heoMusicPage = document.getElementById("heoMusic-page");
    const playlistType = params.get("type") || "playlist";

    if (params.get("id") && params.get("server")) {
      console.log("鑾峰彇鍒拌嚜瀹氫箟鍐呭")
      var id = params.get("id")
      var server = params.get("server")
      heoMusicPage.innerHTML = `<meting-js id="${id}" server="${server}" type="${playlistType}" mutex="true" preload="auto" order="random"></meting-js>`;
    } else {
      console.log("鏃犺嚜瀹氫箟鍐呭")
      heoMusicPage.innerHTML = `<meting-js id="${userId}" server="${userServer}" type="${userType}" mutex="true" preload="auto" order="random"></meting-js>`;
    }
  },

  bindEvents: function () {
    var e = this;
    // 娣诲姞姝岃瘝鐐瑰嚮浠�
    if (this.lrc) {
      this.template.lrc.addEventListener('click', function (event) {
        // 纭繚鐐瑰嚮鐨勬槸姝岃瘝 p 鍏冪礌
        var target = event.target;
        if (target.tagName.toLowerCase() === 'p') {
          // 鑾峰彇鎵€鏈夋瓕璇嶅厓绱�
          var lyrics = e.template.lrc.getElementsByTagName('p');
          // 鎵惧埌琚偣鍑绘瓕璇嶇殑绱㈠紩
          for (var i = 0; i < lyrics.length; i++) {
            if (lyrics[i] === target) {
              // 鑾峰彇瀵瑰簲鏃堕棿骞惰烦杞�
              if (e.lrc.current[i]) {
                var time = e.lrc.current[i][0];
                e.seek(time);
                if (e.paused) {
                  e.play();
                }
              }
              break;
            }
          }
        }
      });
    }
  },
  // 娣诲姞鏂版柟娉曞鐞嗘瓕璇嶇偣鍑�
  addLyricClickEvent: function () {
    const lrcContent = document.querySelector('.aplayer-lrc-contents');

    if (lrcContent) {
      lrcContent.addEventListener('click', function (event) {
        if (event.target.tagName.toLowerCase() === 'p') {
          const lyrics = lrcContent.getElementsByTagName('p');
          for (let i = 0; i < lyrics.length; i++) {
            if (lyrics[i] === event.target) {
              // 鑾峰彇褰撳墠鎾斁鍣ㄥ疄渚�
              const player = ap;
              // 浣跨敤鎾斁鍣ㄥ唴閮ㄧ殑姝岃瘝鏁版嵁
              if (player.lrc.current[i]) {
                const time = player.lrc.current[i][0];
                player.seek(time);
                // 鐐瑰嚮姝岃瘝鍚庝笉鍐嶇瓑寰�4s锛岀珛鍗宠烦杞�
                isScrolling = false;
                clearTimeout(scrollTimer);
                // 濡傛灉褰撳墠鏄殏鍋滅姸鎬�,鍒欐仮澶嶆挱鏀�
                if (player.paused) {
                  player.play();
                }
              }
              event.stopPropagation(); // 闃绘浜嬩欢鍐掓场
              break;
            }
          }
        }
      });
    }
  },
  setMediaMetadata: function (aplayerObj, isSongPlaying) {
    const audio = aplayerObj.list.audios[aplayerObj.list.index]
    const coverUrl = audio.cover || './img/icon.webp';
    const currentLrcContent = document.getElementById("heoMusic-page").querySelector(".aplayer-lrc-current").textContent;
    let songName, songArtist;

    if ('mediaSession' in navigator) {
      if (isSongPlaying && currentLrcContent) {
        songName = currentLrcContent;
        songArtist = `${audio.artist} / ${audio.name}`;
      } else {
        songName = audio.name;
        songArtist = audio.artist;
      }
      navigator.mediaSession.metadata = new MediaMetadata({
        title: songName,
        artist: songArtist,
        album: audio.album,
        artwork: [
          { src: coverUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: coverUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: coverUrl, sizes: '192x192', type: 'image/jpeg' },
          { src: coverUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: coverUrl, sizes: '384x384', type: 'image/jpeg' },
          { src: coverUrl, sizes: '512x512', type: 'image/jpeg' }
        ]
      });
    } else {
      console.log('褰撳墠娴忚鍣ㄤ笉鏀寔 Media Session API');
      document.title = `${audio.name} - ${audio.artist}`;
    }
  },
  // 鍝嶅簲 MediaSession 鏍囧噯濯掍綋浜や簰
  setupMediaSessionHandlers: function (aplayer) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        aplayer.play();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        aplayer.pause();
      });

      // 绉婚櫎蹇繘蹇€€鎸夐挳
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);

      // 璁剧疆涓婁竴鏇蹭笅涓€鏇叉寜閽�
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        aplayer.skipBack();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        aplayer.skipForward();
      });

      // 鍝嶅簲杩涘害鏉℃嫋鍔�
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.fastSeek && 'fastSeek' in aplayer.audio) {
          aplayer.audio.fastSeek(details.seekTime);
        } else {
          aplayer.audio.currentTime = details.seekTime;
        }
      });

      // 鏇存柊 Media Session 鍏冩暟鎹�
      aplayer.on('loadeddata', () => {
        heo.setMediaMetadata(aplayer, false);
      });

      // 鏇存柊鎾斁鐘舵€�
      aplayer.on('play', () => {
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
          heo.setMediaMetadata(aplayer, true);
        }
      });

      aplayer.on('pause', () => {
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
          heo.setMediaMetadata(aplayer, false);
        }
      });

      // 鐩戝惉鏃堕棿鏇存柊浜嬩欢
      aplayer.on('timeupdate', () => {
        heo.setMediaMetadata(aplayer, true);
      });
    }
  },
  updateThemeColorWithImage(img) {
    if (local) {
      const updateThemeColor = (colorThief) => {
        const dominantColor = colorThief.getColor(img);
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          // 鍙犲姞rgba(0,0,0,0.4)鐨勬晥鏋�
          const r = Math.round(dominantColor[0] * 0.6); // 鍘熻壊 * 0.6 瀹炵幇鍙犲姞榛戣壊閫忔槑搴�0.4鐨勬晥鏋�
          const g = Math.round(dominantColor[1] * 0.6);
          const b = Math.round(dominantColor[2] * 0.6);
          metaThemeColor.setAttribute('content', `rgb(${r},${g},${b})`);
        }
      };

      if (typeof ColorThief === 'undefined') {
        const script = document.createElement('script');
        script.src = './js/color-thief.min.js';
        script.onload = () => updateThemeColor(new ColorThief());
        document.body.appendChild(script);
      } else {
        updateThemeColor(new ColorThief());
      }
    }

  },
  
  // 鏂板鏂规硶锛氬皢姝岃瘝婊氬姩鍒伴《閮�
  scrollLyricToTop: function() {
    const lrcContent = document.querySelector('.aplayer-lrc');
    if (lrcContent) {
      // 浣跨敤骞虫粦婊氬姩鏁堟灉锛屼絾涓嶈繃浜庣紦鎱�
      lrcContent.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  },
  
  // 鍒濆鍖栨墍鏈変簨浠�
  init: function() {
    this.getCustomPlayList();
    this.initScrollEvents();
  }
}

//绌烘牸鎺у埗闊充箰
document.addEventListener("keydown", function (event) {
  //鏆傚仠寮€鍚煶涔�
  if (event.code === "Space") {
    event.preventDefault();
    ap.toggle();

  };
  //鍒囨崲涓嬩竴鏇�
  if (event.keyCode === 39) {
    event.preventDefault();
    ap.skipForward();

  };
  //鍒囨崲涓婁竴鏇�
  if (event.keyCode === 37) {
    event.preventDefault();
    ap.skipBack();

  }
  //澧炲姞闊抽噺
  if (event.keyCode === 38) {
    if (volume <= 1) {
      volume += 0.1;
      ap.volume(volume, true);

    }
  }
  //鍑忓皬闊抽噺
  if (event.keyCode === 40) {
    if (volume >= 0) {
      volume += -0.1;
      ap.volume(volume, true);

    }
  }
});

// 鐩戝惉绐楀彛澶у皬鍙樺寲
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    ap.list.show();
  } else {
    ap.list.hide();
  }

});

// 璋冪敤鍒濆鍖�
heo.init();
