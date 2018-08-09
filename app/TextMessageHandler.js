var GameRoom = require('./models/GameRoom');

class TextMessageHandler {
    constructor() {
        this._pattern = {
            gameOnSingle: /^\s*(@game|@game\s+[4-9]{1})\s*$/i,
            gameOnDouble: /^\s*(@game\s+2|@game\s+[4-9]{1}\s+2)\s*$/i,
            answer: /^\s*(?:([1-9])(?!.*\1)){4,9}\s*$/,
            rule: /^\s*@rule\s*$/i,
            giveUp: /^\s*@giveup\s*$/i
        };
    }

    /**
     * Start to process text type message
     * @param {*} event 
     */
    process(event) {
        if (event.message.type !== 'text') return;

        if (this._pattern.rule.test(event.message.text)) {
            event.reply('來跟我猜數字吧！ ^^\n跟我說"@game"加上數字長度(4~9)就可以開始新回合囉\n如: @game 5\n直接講"@game"就是猜4個數字呦！\n想再聽一次規則，就告訴我"@rule"吧～\n\nPS. 想知道答案就"@giveup"吧(手機限定)');
        }
        else if (this._pattern.gameOnSingle.test(event.message.text)) {
            const sizeTxt = /[4-9]{1}/.exec(event.message.text);
            const size = sizeTxt ? parseInt(sizeTxt): 4;
            this.initSingle(event, size);
        }
        else if (event.source.type === 'user') {
            GameRoom.findOne({ player1: event.source.userId, roomName: null, isGameOn: true })
                .then((room) => {
                    if (!room) return;
                    if (this._pattern.giveUp.test(event.message.text)) {
                        this.giveUp(event, room);
                    }
                    else if (this._pattern.answer.test(event.message.text) && 
                        event.message.text.trim().length === room.guessNumber.length) {
                        this.checkAnswer(event, room);
                    }
                    else if (this._pattern.answer.test(event.message.text)) {
                        event.reply('數字長度錯了喔 =3=');
                    }
                    else if (/^\s*[1-9]+\s*$/.test(event.message.text)) {
                        event.reply('數字不可以重複喔！');
                    }
                    else if (/^\s*[0-9]+\s*$/.test(event.message.text)) {
                        event.reply('數字要1~9才行 =3=');
                    }
                    else {
                        event.reply(`快點告訴我${room.guessNumber.length}個數字吧 0.0`);
                    }
                });
        }
    }

    /**
     * generate number string to guess
     * @param {*} size length of the number
     */
    generateGuessNumber(size) {
        let nums = [];
        for (let index = 0; index < size; ++index) {
            let temp = 0;
            do {
                temp = Math.floor(Math.random() * 9 + 1);
            } while(nums.indexOf(temp) !== -1);
            nums.push(temp);
        }
        return nums.join('');
    }

    /**
     * initialize game with single player
     * @param {*} event 
     * @param {*} size 
     */
    initSingle(event, size) {
        GameRoom.findOne({ player1: event.source.userId, roomName: null })
            .then((room) => {
                if (!room) {
                    var gameroom = new GameRoom();
                    gameroom.player1 = event.source.userId;
                    gameroom.player2 = null;
                    gameroom.guessNumber = this.generateGuessNumber(size);
                    gameroom.isGameOn = true;
                    gameroom.save()
                        .then((roomData) => {
                            event.reply('開始猜數字吧！ \\(^o^)/');
                        });
                    return;
                }
                room.guessNumber = this.generateGuessNumber(size);
                room.isGameOn = true;
                room.save()
                    .then((roomData) => {
                        event.reply('開始猜數字吧！ \\(^o^)/');
                    });
            })
            .catch((err) => {
                console.log('>> error occurred:');
                console.error(err);
            });
    }

    /**
     * check the answer
     * @param {*} event 
     * @param {*} gameRoom 
     */
    checkAnswer(event, gameRoom) {
        if (event.message.text === gameRoom.guessNumber) {
            gameRoom.isGameOn = false;
            gameRoom.save()
                .then(() => {
                    event.reply(`${gameRoom.guessNumber.length}A 恭喜你答對了~`);
                });
            return;
        }
        let numOfAs = 0;
        let numOfBs = 0;
        const answer = event.message.text.split('');
        for (let index = 0; index < answer.length; ++index) {
            let loc = gameRoom.guessNumber.search(answer[index]);
            if (loc === index) ++numOfAs;
            else if (loc !== -1) ++numOfBs;
        }
        event.reply(`${numOfAs}A ${numOfBs}B`);
    }

    /**
     * give up the game
     * @param {*} event 
     * @param {*} gameRoom 
     */
    giveUp(event, gameRoom) {
        const answer = gameRoom.guessNumber;
        event.reply({
            "type": "template",
            "altText": "你真的要放棄了嗎？ Q~Q",
            "template": {
                "type": "confirm",
                "text": "你真的要放棄了嗎？ Q~Q",
                "actions": [
                    {
                        "type": "message",
                        "label": "Yes",
                        "text": answer
                    },
                    {
                        "type": "message",
                        "label": "No",
                        "text": "No"
                    }
                ]
            }
        });
    }
}

module.exports = new TextMessageHandler();