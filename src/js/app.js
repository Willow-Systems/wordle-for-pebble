/**
 * Wordle V1.0
 *
 * mail@willow.systems
 */

var UI = require('ui');
var Vector = require('vector2');
var Web = require('ajax');
var Feature = require('platform/feature');
var Settings = require('settings');
var Vibe = require('ui/vibe');
var Wordle = require('./wordle.js');

const debug = false;

// const guess_letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
const guess_letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

//True when a modal is active. Means you can only press back
var reduced_input_mode = false;
var active_screen = "home";
var grid_drawn = false;
var modal_elements = [];
var has_finished = false;

var exit_elements = [];
var exit_modal_visible = false;

var home_menu = [];
var home_menu_selected = 0;

var guessState = {
    word: 0,
    letter: 0,
    selected_letter: -1,
    selected_letters: [-1,-1,-1,-1,-1],
    lettersOnBoard: {},
    unused_letters: []
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
    if (debug) { console.log("Starting app") }
    var word = Wordle.get_word();
    if (debug) { console.log('Todays word is ' + word) }

    //Analytics
    var userToken = Pebble.getAccountToken();
    var watch = Pebble.getActiveWatchInfo();
    var data = {
        id: userToken,
        hardware: watch.model,
        local_date: new Date().toISOString(),
        language: watch.language
    }
    Web({
        url: "https://willow.systems/wordle-info/info/",
        method: "POST",
        type: "json",
        data: data,
    }, function() { console.log("A:OK")}, function() { console.log("A:FAIL")});
}

function draw_grid(guess_number, letter_number) {  
    var posX = 8
    // var posY = 20
    var posY = 3

    if (debug) { console.log("Each square is " + width + " wide.") }

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

    if (debug) { console.log(guessState.lettersOnBoard) }
    grid_drawn = true;

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

        Vibe.vibrate('double');
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

    home_menu.push(new UI.Text({
        text: "Play",
        font: "gothic-18-bold",
        position: new Vector(0, 70),
        color: "black",
        size: new Vector(144,30),
        textAlign: "center"
        
    }));
    window_home.add(home_menu[0]);

    home_menu.push(new UI.Text({
        text: "Version",
        font: "gothic-18-bold",
        position: new Vector(0, 100),
        color: "#AAAAAA",
        size: new Vector(144,30),
        textAlign: "center"
    }));
    window_home.add(home_menu[1]);

    home_menu.push(new UI.Text({
        text: "Controls",
        font: "gothic-18-bold",
        position: new Vector(0, 130),
        color: "#AAAAAA",
        size: new Vector(144,30),
        textAlign: "center"
    }));
    window_home.add(home_menu[2]);

    window_home.add(new UI.Text({
        text: "#" + Wordle.get_number(),
        font: "gothic-14",
        position: new Vector(110, 50),
        color: "black",
        size: new Vector(50,30),
        textAlign: "left"
    }));

    // window_home.add(new UI.Text({
    //     text: "Leaderboard",
    //     font: "gothic-18-bold",
    //     position: new Vector(0, 110),
    //     color: "#AAAAAA",
    //     size: new Vector(144,30),
    //     textAlign: "center"
        
    // }));

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

    if (exit_modal_visible) {
        hide_exit_modal()
        return
    }

    if (home_menu_selected == 0) {
        //play
        active_screen = "main"
        if (! grid_drawn) {
            draw_grid();
            window.add(selectangle);
            loadBoardState();
            window.show();
        } else {
            window.show()
        }
    } else if (home_menu_selected == 1) {
        //about
        var about_card = new UI.Card({
            title: 'Wordle for Pebble',
            style: 'small',
            scrollable: true,
            body: 'V2.0 by @Will0. \n Original wordle by /u/powerlanguage. \n-----\nV2:\nAdded game saving, the option to copy your wordle from the setting page on your phone, and the ability to hide the letters when you finish a game.\nV1:\nInital release.'
        });
        about_card.show();
    } else {
        //controls
        var about_card = new UI.Card({
            title: 'Controls',
            style: 'small',
            scrollable: true,
            body: 'up/down: Change highlighted letter\n\nselect: Move to next letter. If it\'s the last letter, submit guess.\n\nlong-press-down: Copy letter from the same space in the previous guess\n\nback: Move back a letter\n\nIf the word shakes when you submit a guess, it\'s not a valid word.',
        });
        about_card.show();
    }
});
window_home.on('click', 'down', function() {
    home_menu_selected++;
    if (home_menu_selected > home_menu.length-1) { home_menu_selected = 0 }
    for (var i=0;i<home_menu.length;i++) {
        if (i == home_menu_selected) {
            home_menu[i].color("black");
        } else {
            home_menu[i].color("#AAAAAA");
        }
    }
});
window_home.on('click', 'up', function() {
    home_menu_selected--;
    if (home_menu_selected < 0) { home_menu_selected = home_menu.length - 1 }
    for (var i=0;i<home_menu.length;i++) {
        if (i == home_menu_selected) {
            home_menu[i].color("black");
        } else {
            home_menu[i].color("#AAAAAA");
        }
    }
});
window_home.on('click', 'back', function() {

    // if (has_finished || exit_modal_visible) {
        window_home.hide()
    // } else {
        // show_exit_modal();
    // }

})

