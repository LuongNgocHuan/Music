const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "HUAN_PLAYER";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const volume = $(".volume");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

  songs: [
    {
      name: "Used To Know Me",
      singer: "Charli XCX",
      path: "./Music/Charli XCX  Used To Know Me Official Video.mp3",
      image: "./IMG/charli.jpg",
    },
    {
      name: "Kiss Me More",
      singer: "Doja Cat x SZA",
      path: "./Music/Doja Cat  Kiss Me More Official Video ft SZA.mp3",
      image: "./IMG/kmm.jpeg.webp",
    },
    {
      name: "No Love Extended Version",
      singer: "Summer Walker x SZA x Cardi B",
      path: "./Music/Summer Walker SZA  Cardi B  No Love Extended Version Official Video.mp3",
      image: "./IMG/cardib-za.jpg",
    },
    {
      name: "Angel Baby",
      singer: "Troye Sivan",
      path: "./Music/Troye Sivan  Angel Baby Official Video.mp3",
      image: "./IMG/sivan.jpg",
    },
    {
      name: "Freaky Deaky",
      singer: "Tyga Doja x Cat",
      path: "./Music/Tyga Doja Cat  Freaky Deaky Official Video.mp3",
      image: "./IMG/tiga.jpg",
    },
    {
      name: "Thot Shit",
      singer: "Megan Thee Stallion",
      path: "./Music/Megan Thee Stallion  Thot Shit Female Rap Megamix feat Nicki Minaj Doja Cat Cardi B  more.mp3",
      image: "./IMG/thotthit.jpg",
    },
    {
      name: "Blick Blick",
      singer: "Coi Leray x Nicki Minaj",
      path: "./Music/Coi Leray  Nicki Minaj  Blick Blick Official Video.mp3",
      image: "./IMG/blick.jpg",
    },
  ],

  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
                <div class="song ${
                  index === this.currentIndex ? "active" : ""
                }" data-index="${index}">
                    <div class="thumb" style="background-image: url('${
                      song.image
                    }')">
                    </div>
                    <div class="body">
                        <h3 class="title">'${song.name}'</h3>
                        <p class="author">'${song.singer}'</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
    });
    playlist.innerHTML = htmls.join("");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    //cd turn / stop
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 15000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    document.onscroll = function () {
      const scroolTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scroolTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };
    //play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };
    //pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    //change
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    //rewind
    progress.oninput = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    //next song
    nextBtn.onclick = function () {
      if (app.isRandom) {
        app.playRandomSong();
      } else {
        app.nextSong();
      }

      audio.play();
      app.render();
      app.scrollToActiveSong();
    };
    //prev song
    prevBtn.onclick = function () {
      if (app.isRandom) {
        app.playRandomSong();
      } else {
        app.prevSong();
      }

      audio.play();
      app.render();
      app.scrollToActiveSong();
    };

    //random song
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    //repeat song
    (repeatBtn.onclick = function (e) {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    }),
      //end song
      (audio.onended = function () {
        if (_this.isRepeat) {
          audio.play();
        } else {
          nextBtn.click();
        }
      });
    //click playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");

      if (songNode || e.target.closest(".option")) {
        //click song(playlist)
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
        //click song option
        if (e.target.closest(".option")) {
        }
      }
    };

    // change volume
    volume.oninput = function (e) {
      audio.volume = e.target.value / 100;
    };

  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }

    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }

    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function () {
    this.loadConfig();

    this.defineProperties();

    this.handleEvents();

    this.loadCurrentSong();

    this.render();

    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};

app.start();
