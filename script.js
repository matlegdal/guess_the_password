require([
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/on",
    "dojo/query",
    "dojo/store/Memory",
    "dojo/domReady!"
], function (dom, domClass, domConstruct, on, query, Memory) {
    const wordCount = 10;
    const store = new Memory();
    const guessDom = dom.byId("guesses-remaining");
    const wordList = dom.byId("word-list");

    let handleWordListener;
    let guessCount;
    let password;

    // Listener to Start game
    on(dom.byId("start"), "click", function () {
        domClass.replace("start-screen", "hide", "show");
        domClass.replace("game-screen", "show", "hide");
        startGame();
    });

    // Listener to reset game
    on(dom.byId("reset"), "click", resetGame);

    function startGame() {
        // get random words and update the dom
        let randomWords = getRandomWords(words, wordCount);
        randomWords.forEach(function (word) {
            let node = domConstruct.create("li", {
                innerHTML: word
            }, wordList);

            // Save the data in memory
            store.put({
                node,
                word,
                disabled: false
            });
        });

        // choose 1 word amongst the list to be the password and set the guessCount and the listener on wordlist
        password = getRandomWords(randomWords, 1)[0];
        console.log(password);
        guessCount = 4;
        setGuessCount(guessCount);
        handleWordListener = on(wordList, "li:click", updateGame);
    }

    function getRandomWords(arrayOfWords, numberOfWords) {
        var randomWords = [];
        for (let i = 0; i < numberOfWords; i++) {
            randomWords.push(arrayOfWords[Math.floor(Math.random() * arrayOfWords.length)]);
        }
        return randomWords;
    }

    function setGuessCount(newCount) {
        guessCount = newCount;
        guessDom.innerText = guessCount;
    }

    function updateGame(event) {
        let data = store.query({
            node: event.target
        })[0];

        if (!data.disabled) {
            setGuessCount(guessCount - 1);
            data.disabled = true;
            domClass.add(data.node, "disabled");

            if (data.word === password) {
                data.node.innerHTML += " --> That's right! You got it!";
                endGame("Congratulations! You win!");
            } else {
                data.node.innerHTML += `--> Nope! Matching letters: ${compareGuess(data.word)}`;
                if (guessCount === 0) {
                    endGame("You lost...");
                }
            }
        }
    }

    // Returns the number of letters of the guess that are also in the password, regardless of position.
    function compareGuess(guess) {
        let passCopy = password.split("");
        let countLetters = 0;
        for (let char of guess) {
            let i = passCopy.indexOf(char);
            if (i > -1) {
                countLetters++;
                // delete the letter from the list of letters to prevent it be counted in double
                passCopy.splice(i, 1);
            }
        }
        return countLetters;
    }

    function endGame(message) {
        // show the end game message
        domClass.replace("endGame", "show", "hide");
        dom.byId("endMessage").innerText = message;

        // add class disabled to all words
        let words = query("li", wordList);
        words.forEach(function (word) {
            domClass.add(word, "disabled");
        });
        // clear the memory and remove listener on wordList
        store.setData([]);
        handleWordListener.remove();
    }

    function resetGame(event) {
        event.preventDefault();
        domClass.replace("game-screen", "hide", "show");

        setTimeout(function () {
            domConstruct.empty(wordList);
            startGame();
            domClass.replace("game-screen", "show", "hide");
        }, 1000);
    }
});