//Enable to easily test timeline token:
// window_home.on('longClick', 'down', function() {
//     create_timeline_token({
//         won: true,
//         count: 3
//     });
// })

window.on('click', 'up', function() {
    if (reduced_input_mode) { 
        
        for (var i=0;i<modal_elements.length;i++) {
            modal_elements[i].animate({position: new Vector(modal_elements[i].position().x, modal_elements[i].position().y - (Feature.resolution().y - 60))})
        }
        return
    
    }
    if (debug) { console.log('Up clicked!'); }
    guessState.selected_letter++;
    if (guessState.selected_letter > 25) {
        guessState.selected_letter = 0;
    }
    guessState.selected_letters[guessState.letter] = guessState.selected_letter;
    
    if (debug) { console.log("--------") }
    if (debug) { console.log("Highlighted letter: " + guessState.letter); }
    if (debug) { console.log("Highlighted word: " + guessState.word); }
    if (debug) { console.log("Chosen Character: " + guessState.selected_letter); }
    if (debug) { console.log("Current word array: " + JSON.stringify(guessState.selected_letters)); }
    if (debug) { console.log("--------") }

    lbls[guessState.letter + "-" + guessState.word].text(guess_letters[guessState.selected_letter])

    if (guessState.unused_letters.indexOf(guessState.selected_letter) == -1) {
        lbls[guessState.letter + "-" + guessState.word].color("black");
    } else {
        lbls[guessState.letter + "-" + guessState.word].color("#AAAAAA");
    }
});
window.on('longClick', 'up', function() {
    if (reduced_input_mode) { return }
    if (debug) { console.log('Up clicked!'); }
    guessState.selected_letter += 13;
    if (guessState.selected_letter > 25) {
        guessState.selected_letter = guessState.selected_letter - 25;
    }
    if (guessState.selected_letter > 25) {
        guessState.selected_letter = 0;
    }
    guessState.selected_letters[guessState.letter] = guessState.selected_letter;
    
    if (debug) { console.log("--------") }
    if (debug) { console.log("Highlighted letter: " + guessState.letter); }
    if (debug) { console.log("Highlighted word: " + guessState.word); }
    if (debug) { console.log("Chosen Character: " + guessState.selected_letter); }
    if (debug) { console.log("Current word array: " + JSON.stringify(guessState.selected_letters)); }
    if (debug) { console.log("--------") }

    lbls[guessState.letter + "-" + guessState.word].text(guess_letters[guessState.selected_letter])

    if (guessState.unused_letters.indexOf(guessState.selected_letter) == -1) {
        lbls[guessState.letter + "-" + guessState.word].color("black");
    } else {
        lbls[guessState.letter + "-" + guessState.word].color("#AAAAAA");
    }
});

