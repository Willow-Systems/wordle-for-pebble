/**
 * Wordle V1.0
 *
 * mail@willow.systems
 */

var UI = require('ui');
var Vector = require('vector2');
var Web = require('ajax');
var Feature = require('platform/feature');
var Light = require('ui/light');
var Vibe = require('ui/vibe');
var Wordle = require('./wordle.js');

// const guess_letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
const guess_letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

var guessState = {
    word: 0,
    letter: 0,
    selected_letter: -1,
    selected_letters: [-1,-1,-1,-1,-1],
    line: [],
    lettersOnBoard: {}
}
var lbls = {}
var rects = {}

var window_home = new UI.Window({
    status: false,
    backgroundColor: "white"
})
var window = new UI.Window({ 
    status: false,
    backgroundColor: "white"
});

var width = (Feature.resolution().x - 10) / 5;

var selectangle = new UI.Rect({
    size: new Vector(width - 3, width - 3),
    position: new Vector(8, 3),
    borderColor: "black",
    backgroundColor: "transparent",
    borderWidth: 3
});
function init() {
    console.log("Starting app");
    var word = Wordle.get_word();
    console.log('Todays word is ' + word);
}

function draw_grid(guess_number, letter_number) {  
    var posX = 8
    // var posY = 20
    var posY = 3

    console.log("Each square is " + width + " wide.")

    guessState.lettersOnBoard[letter_number + "-" + guess_number] = guess_letters[guessState.selected_letter]

    for (var j=0; j < 6;j++) {
        for (var i=0; i < 5;i++) {

            // var borderWidth = 1;
            // if (i == letter_number && j == guess_number) {
            //     borderWidth = 3
            // }

            var rect = new UI.Rect({
                 size: new Vector(width - 3, width - 3),
                 position: new Vector(posX, posY),
                 borderColor: "black",
                 backgroundColor: "white",
                //  borderWidth: borderWidth
                borderWidth: 1
            });
            rects[i + "-" + j] = rect;
            window.add(rect)

            var lbl = new UI.Text({
                text: "",
                font: "gothic-18-bold",
                position: new Vector(posX, posY),
                color: "black",
                size: new Vector(25,30),
                textAlign: "center"

            })
            lbls[i + "-" + j] = lbl;
            window.add(lbl);

            posX += width;

        }
        posY += width;
        posX = 8;
    }

    console.log(guessState.lettersOnBoard)

    // var posX = 8
    // var posY = 20
    // for (var j=0; j < 5;j++) {
    //     for (var i=0; i<5;i++) {
    //         if (guessState.lettersOnBoard.hasOwnProperty(i + "-" + j)) {
                
    //             console.log(i + ":" + j + " is '" + guessState.lettersOnBoard[i + "-" + j] + "'")

    //             var lbl = new UI.Text({
    //                 text: guessState.lettersOnBoard[i + "-" + j],
    //                 font: "gothic-18-bold",
    //                 position: new Vector(posX, posY)
    //             });
    //             window.add(lbl);

    //         }
    //         posX += width;
    //     }

    //     posX = 8;
    //     posY += width;
       
    // }




   window.show();
}

function shake() {
    for (var i=0;i<5;i++) {
        var x = rects[i + "-" + guessState.word].position().x;
        var y = rects[i + "-" + guessState.word].position().y;

        var lx = lbls[i + "-" + guessState.word].position().x;
        var ly = lbls[i + "-" + guessState.word].position().y;
        rects[i + "-" + guessState.word].animate({position: new Vector(x - 5, y)}, 100);
        lbls[i + "-" + guessState.word].animate({position: new Vector(lx - 5, ly)}, 100);

        rects[i + "-" + guessState.word].animate({position: new Vector(x + 5, y)}, 100);
        lbls[i + "-" + guessState.word].animate({position: new Vector(lx + 5, ly)}, 100);

        rects[i + "-" + guessState.word].animate({position: new Vector(x, y)}, 100);
        lbls[i + "-" + guessState.word].animate({position: new Vector(lx, ly)}, 100);
    }
}

function draw_home() {
    var posX = 8;
    var colours = ["green","white","yellow","yellow","white","white"];
    var title = ["W","O","R","D","L","E"];
    var w = (Feature.resolution().x - 10) / 6;
    for (var i=0;i<6;i++) {


        window_home.add(new UI.Rect({
            size: new Vector(w - 3, w - 3),
            position: new Vector(posX, 30),
            borderColor: "black",
            backgroundColor: colours[i],
           //  borderWidth: borderWidth
           borderWidth: 1
        }));
        
        window_home.add(new UI.Text({
            text: title[i],
            font: "gothic-18-bold",
            position: new Vector(posX - 2, 28),
            color: "black",
            size: new Vector(25,30),
            textAlign: "center"
            
        }));

        posX += w;
        
    }

    window_home.add(new UI.Text({
        text: "Play",
        font: "gothic-18-bold",
        position: new Vector(0, 70),
        color: "black",
        size: new Vector(144,30),
        textAlign: "center"
        
    }));

    window_home.add(new UI.Text({
        text: "About",
        font: "gothic-18-bold",
        position: new Vector(0, 90),
        color: "#AAAAAA",
        size: new Vector(144,30),
        textAlign: "center"
        
    }));

    window_home.add(new UI.Text({
        text: "Leaderboard",
        font: "gothic-18-bold",
        position: new Vector(0, 110),
        color: "#AAAAAA",
        size: new Vector(144,30),
        textAlign: "center"
        
    }));

    // var lbl = new UI.Text({
    //    text: "",
    //    font: "gothic-18-bold",
    //    position: new Vector(posX, posY),
    //    color: "black",
    //    size: new Vector(25,30),
    //    textAlign: "center"

    // })
    window_home.show();
}
window_home.on('click', 'select', function() {
    draw_grid();
    window.add(selectangle);
})

