let word;
let selectedCategory = "animals";
let wrongChoices = 0;
let helpAmount = 3;

const keyboardLayout = "QWERTYUIOPASDFGHJKL.ZXCVBNM&".split("");

// HTML.
const losingLetterHTML = document.querySelector(".__header ._losing-letters");
const helpButton = document.querySelector(".__header .help-icon_");

const wordToGuessHTML = document.querySelector(".__game ._guess-word");
const keyboardHTML = document.querySelector(".__game ._key");
const winLoseHTML = document.querySelector(".__game ._win-lose");

const categorySelect = document.querySelector(".__play-again select");
const playButton = document.querySelector(".__play-again button");

async function loadWordToGuess() {
    word = await getWord(selectedCategory);

    word.split("").forEach(letter => {
        let letterSpan = document.createElement("span");

        // If it is an empty space (space bar), do the first if.
        if (letter == " ") {
            letterSpan.innerHTML = "&nbsp;";
            letterSpan.style.border = "none";
        } else if (letter == "-") {
            letterSpan.innerText = "-";
            letterSpan.style.border = "none";
        } else {
            letterSpan.innerHTML = "&nbsp;&nbsp;&nbsp;";
        };

        wordToGuessHTML.append(letterSpan);
    });
};

function loadKeyboard() {
    keyboardLayout.forEach(key => {
        let keySpan = document.createElement("span");
        keySpan.innerText = key;
        keySpan.dataset.clicked = "false";
        keyboardHTML.append(keySpan);
        keySpan.addEventListener("click", keyClick);
    });
};

async function getWord(category) { // Fetch category from local & return the word.
    const response = await fetch("./assets/categories.min.json");
    const data = await response.json();

    const randomIndex = Math.floor(Math.random() * data[category].length);

    return data[category][randomIndex].toUpperCase();
};

function keyClick(helpLetter) {
    let keyClicked;

    // If the help button is clicked, do else. Otherwise do the first if.
    if (this.innerText !== undefined) {
        keyClicked = this.innerText.toUpperCase();

        word.split("").forEach((letter, index) => {
            if (keyClicked == letter) {
                this.dataset.clicked = "clicked";
                wordToGuessHTML.children[index].innerHTML = `${letter}`;
            };
        });

        // Can only click once.
        this.removeEventListener("click", keyClick);

    } else {
        keyClicked = helpLetter;

        // Add the helpLetter to HTML & make the key seems like it's already clicked.
        word.split("").forEach((letter, index) => {
            if (keyClicked == letter) {
                wordToGuessHTML.children[index].innerHTML = `${letter}`;
                wordToGuessHTML.children[index].removeEventListener("click", keyClick);
                Array.from(keyboardHTML.children).forEach(key => {
                    if (key.innerText == helpLetter) {
                        key.dataset.clicked = "hint";
                        key.removeEventListener("click", keyClick);
                    };
                });
            };
        });
    };

    winCheck(keyClicked);
    loseCheck(keyClicked, this);
};

function winCheck(keyClicked) {
    let correctLetter = "";

    Array.from(wordToGuessHTML.children).forEach(e => {
        if (e !== keyClicked) {
            correctLetter += e.innerText;
        };
    });
    
    correctLetter = correctLetter.replace(/\s/g, " ");

    if (correctLetter == word) {
        Array.from(keyboardHTML.children).forEach(key => key.removeEventListener("click", keyClick));
        helpButton.removeEventListener("click", help);

        winLoseHTML.innerHTML = "You win!";
        winLoseHTML.style.display = "block";
    };
};

function loseCheck(keyClicked, el) {

    // If clicked wrong key, increase by 1.
    if (!word.includes(keyClicked)) {
        wrongChoices++;
        losingletter();

        el.dataset.clicked = "wrong";
    };

    if (wrongChoices == 7) {

        // If lose, show the remaining letters.
        Array.from(wordToGuessHTML.children).forEach((e, index) => {
            if (e.innerText == "   ") {
                e.style.fontWeight = "bold";
                e.style.fontStyle = "italic";
            };

            e.innerText = word.split("")[index];
        });

        // Remove event listener from all key.
        Array.from(keyboardHTML.children).forEach(key => key.removeEventListener("click", keyClick));
        helpButton.removeEventListener("click", help);

        winLoseHTML.innerText = "You lose!";
        winLoseHTML.style.display = "block";
    };
};

function playAgain() {
    selectedCategory = categorySelect.value.toLowerCase();

    if (selectedCategory == "category") {
        return;
    };

    wrongChoices = 0;
    helpAmount = 3;

    Array.from(losingLetterHTML.children).forEach(el => el.innerHTML = "&#160;&#160;&#160;");

    document.querySelector(".help-amount_").innerText = `x${helpAmount}`;;
    wordToGuessHTML.innerText = "";
    keyboardHTML.innerText = "";
    winLoseHTML.style.display = "none";

    helpButton.addEventListener("click", help);

    loadWordToGuess();
    loadKeyboard();
};

function losingletter() {
    let randomIndex = Math.floor(Math.random() * 7);

    if (losingLetterHTML.children[randomIndex].innerText.includes(" ")) {
        switch (randomIndex) {
            case 0:
                losingLetterHTML.children[randomIndex].innerText = "H";
                break;
            case 1:
                losingLetterHTML.children[randomIndex].innerText = "A";
                break;
            case 2:
                losingLetterHTML.children[randomIndex].innerText = "N";
                break;
            case 3:
                losingLetterHTML.children[randomIndex].innerText = "G";
                break;
            case 4:
                losingLetterHTML.children[randomIndex].innerText = "M";
                break;
            case 5:
                losingLetterHTML.children[randomIndex].innerText = "A";
                break;
            case 6:
                losingLetterHTML.children[randomIndex].innerText = "N";
                break;
        };
    } else {
        losingletter();
    };
};

function help() {
    let randomLetter = getRandomLetter();

    helpAmount--;

    document.querySelector(".help-amount_").innerText = `x${helpAmount}`;

    if (helpAmount == 0) {
        helpButton.removeEventListener("click", help);
    };

    keyClick(randomLetter);
};

function getRandomLetter() {
    let randomIndex = Math.floor(Math.random() * word.length);
    let randomLetterReturn = word.split("")[randomIndex];

    Array.from(wordToGuessHTML.children).forEach(e => {
        if (randomLetterReturn == e.innerText || randomLetterReturn == " ") {
            randomLetterReturn = getRandomLetter();
        } else {
            return;
        };
    });

    return randomLetterReturn;
};

helpButton.addEventListener("click", help);
playButton.addEventListener("click", playAgain);
document.addEventListener("keydown", (e) => {
    keyboardLayout.forEach((key, index) => {
        if (e.key == key.toLowerCase()) {
            keyboardHTML.children[index].click();
        };
    });
});

document.addEventListener("DOMContentLoaded", () => {
    loadWordToGuess();
    loadKeyboard();
});