window.on('click', 'down', function() {
    if (reduced_input_mode) { 
        
        for (var i=0;i<modal_elements.length;i++) {
            modal_elements[i].animate({position: new Vector(modal_elements[i].position().x, modal_elements[i].position().y + (Feature.resolution().y - 60))})
        }
        return
    
    }
    if (debug) { console.log('Down clicked!'); }
    guessState.selected_letter--;
    if (guessState.selected_letter < 0) {
        guessState.selected_letter = 25;
    }
    guessState.selected_letters[guessState.letter] = guessState.selected_letter;

    if (debug) { console.log("Current selected letter is " + guess_letters[guessState.selected_letter]) }
    if (debug) { console.log("--------") }
    if (debug) { console.log("Highlighted letter: " + guessState.letter); }
    if (debug) { console.log("Highlighted word: " + guessState.word); }
    if (debug) { console.log("Chosen Character: " + guessState.selected_letter); }
    if (debug) { console.log("Current word array: " + JSON.stringify(guessState.selected_letters)); }
    if (debug) { console.log("--------") }

    lbls[guessState.letter + "-" + guessState.word].text(guess_letters[guessState.selected_letter]);

    if (guessState.unused_letters.indexOf(guessState.selected_letter) == -1) {
        lbls[guessState.letter + "-" + guessState.word].color("black");
    } else {
        lbls[guessState.letter + "-" + guessState.word].color("#AAAAAA");
    }
});
window.on('longClick', 'down', function() {
    if (reduced_input_mode) { return }
    if (guessState.word == 0) { return }
    if (debug) { console.log('Long Down clicked!'); }

    var copy_letter = lbls[guessState.letter + "-" + (guessState.word-1)].text();
    copy_letter = (copy_letter.charCodeAt(0) - 65);
    guessState.selected_letter = copy_letter;
    if (guessState.selected_letter < 0) {
        guessState.selected_letter = 25;
    }
    guessState.selected_letters[guessState.letter] = guessState.selected_letter;
    if (debug) { console.log("Current selected letter is " + guess_letters[guessState.selected_letter]) }
    if (debug) { console.log("--------") }
    if (debug) { console.log("Highlighted letter: " + guessState.letter); }
    if (debug) { console.log("Highlighted word: " + guessState.word); }
    if (debug) { console.log("Chosen Character: " + guessState.selected_letter); }
    if (debug) { console.log("Current word array: " + JSON.stringify(guessState.selected_letters)); }
    if (debug) { console.log("--------") }
    lbls[guessState.letter + "-" + guessState.word].text(guess_letters[guessState.selected_letter])

    if (guessState.unused_letters.indexOf(guessState.selected_letter) == -1) {
        lbls[guessState.letter + "-" + guessState.word].color("black");
    } else {
        lbls[guessState.letter + "-" + guessState.word].color("#AAAAAA");
    }
});

window.on('click', 'select', function() {
    if (reduced_input_mode) { 

        toggle_letter_visiblity()
        return

    }
    if (guessState.letter < 4) {

        if (debug) { console.log('select clicked!'); }
        // selectangle.position(new Vector(selectangle.position().x + width, selectangle.position().y));
        selectangle.animate({position: new Vector(selectangle.position().x + width, selectangle.position().y)})
        guessState.letter++;
        
    } else {

        guess_current_word()

    }
    guessState.selected_letter = guessState.selected_letters[guessState.letter];
});
function guess_current_word(disable_animation = false) {
    if (debug) { console.log("SUBMIT GUESS"); }
        var guess_result = submit_guess(guessState.selected_letters);

        if (! guess_result.a) {

            if (debug) { console.log("Invalid word"); }
            shake();

        } else {

            if (debug) { console.log("Valid word"); }

            for (var i=0;i<guess_result.r.length;i++) {
                var state = guess_result.r[i];

                if (debug) { console.log("State: "+ state) }
                if (state == "y") {
                    rects[i + "-" + guessState.word].backgroundColor("yellow");
                } else if (state == "g") {
                    rects[i + "-" + guessState.word].backgroundColor("green");
                } else {
                    //Add letter to array of letters we know aren't in the word
                    if (guessState.unused_letters.indexOf(guessState.selected_letters[i]) == - 1 && Wordle.get_word().indexOf(guess_letters[guessState.selected_letters[i]].toLowerCase()) == -1) {
                        if (debug) { console.log("Add " + guessState.selected_letters[i] + " to list of known not included letters") }
                        guessState.unused_letters.push(guessState.selected_letters[i]);
                    }
                    if (debug) { console.log(guessState.unused_letters) }
                }

            }

            if (guess_result.w) {
                if (debug) { console.log("You Won!!"); }
                if (disable_animation) {
                    //If we don't delay when winning straight after board load, the click events dont fire
                    setTimeout(create_won_modal, 500);
                } else {
                    create_won_modal()
                    saveBoardState();
                }
                create_timeline_token({
                    won: true,
                    count: (guessState.word + 1)
                });
            }

            if (guessState.word == 5) {
            
                if (debug) { console.log("Ran out of Guesses"); }
                create_lost_modal();
                create_timeline_token({
                    won: false,
                    count: 6
                });
                return

            } else {
             
                // Next word
                guessState.letter = 0;
                guessState.word++;
                if (disable_animation) {
                    selectangle.position(new Vector(8, selectangle.position().y + width));
                } else {
                    selectangle.animate({position: new Vector(8, selectangle.position().y + width)})
                }
                guessState.selected_letters = [-1,-1,-1,-1,-1];
                
            }
        }

}