window.on('click', 'up', function() {
    console.log('Up clicked!');
    guessState.selected_letter++;
    if (guessState.selected_letter > 25) {
        guessState.selected_letter = 0;
    }
    guessState.selected_letters[guessState.letter] = guessState.selected_letter;
    console.log("--------")
    console.log("Highlighted letter: " + guessState.letter);
    console.log("Highlighted word: " + guessState.word);
    console.log("Chosen Character: " + guessState.selected_letter);
    console.log("Current word array: " + JSON.stringify(guessState.selected_letters));
    console.log("--------")
    // draw_grid(guessState.word, guessState.letter);
    lbls[guessState.letter + "-" + guessState.word].text(guess_letters[guessState.selected_letter])
});

window.on('click', 'down', function() {
    console.log('Down clicked!');
    guessState.selected_letter--;
    if (guessState.selected_letter < 0) {
        guessState.selected_letter = 25;
    }
    guessState.selected_letters[guessState.letter] = guessState.selected_letter;
    console.log("Current selected letter is " + guess_letters[guessState.selected_letter])
    console.log("--------")
    console.log("Highlighted letter: " + guessState.letter);
    console.log("Highlighted word: " + guessState.word);
    console.log("Chosen Character: " + guessState.selected_letter);
    console.log("Current word array: " + JSON.stringify(guessState.selected_letters));
    console.log("--------")
    // draw_grid(guessState.word, guessState.letter);
    lbls[guessState.letter + "-" + guessState.word].text(guess_letters[guessState.selected_letter])
});

window.on('click', 'select', function() {
    if (guessState.letter < 4) {

        console.log('select clicked!');
        // selectangle.position(new Vector(selectangle.position().x + width, selectangle.position().y));
        selectangle.animate({position: new Vector(selectangle.position().x + width, selectangle.position().y)})
        guessState.letter++;
        
    } else {

        console.log("SUBMIT GUESS");
        var guess_result = submit_guess(guessState.selected_letters);

        if (! guess_result.a) {

            console.log("Invalid word");
            shake();

        } else {

            console.log("Valid word");

            for (var i=0;i<guess_result.r.length;i++) {
                var state = guess_result.r[i];

                console.log("State: "+ state)
                if (state == "y") {
                    rects[i + "-" + guessState.word].backgroundColor("yellow");
                } else if (state == "g") {
                    rects[i + "-" + guessState.word].backgroundColor("green");
                }

            }

            if (guess_result.w) {
                console.log("You Won!!");
                create_won_modal()
            }

            guessState.letter = 0;
            guessState.word++;
            selectangle.animate({position: new Vector(8, selectangle.position().y + width)})
            guessState.selected_letters = [-1,-1,-1,-1,-1];

        }


    }
    guessState.selected_letter = guessState.selected_letters[guessState.letter];
});

window.on('click', 'back', function() {
    if (guessState.letter > 0) {
        console.log('back clicked!');
        guessState.letter--;
        // selectangle.position(new Vector(selectangle.position().x - width, selectangle.position().y))
        selectangle.animate({position: new Vector(selectangle.position().x - width, selectangle.position().y)})
        guessState.selected_letter = guessState.selected_letters[guessState.letter];
    }
});

function submit_guess(arr) {
    var word = [];
    arr.forEach(function(l) {
        word.push(guess_letters[l]);
    })
    word = word.join("");
    console.log("Guessed word is: " + word);

    return Wordle.perform_guess(word);

}

function create_won_modal() {
    var win_modal = new UI.Rect({
        size: new Vector(Feature.resolution().x - 30, Feature.resolution().y - 30),
        position: new Vector(15, Feature.resolution().y),
        borderColor: "black",
        backgroundColor: "white",
        borderWidth: 3
    });
    var win_title = new UI.Text({
        text: "You Won!",
        font: "gothic-18-bold",
        position: new Vector(30, Feature.resolution().y),
        color: "black",
        size: new Vector(100,40),
        textAlign: "center"
    });
    window.add(win_modal);
    window.add(win_title);
    win_modal.animate({position: new Vector(15, 15)})
    win_title.animate({position: new Vector(15, 30)})

}

//Debug
// guessState.letter = 4
// guessState.selected_letter = 19
// guessState.selected_letters = [0,1,14,20,19];

init();
draw_grid(guessState.word, guessState.letter);
// draw_home();
window.add(selectangle);

console.log("=========")
console.log(" TESTING ")
console.log("=========")
console.log("Guess black => " + JSON.stringify(Wordle.perform_guess("choke").r));
console.log("Guess choke => " + JSON.stringify(Wordle.perform_guess("choke").r));
console.log("Guess toady => " + JSON.stringify(Wordle.perform_guess("toady").r));
console.log("Guess titty => " + JSON.stringify(Wordle.perform_guess("titty").r));
console.log("Guess today => " + JSON.stringify(Wordle.perform_guess("today").r));
