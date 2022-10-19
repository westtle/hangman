let word;
let selectedCategory = "animals";
let wrongChoices = 0;
let helpLeft = 3;

const keyboardLayout = "1234567890QWERTYUIOPASDFGHJKL-ZXCVBNM.&".split("");

// HTML.
const header = document.querySelector(".__header");
const helpButton = document.querySelector(".__header ._help");

const wordToGuessDiv = document.querySelector(".__game ._guess-word");
const keyboardDiv = document.querySelector(".__game ._key");
const winLoseDiv = document.querySelector(".__game ._win-lose");

const categorySelector = document.querySelector(".__play-again select");
const playButton = document.querySelector(".__play-again button");

async function loadWordToGuess() {
    word = await getWord(selectedCategory);

    word.split("").forEach(letter => {
        let letterSpan = document.createElement("span");

        if (letter == " ") {
            letterSpan.innerText = " "; // Somehow the "_" is wrapping well if I did this.
            letterSpan.style.border = "none";
        } else {
            letterSpan.innerHTML = "&nbsp;&nbsp;&nbsp;";
        };

        wordToGuessDiv.append(letterSpan);
    });
};

function loadKeyboard() {
    keyboardLayout.forEach(key => {
        let keySpan = document.createElement("span");
        keySpan.innerText = key;
        keyboardDiv.append(keySpan);
        keySpan.addEventListener("click", keyClick);
    });
};

function keyClick(helpLetter) {
    let keyClicked;

    // If the help button is clicked, do else. Otherwise do the first if.
    if (this.innerText !== undefined) {
        keyClicked = this.innerText.toUpperCase();

        word.split("").forEach((letter, index) => {
            if (keyClicked == letter) {
                this.classList.add("clicked");
                wordToGuessDiv.children[index].innerHTML = `&nbsp;${letter}`;
            };
        });

        // Can only click once.
        this.removeEventListener("click", keyClick);

    } else {
        keyClicked = helpLetter;

        // Add the helpLetter to HTML & make the key seems like it's already clicked.
        word.split("").forEach((letter, index) => {
            if (keyClicked == letter) {
                wordToGuessDiv.children[index].innerHTML = `&nbsp;${letter}`;
                wordToGuessDiv.children[index].removeEventListener("click", keyClick);
                Array.from(keyboardDiv.children).forEach(key => {
                    if (key.innerText == helpLetter) {
                        key.classList.add("clicked-hint");
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

    Array.from(wordToGuessDiv.children).forEach(e => {
        if (e !== keyClicked) {
            correctLetter += e.innerText.split("")[1];
        };
    });

    correctLetter = correctLetter.replace(/undefined/g, " "); // undefined is the empty space / blank letter.
    
    if (correctLetter === word) {
        Array.from(keyboardDiv.children).forEach(key => key.removeEventListener("click", keyClick));
        helpButton.removeEventListener("click", help);

        winLoseDiv.innerHTML = "<h3>You win!</h3>";
        winLoseDiv.style.display = "inline";
    };
};

function loseCheck(keyClicked, el) {

    // If clicked wrong key, increase by 1.
    if (!word.includes(keyClicked)) {
        wrongChoices++;
        losingletter();

        el.classList.add("clicked-wrong");
    };

    if (wrongChoices === 7) {

        // If lose, show the remaining letters.
        Array.from(wordToGuessDiv.children).forEach((e, index) => {
            if (e.innerText == "   ") {
                e.style.fontWeight = "bold";
                e.style.fontStyle = "italic";
            };

            e.innerText = word.split("")[index];
        });

        // Remove event listener from all key.
        Array.from(keyboardDiv.children).forEach(key => key.removeEventListener("click", keyClick));
        helpButton.removeEventListener("click", help);

        winLoseDiv.innerHTML = "<h3>You lose!</h3>";
        winLoseDiv.style.display = "inline";
    };
};

function restartGame() {
    selectedCategory = categorySelector.value.toLowerCase();

    if (selectedCategory == "category") {
        return;
    };

    wrongChoices = 0;
    helpLeft = 3;

    Array.from(header.children).forEach(e => {
        if (e.className == "_help-left") {
            e.innerText = `x${helpLeft}`;
            return;
        };

        e.innerHTML = "&#160;&#160;&#160;"
    });

    wordToGuessDiv.innerText = "";
    keyboardDiv.innerText = "";
    winLoseDiv.style.display = "none";

    helpButton.addEventListener("click", help);

    loadWordToGuess();
    loadKeyboard();
};

function losingletter() {
    let randomIndex = Math.floor(Math.random() * 7);

    if (header.children[randomIndex].innerText.includes("   ")) {
        switch (randomIndex) {
            case 0:
                header.children[randomIndex].innerText = "H";
                break;
            case 1:
                header.children[randomIndex].innerText = "A";
                break;
            case 2:
                header.children[randomIndex].innerText = "N";
                break;
            case 3:
                header.children[randomIndex].innerText = "G";
                break;
            case 4:
                header.children[randomIndex].innerText = "M";
                break;
            case 5:
                header.children[randomIndex].innerText = "A";
                break;
            case 6:
                header.children[randomIndex].innerText = "N";
                break;
        };
    } else {
        losingletter();
    };
};

// Help function.
function help() {
    let randomLetter = getRandomLetter();

    helpLeft--;

    document.querySelector("._help-left").innerText = `x${helpLeft}`;

    if (helpLeft == 0) {
        helpButton.removeEventListener("click", help);
    };

    keyClick(randomLetter);
};

function getRandomLetter() {
    let randomIndex = Math.floor(Math.random() * word.length);
    let randomLetterReturn = word.split("")[randomIndex];

    Array.from(wordToGuessDiv.children).forEach(e => {
        if (randomLetterReturn == e.innerText.split("")[1] || randomLetterReturn == " ") {
            randomLetterReturn = getRandomLetter();
        } else {
            return;
        };
    });

    return randomLetterReturn;
};

// Fetch category from local.
async function getWord(category) {
    const response = await fetch("./assets/categories.min.json");
    const data = await response.json();

    let randomIndex = Math.floor(Math.random() * data[category].length);

    return data[category][randomIndex].toUpperCase();
};

helpButton.addEventListener("click", help);
playButton.addEventListener("click", restartGame);
document.addEventListener("keydown", (e) => {
    keyboardLayout.forEach((key, index) => {
        if (e.key == key.toLowerCase()) {
            keyboardDiv.children[index].click();
        };
    });
});

document.addEventListener("DOMContentLoaded", () => {
    loadWordToGuess();
    loadKeyboard();
});