window.on('click', 'back', function() {
    saveBoardState();
    if (guessState.letter > 0 && reduced_input_mode == false) {
        if (debug) { console.log('back clicked!'); }
        guessState.letter--;
        // selectangle.position(new Vector(selectangle.position().x - width, selectangle.position().y))
        selectangle.animate({position: new Vector(selectangle.position().x - width, selectangle.position().y)})
        guessState.selected_letter = guessState.selected_letters[guessState.letter];
    } else {
        if (active_screen == "main") {

            window.hide()
        }
        if (active_screen == "home") {
            window_home.hide()
        }
    }
});

// window.on('longClick', 'select', function() {
//     // saveBoardState();
//     loadBoardState();
// })

function submit_guess(arr) {
    var word = [];
    arr.forEach(function(l) {
        word.push(guess_letters[l]);
    })
    word = word.join("");
    if (debug) { console.log("Guessed word is: " + word); }

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
    var win_info = new UI.Text({
        text: (guessState.word + 1) + "/6 - " + guess_count_to_comment(guessState.word) + "\n\n down - Hide msg\n\n select - Toggle letters",
        font: "gothic-14",
        position: new Vector(30, Feature.resolution().y),
        color: "black",
        size: new Vector(100,80),
        textAlign: "center"
    });
    window.add(win_modal);
    window.add(win_title);
    window.add(win_info);
    modal_elements.push(win_modal);
    modal_elements.push(win_title);
    modal_elements.push(win_info);
    win_modal.animate({position: new Vector(15, 15)})
    win_title.animate({position: new Vector(15, 30)})
    win_info.animate({position: new Vector(15, 60)})
    reduced_input_mode = true
    has_finished = true
}

function create_lost_modal() {
    var lose_modal = new UI.Rect({
        size: new Vector(Feature.resolution().x - 30, Feature.resolution().y - 30),
        position: new Vector(15, Feature.resolution().y),
        borderColor: "black",
        backgroundColor: "white",
        borderWidth: 3
    });
    var lose_title = new UI.Text({
        text: "You Lost!",
        font: "gothic-18-bold",
        position: new Vector(30, Feature.resolution().y),
        color: "black",
        size: new Vector(100,40),
        textAlign: "center"
    });
    var lose_reveal = new UI.Text({
        text: "The word was '" + Wordle.get_word() + "'",
        font: "gothic-14",
        position: new Vector(30, Feature.resolution().y),
        color: "black",
        size: new Vector(100,40),
        textAlign: "center"
    });
    window.add(lose_modal);
    window.add(lose_title);
    window.add(lose_reveal);

    modal_elements.push(lose_modal);
    modal_elements.push(lose_title);
    modal_elements.push(lose_reveal);

    lose_modal.animate({position: new Vector(15, 15)})
    lose_title.animate({position: new Vector(15, 30)})
    lose_reveal.animate({position: new Vector(15, 70)})
    reduced_input_mode = true
    has_finished = true
}

