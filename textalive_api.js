const { Player, stringToDataUrl } = TextAliveApp;

// Hold an Unity instance
let gameInstance;
let player;

const UNITY_WEB_BRIDGE = 'UnityWebBridge';
const TEXTALIVE_APP_TOKEN = "M6vWsR2G9PrgBYMs";
const OFFSET_TIMING_BRIDGE = 250;

const unityContainer = document.querySelector("#unity-container");
const overlay = document.querySelector("#overlay");
const seekbar = document.querySelector("#seekbar");
const paintedSeekbar = seekbar.querySelector("div");
const buttonStart = document.querySelector("#button-start");



function initializeTextAlivePlayer() {
    // TextAlive Player を初期化
    player = new Player({
        // トークンは https://developer.textalive.jp/profile で取得したものを使う
        //! Insert your own token here!
        app: { token: TEXTALIVE_APP_TOKEN },
        mediaElement: document.querySelector("#media"),
        mediaBannerPosition: "bottom right",
        volume: 50
        // オプション一覧
        // https://developer.textalive.jp/packages/textalive-app-api/interfaces/playeroptions.html
    });

    addListenerForPlayer();
}

function addListenerForPlayer() {
    player.addListener({
        /* APIの準備ができたら呼ばれる */
        onAppReady(app) {
            if (app.managed) {
                document.querySelector("#control").className = "disabled";
            }
            if (!app.songUrl) {
                document.querySelector("#media").className = "disabled";

                // king妃jack躍 / 宮守文学 feat. 初音ミク
                // https://developer.textalive.jp/events/magicalmirai2023/#snippets
                player.createFromSongUrl("https://piapro.jp/t/ucgN/20230110005414", {
                    video: {
                        beatId: 4267297,
                        chordId: 2405019,
                        repetitiveSegmentId: 2475577,
                        lyricId: 56092,
                        lyricDiffId: 9636
                    }
                });

                if (gameInstance != null)
                    gameInstance.SendMessage(UNITY_WEB_BRIDGE, 'OnAppReady');
            }
        },

        /* 楽曲が変わったら呼ばれる */
        onAppMediaChange() {
            // 画面表示をリセット
            overlay.className = "";

            if (gameInstance != null)
                gameInstance.SendMessage(UNITY_WEB_BRIDGE, 'OnAppMediaChange');
        },

        /* 楽曲情報が取れたら呼ばれる */
        onVideoReady(video) {
            // 楽曲情報を表示
            document.querySelector("#artist span").textContent = player.data.song.artist.name;
            document.querySelector("#song span").textContent = player.data.song.name;

            if (gameInstance != null)
                gameInstance.SendMessage(UNITY_WEB_BRIDGE, 'OnVideoReady');
        },

        /* 再生コントロールができるようになったら呼ばれる */
        onTimerReady() {
            // unityContainer.style.display = "block";
            buttonStart.className = "";
            document.querySelector("#text-loading").className = "disabled";

            if (gameInstance != null)
                gameInstance.SendMessage(UNITY_WEB_BRIDGE, 'OnTimerReady');
        },

        /* 再生位置の情報が更新されたら呼ばれる */
        onTimeUpdate(position) {
            // シークバーの表示を更新
            paintedSeekbar.style.width = `${parseInt((position * 1000) / player.video.duration) / 10}%`;

            // Update Unity
            if (gameInstance != null)
                gameInstance.SendMessage(UNITY_WEB_BRIDGE, 'OnTimeUpdate', position + OFFSET_TIMING_BRIDGE);
        },

        /* 楽曲の再生が始まったら呼ばれる */
        onPlay() {
            if (gameInstance != null)
                gameInstance.SendMessage(UNITY_WEB_BRIDGE, 'OnPlay');
        },

        /* 楽曲の再生が止まったら呼ばれる */
        onPause() {
            if (gameInstance != null)
                gameInstance.SendMessage(UNITY_WEB_BRIDGE, 'OnPause');
        }
    });
}

function isAudioPlaying() {
    return player && player.isPlaying;
}

function startPlaying() {
    if (player) {
        //| Seek back to 0 before playing due to the timer got update ahead eventhough the music has not been played yet
        player.requestMediaSeek(0);
        player.requestPlay();
    }
}

/* シークバー */
// seekbar.addEventListener("click", (e) => {
//     e.preventDefault();
//     if (player) {
//         player.requestMediaSeek(
//             (player.video.duration * e.offsetX) / seekbar.clientWidth
//         );
//     }
//     return false;
// });

buttonStart.addEventListener("click", (e) => {
    e.preventDefault();
    overlay.className = "disabled";
    unityContainer.style.display = "block";

    gameInstance.SetFullscreen(1);
    return false;
});