function show_exit_modal() {
    if (exit_elements.length < 1) {
        create_exit_confirm_modal()
        exit_modal_visible = true
    } else {
        for (var i=0;i<exit_elements.length;i++) {
            exit_elements[i].animate({position: new Vector(exit_elements[i].position().x, exit_elements[i].position().y - Feature.resolution().y - 20)})
            exit_elements[i].animate({position: new Vector(exit_elements[i].position().x, exit_elements[i].position().y + 20)})
        }
        exit_modal_visible = true
    }
}
function hide_exit_modal() {
        for (var i=0;i<exit_elements.length;i++) {
            exit_elements[i].animate({position: new Vector(exit_elements[i].position().x, exit_elements[i].position().y + Feature.resolution().y)})
        }
        exit_modal_visible = false
}
function create_exit_confirm_modal() {
    var ec_modal = new UI.Rect({
        size: new Vector(114, Feature.resolution().y - 30),
        position: new Vector(15, 100 + Feature.resolution().y),
        borderColor: "black",
        backgroundColor: "white",
        borderWidth: 3
    });
    var ec_text = new UI.Text({
        text: "Press back again to exit without saving. Press select to cancel.",
        font: "gothic-14",
        position: new Vector(16, 102 + Feature.resolution().y),
        color: "black",
        size: new Vector(110,60),
        textAlign: "center"
    });
    window_home.add(ec_modal);
    window_home.add(ec_text);
    exit_elements.push(ec_modal);
    exit_elements.push(ec_text);
    show_exit_modal();
}

function guess_count_to_comment(num) {
    var out = {
        0: "Genius",
        1: "Magnificent",
        2: "Impressive",
        3: "Great",
        4: "Good",
        5: "Phew"
    }
    if (out.hasOwnProperty(num)) {
        return out[num]
    } else {
        return "wut"
    }
}

function create_timeline_token(result) {
    //Create a timeline token with the game result
    var data = {}

    if (result.won) {

        data = {
            "id": "wordle-" + Wordle.get_number(),
            "time": new Date().toISOString(),
            "layout": {
                "type": "weatherPin",
                "title": "Wordle " + Wordle.get_number(),
                "subtitle": result.count + "/6",
                "tinyIcon": "system://images/MUSIC_EVENT",
                "largeIcon": "system://images/MUSIC_EVENT",
                "locationName": guess_count_to_comment(result.count),
                "body": "The word was '" + Wordle.get_word() + "'",
                "lastUpdated": new Date().toISOString()
            }
        }
        
    } else {

        data = {
            "id": "wordle-" + Wordle.get_number(),
            "time": new Date().toISOString(),
            "layout": {
                "type": "weatherPin",
                "title": "Wordle " + Wordle.get_number(),
                "subtitle": "Failed to guess",
                "tinyIcon": "system://images/RESULT_MUTE",
                "largeIcon": "system://images/RESULT_MUTE",
                "locationName": "Try again tomorrow",
                "body": "The word was '" + Wordle.get_word() + "'",
                "lastUpdated": new Date().toISOString()
            }
        }

    }

    Pebble.getTimelineToken(function(token) {

        console.log('My timeline token is ' + token);
        Web({
            url: "https://timeline-api.rebble.io/v1/user/pins/" + data.id,
            method: "PUT",
            type: "json",
            data: data,
            headers: [
                { 'X-User-Token': token }
            ]
        }, function() { console.log("TL:OK")}, function(r,c) { console.log("TL:FAIL"); console.log(JSON.stringify(r)); console.log(c)});

      }, function(error) {

        console.log('Error getting timeline token: ' + error);

      });

}

function saveBoardState() {
    var board = [];
    for (var word = 0; word<6; word++) {
        var current_word = []
        for (var letter=0; letter < 5; letter++) {
            if (debug) { console.log("Word " + word + ", letter " + letter + " = " + lbls[letter + "-" + word].text()) }

            if (lbls[letter + "-" + word].text() != "") {
                current_word.push(lbls[letter + "-" + word].text())
            }
        }
        board.push(current_word);
    }

    if (has_finished) {
        //Save the colours
        var colour_board = [];
        for (var word = 0; word<6; word++) {
            var current_word = []
            for (var letter=0; letter < 5; letter++) {
                if (debug) { console.log("Word " + word + ", letter " + letter + " color = " + rects[letter + "-" + word].backgroundColor()) }
    
                if (lbls[letter + "-" + word].text() != "") {
                    current_word.push(rects[letter + "-" + word].backgroundColor())
                }
            }
            colour_board.push(current_word);
        }
    }
    
    Settings.data('board', board);
    Settings.data('game', Wordle.get_number());
    Settings.data('complete', has_finished);
    
    Settings.option('g_num', Wordle.get_number());
    Settings.option('g_colors', colour_board);
    Settings.option('g_guesses', guessState.word);
}
function loadBoardState() {
    // var saveData = [["B","O","A","R","D"],["F","I","R","S","T"],["A","P"],[],[],[]];
    // var saveData = [["B","O","A","R","D"],["F","I","R","S","T"],["S","P","E","L","T"],["S","M","E","L","T"],[],[]];
    // var saveData = [["B","O","A","R","D"],["F","I","R","S","T"],["S","P","E","L","T"],["S","M"],[],[]];

    var saveData = null;

    if (Settings.data('game') == Wordle.get_number()) {
        saveData = Settings.data('board');
    } else {
        return
    }

    for (var word = 0; word<6; word++) {

        if (saveData[word].length < 5) {

            guessState.word = word
            guessState.selected_letters = [];

            for (var letter=0; letter < saveData[word].length; letter++) {
                guessState.letter = letter
                lbls[letter + "-" + word].text(saveData[word][letter]);
                guessState.selected_letters.push(guess_letters.indexOf(saveData[word][letter]))
                guessState.selected_letter = guess_letters.indexOf(saveData[word][letter]);
                selectangle.position(new Vector(selectangle.position().x + width, selectangle.position().y));
            }

            if (saveData[word].length > 0) {
                selectangle.position(new Vector(selectangle.position().x - width, selectangle.position().y));
            }
            
            for (var i=0; i < 5 - saveData[word].length; i++) {
                guessState.selected_letters.push(-1)
            }

            
            //Skip the last few empty arrays. Incomplete word marks the end of the save data
            guessState.word = guessState.word - 1;
            console.log(JSON.stringify(guessState));
            break;

        } else {
            //Whole word
            guessState.word = word
            guessState.selected_letters = [];
            for (var letter=0; letter < 5; letter++) {

                guessState.letter = letter
                //Load letter into label
                lbls[letter + "-" + word].text(saveData[word][letter]);
                console.log("Find indexof " + saveData[word][letter])
                guessState.selected_letters.push(guess_letters.indexOf(saveData[word][letter]))

                
            }
            console.log(JSON.stringify(guessState));
            guess_current_word(true);

        }
        

    }

}
function toggle_letter_visiblity() {
    if (lbls["0-0"].color() == "black") {
        for (var w=0;w<6;w++) {
            for (var l=0;l<5;l++) {
                lbls[l + "-" + w].color(lbls[l + "-" + w].backgroundColor())
            }
        }
    } else {
        for (var w=0;w<6;w++) {
            for (var l=0;l<5;l++) {
                lbls[l + "-" + w].color("black")
            }
        }
    }
}

Settings.config(
    { url: 'http://willow.systems/pebble/configs/wordle' },
    function(e) {
      console.log('closed configurable');
  
      // Show the parsed response
      console.log(JSON.stringify(e.options));
  
      // Show the raw response if parsing failed
      if (e.failed) {
        console.log(e.response);
      }
    }
  );

//Debug
// guessState.letter = 4
// guessState.selected_letter = 19
// guessState.selected_letters = [0,1,14,20,19];

init();
// draw_grid(guessState.word, guessState.letter);
draw_home();
// window.add(selectangle);

// console.log("=========")
// console.log(" TESTING ")
// console.log("=========")
// console.log("Guess black => " + JSON.stringify(Wordle.perform_guess("choke").r));
// console.log("Guess choke => " + JSON.stringify(Wordle.perform_guess("choke").r));
// console.log("Guess toady => " + JSON.stringify(Wordle.perform_guess("toady").r));
// console.log("Guess titty => " + JSON.stringify(Wordle.perform_guess("titty").r));
// console.log("Guess today => " + JSON.stringify(Wordle.perform_guess("today").r));

// console.log("Word at 0am: " + Wordle.get_word('12 March 2022 00:00:01'));
// console.log("Word at 1am: " + Wordle.get_word('12 March 2022 01:00:00'));
// console.log("Word at 11:59am: " + Wordle.get_word('12 March 2022 11:59:00'));
// console.log("Word at 12pm: " + Wordle.get_word('12 March 2022 12:00:00'));
// console.log("Word at 7pm: " + Wordle.get_word('12 March 2022 19:00:00'));
// console.log("Word at 10pm: " + Wordle.get_word('12 March 2022 22:00:00'));
// console.log("Word at 11pm: " + Wordle.get_word('12 March 2022 23:00:00'));
// console.log("Word at 11:01pm: " + Wordle.get_word('12 March 2022 23:01:00'));
// console.log("Word at 11:59pm: " + Wordle.get_word('12 March 2022 23:59:00'));

