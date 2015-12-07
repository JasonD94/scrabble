/*
    File: ~/js/scrabble_v2.js
    91.461 Assignment 9: Implementing a Bit of Scrabble with Drag-and-Drop
    Jason Downing - student at UMass Lowell in 91.461 GUI Programming I
    Contact: jdowning@cs.uml.edu or jason_downing@student.uml.edu
    MIT Licensed - see http://opensource.org/licenses/MIT for details.
    Anyone may freely use this code. Just don't sue me if it breaks stuff.
    Created: Nov 24, 2015.
    Last Updated: Dec 6, 1AM.

    This JavaScript file is for the 9th assignment, "Scrabble".
*/

/**
 *    Global variables for ease of use. Lazy but whatever. It works and that's all that matters.
 */


/*
    JavaScript array of objects for the amounts and value of each letter.
    I didn't make this data structure, this was originally found on Piazza and made by Ramon Meza.
    Also, I didn't feel like figuring out how to load a JSON file again so I did the easy way
    and just made a pieces array with all the stuff I need. Obviously lazy but it works way easier SO WHY NOT.

    Note that I modified this to include a "remaining" property as well, just like
    Prof. Heines showed in class for his associative array.
*/
var pieces;

var left_right = false;   /* Boolean for reading left to right or top to bottom */

var number_of_words = 0;  /* For detecting multiple words played. */

// This function is an easy way to reset the pieces array / objects.
function load_pieces_array() {
  pieces = [
    {"letter":"A", "value":  1,  "amount":  9,  "remaining":  9},
    {"letter":"B", "value":  3,  "amount":  2,  "remaining":  2},
    {"letter":"C", "value":  3,  "amount":  2,  "remaining":  2},
    {"letter":"D", "value":  2,  "amount":  4,  "remaining":  4},
    {"letter":"E", "value":  1,  "amount": 12,  "remaining": 12},
    {"letter":"F", "value":  4,  "amount":  2,  "remaining":  2},
    {"letter":"G", "value":  2,  "amount":  3,  "remaining":  3},
    {"letter":"H", "value":  4,  "amount":  2,  "remaining":  2},
    {"letter":"I", "value":  1,  "amount":  9,  "remaining":  9},
    {"letter":"J", "value":  8,  "amount":  1,  "remaining":  1},
    {"letter":"K", "value":  5,  "amount":  1,  "remaining":  1},
    {"letter":"L", "value":  1,  "amount":  4,  "remaining":  4},
    {"letter":"M", "value":  3,  "amount":  2,  "remaining":  2},
    {"letter":"N", "value":  1,  "amount":  6,  "remaining":  6},
    {"letter":"O", "value":  1,  "amount":  8,  "remaining":  8},
    {"letter":"P", "value":  3,  "amount":  2,  "remaining":  2},
    {"letter":"Q", "value": 10,  "amount":  1,  "remaining":  1},
    {"letter":"R", "value":  1,  "amount":  6,  "remaining":  6},
    {"letter":"S", "value":  1,  "amount":  4,  "remaining":  4},
    {"letter":"T", "value":  1,  "amount":  6,  "remaining":  6},
    {"letter":"U", "value":  1,  "amount":  4,  "remaining":  4},
    {"letter":"V", "value":  4,  "amount":  2,  "remaining":  2},
    {"letter":"W", "value":  4,  "amount":  2,  "remaining":  2},
    {"letter":"X", "value":  8,  "amount":  1,  "remaining":  1},
    {"letter":"Y", "value":  4,  "amount":  2,  "remaining":  2},
    {"letter":"Z", "value": 10,  "amount":  1,  "remaining":  1},
    {"letter":"_", "value":  0,  "amount":  0,  "remaining":  0}    // Temporary set to 0 until I implement this.
  ];                                                                // Normally 2 should be in the array.
}

// JavaScript array of objects to determine what letter each piece is.
var game_tiles = [
  {"id": "piece0", "letter": "A"},
  {"id": "piece1", "letter": "B"},
  {"id": "piece2", "letter": "C"},
  {"id": "piece3", "letter": "D"},
  {"id": "piece4", "letter": "E"},
  {"id": "piece5", "letter": "F"},
  {"id": "piece6", "letter": "G"}
];

// Used for getting the original position of a draggable object.
// As seen here: https://stackoverflow.com/questions/12350259/original-position-of-a-draggable-in-jquery-ui
var startPos;

// URL for this source code: http://ejohn.org/blog/dictionary-lookups-in-javascript/
// See the "Submit word" function for more info.
// The dictionary lookup object
// Also, future note, a better dictionary file might be found here:
// http://www.math.sjsu.edu/~foster/dictionary.txt
var dict = {};

// Do a jQuery Ajax request for the text dictionary
$.get( "files/dictionary.txt", function( txt ) {
    // Get an array of all the words
    var words = txt.split( "\n" );

    // And add them as properties to the dictionary lookup
    // This will allow for fast lookups later
    for ( var i = 0; i < words.length; i++ ) {
        dict[ words[i] ] = true;
    }
});

// JavaScript array to keep track of the CURRENT game board. (the current word that is being created)
// NOTE: "pieceX" means NO tile present on that drop zone.
// Also note this is EMPTY until tiles are placed onto the game board.
var game_board = [
  // Example of what WOULD be in this array. An obj with "id" of the dropable spot and the tile that was dropped.
  //{"id": "drop0",  "tile": "pieceX"},
];

// JavaScript array to keep track of past words
var complete_words = [
  /*
      Example of what this array with look like:
      [
        // Each word will be an array of objects
        //               "H"                             "E"                              etc
        [{ {"id": "row7_col7",  "letter": "H"}, {"id": "row7_col8",  "letter": "E"}, ...}],

        // This could be the second word that is saved
        // It would also have the id of dropped tile, plus which letter it is.
        [ {H}, {E} , {L}, {L}, {O}   ]

        It could be longer as the game goes on. It could be as long as the board supports even.
        Each dropID would be used to generate valid positions for starting a new word.
        Words must be formed at RIGHT angles.
        Also, the array should be used to get the letters of saved letters.
      ]
  */
];

// Save the score of all the words saved.
var word_score = 0;

// First letter for 2nd and on words played.
var first_letter = "";

// Go through the Table with the Scrabble board and fill in special spaces.
// This Stackoverflow post was handy:
// URL: https://stackoverflow.com/questions/3065342/how-do-i-iterate-through-table-rows-and-cells-in-javascript
function fill_in_table() {
  var row = 0;
  var col = 0;

  // CURRENTLY USING BACKGROUND IMAGES FOR THE SPECIAL SPACES.

  $('#scrabble_board tr').each(function() {
    col = 0;
    /**
     *    Note, here "$(this)" refers to the given cell we are looking at currently.
     *    This code goes through ALL cells in order, so that we can apply some properties to certain cells.
     */
    $(this).find('td').each(function() {

      // Add a unique id consisting of row#col# to the cell, where "row#" is the row number
      // and "col#" is the column number. Ex: row0col0 is the top left most cell in the table.
      // Helpful link: https://stackoverflow.com/questions/2176986/jquery-add-id-instead-of-class
      $(this).attr('id', 'row' + row + '_' + 'col' + col);
      col++;

    });
    row++;
  });
}


/**
 *      This function will update the "Letters Remaining" table.
 *      The table has 3 rows of 9 cells, but the very last cell (row 3, cell 9)
 *      is empty and should remain empty.
 *
 *      URL for info on this function:
 *      https://stackoverflow.com/questions/3065342/how-do-i-iterate-through-table-rows-and-cells-in-javascript
 *
 */
function update_remaining_table() {
  var x = 0;
  var first = true;

  // Go through every cell in the table and update it.
  $('#letters_remain tr').each(function() {

    // DO NOT go over the limit of the array! Currently there is 27 elements in the
    // array. So we should stop at 27, since we are going 0 to 26.
    // Make sure to return false for this to work (THANK YOU STACKOVERFLOW)
    // URL for that amazing tip: https://stackoverflow.com/questions/1784780/how-to-break-out-of-jquery-each-loop
    if (x > 26) {
      // Quit before bad things happen.
      return true;
    }

    $(this).find('td').each(function() {
      // Skip the first row, we don't want to mess with it.
      if (first == true) {
        first = false;
        return false;
      }

      // DO NOT go over the limit of the array! Currently there is 27 elements in the
      // array. So we should stop at 27, since we are going 0 to 26.
      if (x > 26) {
        // Quit before bad things happen.
        return false;
      }

      // Easier to use variables for this stuff.
      var letter = pieces[x].letter;
      var remaining = pieces[x].remaining;

      // Using "$(this)" access each cell.
      $(this).html(letter + ": " + remaining);

      x++;    // Keep looping
      return true;
    });
    return true;
  });

  return true;
}


/**
 *      This function calls find_word(), and then determines if the word is valid
 *      or not. This will be implemented at some point using an external API
 *      or some sort of Google search thing.
 *
 *      I used an awesome website to figure this one out, so just check out the
 *      this URL for details: http://ejohn.org/blog/dictionary-lookups-in-javascript/
 *
 */
function submit_word() {
  // Call find_word to update the word.
  find_word();

  var word = $("#word").html();

  // The user needs to play a tile first...
  if (word == "____") {
    // The user isn't so smart. Tell them to try again.
    $("#messages").html("<br><div class='highlight_centered_error'> \
    Sorry, but you need to play a tile before I can check the word for you!</div>");
    console.log("Please play some tiles first.");
    return -1;
  }

  // Make sure the word is lower cased or it might not be found in the dictionary!
  word = word.toLowerCase();

  /*

      The following is taken from this awesome website. I got the dictionary file off
      my Linux OS, and it was found in "/usr/share/dict/words". It actually redirected me
      to "/etc/dictionaries-common/words" on Ubuntu 14.04 LTS. But I opened it in Sublime text
      anyway and saved it to my GitHub.

      URL for the source code: http://ejohn.org/blog/dictionary-lookups-in-javascript/
  */

  // Let's see if our word is in the dictionary.
  if ( dict[ word ] ) {
    // If it is, AWESOME! The user is so smart.
    $("#messages").html("<br><div class='highlight_centered_success'> \
    Nice job! \"" + word + "\" is considered a word by the game's dictionary!<br><br> \
    <button class='smaller_button' onclick='confirm_save_word();'>Save Word & Play Again.</button><br><br></div>");
    return 1;
  }
  else {
    // User isn't so smart. Tell them to try again.
    $("#messages").html("<br><div class='highlight_centered_error'> \
    Sorry. \"" + word + "\" is not a word in the English dictionary. \
    I suggest trying a different word. Or try resetting your tiles and trying again.</div>");
    return -1;
  }

}


/**
 *    This function confirms that the user wants to save the currently played word.
 *    This function uses a cool alert replacement called Sweet Alert.
 *    URL: https://t4t5.github.io/sweetalert/
 */
function confirm_save_word() {
  swal({
    title: "Are you sure?",
    text: "This will save the current word to the game board.\n\
    You will not be able to modify the word afterwards.\n \
    Are you sure you want to keep this word and play another one?",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Yes.",
    closeOnConfirm: true
    },
    // This is from the example page at: https://t4t5.github.io/sweetalert/
    // Basically I can quit if the user hits cancel, or continue if they hit Yes.
    function(isConfirm) {
      if (isConfirm) {
        save_word();
        return false;
      }
      else {
        // Let the user know what's going on.
        $("#messages").html("<br><div class='highlight_centered_error'> \
        SUBMIT WORD CANCELED.</div>");
        return false;
      }
  });
}


/**
 *    This function will save the currently played word / score
 *    and provide the user with new tiles to play with. This will let them play
 *    as many words as they would like and keep their score as well.
 *
 */
function save_word() {
  var game_board_length = game_board.length;      // Get gameboard array length
  var word;                                       // array for the current word
  var index = 0;

  // Let the user know what's going on.
  $("#messages").html("<br><div class='highlight_centered_success'> \
  SAVING WORD.</div>");

  // Move the game board array into the compete_words array.
  // First make an array and save everything in the game array into it.
  word = [];

  // Save everything in the game area into this new array.
  for(var i = 0; i < game_board_length; i++) {
    // temp obj, we need to save each array with the id of the droppable space
    // and with the letter that droppable space holds. this will make it easier
    // when we go to figure out what 2nd / 3rd / etc word the user is creating.
    var obj = {};
    obj["id"] = game_board[i].id;
    obj["letter"] = find_letter(game_board[i].tile);
    var tile_ID = game_board[i].tile;

    word.push(obj);   // Push obj back.

    // Mark the space as disabled so that the user cannot swap the tile in the future.
    // See this Stackoverflow post for more info: https://stackoverflow.com/questions/3948447/jquery-ui-droppable-only-accept-one-draggable
    $("#" + obj["id"]).droppable('disable');

    // Make the draggable disabled too so that the user can't drag the tile back to the rack.
    try {
      $("#" + tile_ID).draggable('disable');

      // Also change the id of the tile so it doesn't get recalled either.
      // use the game board length and current letter to make each disabled tile have a unique id.
      $("#" + tile_ID).attr("id", "disabled" + (i + complete_words.length) );  // start at 0, add length to make unique

      // Generate a new letter to be used.
      var new_letter = get_random_tile();

      // Change the game tiles array to reflect the new letter.
      for(var x = 0; x < 7; x++) {
        if(game_tiles[x].id == tile_ID) {
          index = x;  // index for the new piece.
          game_tiles[x].letter = new_letter;
        }
      }

      // Used in the next part, to create a new tile.
      var base_URL = "img/scrabble/Scrabble_Tile_";

      // Create a new draggable object with the new letter and ID of the old one.
      var new_piece = "<img class='pieces' id='piece" + index + "' src='" + base_URL + new_letter + ".jpg" + "'></img>";

      // Append to the rack.
      $("#rack").append(new_piece);

      // Make the piece draggable.
      $("#piece" + index).draggable({
        appendTo: scrabble_board,
        revert: "invalid",            // This is key. Only the rack and game board are considered valid!
        start: function(ev, ui) {
          // Save original position. (used for swapping tiles)
          startPos = ui.helper.position();
        },
        stop: function() {
          // If an invalid event is found, this will return the draggable object to its
          // default "invalid" option. From this Stackoverflow post (also used in the droppable part.)
          $(this).draggable('option','revert','invalid');
        }
      });
    }
    catch(e) {
      // the above code might fail on multiple words.
      // if so just ignore it.
    }
  }

  // Save the current word score. This will become the total score now.
  word_score = parseInt($("#score").html());  // Save it as an int.

  // Save the given word in the complete_words array
  complete_words.push(word);

  // Now that we've saved the game board array, let's empty it.
  game_board = [];

  // Reset all the Scrabble tiles
  reset_tiles();

  // And update the word / score as well.
  find_word();

  // Update remaining letters table.
  update_remaining_table();

  // Should be done now!
  return;
}


/**
 *    When called, this function determine what the current word is.
 *    It also determines what the score is for the word that it finds.
 *    Both the word and score are printed to HTML.
 *
 */
function find_word(read_left) {
  var word = "";                              // The current word.
  var score = word_score;                     // This DEFAULTS TO ZERO, but afterwards defaults to whatever the total score is!
  var board_length = game_board.length;       // Current game board
  var word_count = complete_words.length;     // All saved words

  // The word is now blank.
  $("#word").html("____");
  $("#score").html(score);

  // Go through the game board and generate a possible word.
  for(var i = 0; i < board_length; i++) {
    word += find_letter(game_board[i].tile);
    score += find_score(game_board[i].tile);
  }

  // Factor in the doubling of certain tiles. Since the should_double() function returns 0 or 1,
  // this is easy to account for. If it's 0, 0 is added to the score. If it's 1, the score is doubled.
  score += (score * should_double_triple_word());

  // Put the score of the dropped tile into the HTML doc.
  $("#score").html(score);

  // If the word is not empty, show it on the screen!
  if(word != "") {
    $("#word").html(word);
    return;
  }

  // Otherwise the word is now blank.
  $("#word").html("____");
}


/**
 *    This function determines whether to double or triple the word score.
 *    Returns:
 *    0 = neither
 *    1 = double
 *    2 = triple
 *
 */
function should_double_triple_word() {
  // Get board array length. This will be useful for our checks next.
  var gameboard_length = game_board.length;

  // Go through the game board and see if any spots have the
  // class "double_word" or "triple_word"
  for (var i = 0; i < gameboard_length; i++) {
    var space_ID = "#" + game_board[i].id

    if ( $(space_ID).hasClass('double_word') == true ) {
      // Sweet! Double the word's value!
      return 1;
    }
    else if ( $(space_ID).hasClass('triple_word') == true ) {
      // SWEET! IT'S A TRIPLE!
      return 2;
    }
  }

  // Otherwise return 0.
  return 0;
}


/**
 *    This function, given a letter, will return the letter's score based on
 *    the value in the pieces.json file.
 *
 *    parameters: an ID of a tile
 *       returns: integer score, such as "1" or "2". On error, returns "-1".
 */
function find_score(given_id) {
  // First figure out which letter we have.
  var letter = find_letter(given_id);
  var score = 0;

  // Since each "letter" is actually a spot in an array in the pieces.json file,
  // we gotta look at each object in the array before we can look at stuff.
  for(var i = 0; i < 27; i++) {
    // Get an object to look at.
    var obj = pieces[i];

    // See if this is the right object.
    if(obj.letter == letter) {
      score = obj.value;

      // Need to determine if this piece is a DOUBLE or not.
      // Droppable zones 6 & 8 are DOUBLE letter scores.
      var extra = score * should_double_triple_letter(given_id);
      score = score + extra;

      return score;
    }
  }

  // If we get here, then we weren't given a nice valid letter. >:(
  return -1;
}


/**
 *    Given a tile ID, figures out which dropID this is and whether to double the
 *    letter score or not.
 *    Returns:
 *    0 = neither
 *    1 = double
 *    2 = triple
 */
function should_double_triple_letter(given_id) {
  var space;

  for(var i = 0; i < game_board.length; i++) {
    if(game_board[i].tile == given_id){
      space = "#" + game_board[i].id;
    }
  }

  /*
      Using "hasClass" to detect if this is a double / triple space.
  */

  if ( $(space).hasClass("double_letter") == true ) {
    // Sweet! Double the letter's value!
    return 1;
  }
  else if ( $(space).hasClass("triple_letter") == true ) {
    // SWEET! IT'S A TRIPLE!
    return 2;
  }

  // Otherwise return 1.
  return 0;
}


/**
 *    This function gets the row / col index for given droppableID
 */
function find_table_position(droppableID) {

  // Figure out the row / col
  // URL: https://stackoverflow.com/questions/96428/how-do-i-split-a-string-breaking-at-a-particular-character
  var test = String(droppableID).split('_');
  var row = String(test[0]).split('row');
  row = row[1];
  var col = String(test[1]).split('col');
  col = col[1];

  var arry = [];      // Save the row / col in an array, so that we can return both at once.
  arry.push(row);
  arry.push(col);

  // Return the row / col in an array.
  return arry;
}


/**
 *    This function, given a piece ID will return which letter it represents.
 *
 *    parameters: an ID of a tile
 *       returns: the letter that tile represents. On error, returns "-1".
 */
function find_letter(given_id) {

  // Go through the 7 pieces,
  for(var i = 0; i < 7; i++) {
    // If we found the piece we're looking for, awesome!
    if(game_tiles[i].id == given_id) {
      // Just return its letter!
      return game_tiles[i].letter;
    }
  }

  // Or try looking in the completed word array
  for(var i = 0; i < complete_words.length; i++) {
    for(var x = 0; x < complete_words[i].length; x++) {
      if(given_id == complete_words[i][x].id) {
        return complete_words[i][x].letter;
      }
    }
  }

  // If we get here, we weren't given a nice draggable ID like "piece1", so return -1
  return -1;
}


/**
 *    This function generates a random tile for the load_scrabble_pieces() function and for
 *    swapping for a new tile.
 *    It returns the new letter that was generated.
 */
function get_random_tile() {
  // Need take into account that there are 100 tiles total, not just 26 options.
  // Going to create an array of all the possible letters then - 100 to start.
  var all_letters = [];
  var total_letters = 0;

  for (var i = 0; i < 26; i++) {
    var current_letter = pieces[i].letter;    // Get current letter, "A" to start
    var remaining = pieces[i].remaining;      // Remaining letters, "9" for A at the start.
    total_letters += remaining;               // Keep track of ALL the letters for the random call.

    for (var x = 0; x < remaining; x++) {
      all_letters.push(current_letter);       // Add "remaining" number of the current letter to the array.
    }
  }

  // Now all_letters should have 100 letters at the start (less while playing the game)
  // Pick a random number and return that letter.
  var random_num = getRandomInt(0, total_letters - 1);   // Off by one error if we don't subtract. 0 to 100 is bad. Want 0 to 99.
  var letter = all_letters[random_num];       // Save the letter.

  // Find the letter to decrement.
  for (var i = 0; i < 26; i++) {
    if (pieces[i].letter == letter) {
      pieces[i].remaining--;                  // Decrement letter remaining for this letter.
      return letter;                          // Return the letter's index.
    }
  }

  // Error if we get here.
  return -1;
}


/**
 *    This function confirms that the user wants to reset the entire game board.
 *    This function uses a cool alert replacement called Sweet Alert.
 *    URL: https://t4t5.github.io/sweetalert/
 */
function confirm_reset() {
  // Since the reset function is very destructive, we should confirm with the user if
  // they are SURE they want to clear the entire game board.
  swal({
    title: "Are you sure?",
    text: "This will clear the ENTIRE game board, reset your tiles and destroy \
    any words that were placed.\n Are you really sure you want to do this?",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Yes.",
    closeOnConfirm: true
    },
    // This is from the example page at: https://t4t5.github.io/sweetalert/
    // Basically I can quit if the user hits cancel, or continue if they hit Yes.
    function(isConfirm) {
      if (isConfirm) {
        reset_game_board();
        return false;
      }
      else {
        // Let the user know what's going on.
        $("#messages").html("<br><div class='highlight_centered_success'> \
        RESET BOARD CANCELED.</div>");
        return false;
      }
  });
}


/**
 *      This function resets the game board.
 *      It does so by reusing several functions:
 *      load_pieces_array()       -> resets the pieces array
 *      reset_tiles()             -> removes all the tiles on the screen.
 *      load_scrabble_pieces()    -> loads up new tiles.
 *      find_word()               -> resets what the word looked like.
 *
 *      It also removes all draggable tiles on the game board, and enables all droppable spaces.
 *      And it clears the game_board array and complete_words array.
 *
 */
function reset_game_board() {
  var word_count = complete_words.length;

  // First clear the game board array.
  game_board = [];    // Easy way of doing this.
  // URL for more ways of doing this: https://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript

  // Now reset the pieces array.
  load_pieces_array();

  // Set the score back to zero.
  word_score = 0;

  // Remove all the scrabble tiles in the rack.
  for(var i = 0; i < 7; i++) {
    var tileID = '#' + game_tiles[i].id;
    $(tileID).draggable("destroy");    // Destroys the draggable element.
    $(tileID).remove();                // Removes the tile from the page.
    // URL for more info: https://stackoverflow.com/questions/11452677/jqueryui-properly-removing-a-draggable-element
  }

  // Remove all the scrabble tiles on the game board.
  for(var i = 0; i < word_count; i++) {
    // Get the individual spaces to remove.
    for(var x = 0; x < complete_words[i].length; x++) {
      var space = complete_words[i][x].id;

      // Make the space droppable again.
      $("#" + space).droppable("enable");

      // Remove the tile attached to the space.
      $("#disabled" + (i + x)).remove();    // The i + x will access all of them, since i starts at 0.
    }
  }

  // Clear the complete word array.
  complete_words = [];

  // Load up some new Scrabble pieces!
  load_scrabble_pieces();

  // Resets the HTML "Word: " and "Score: " display.
  find_word();    // Technically this returns -1 and just wipes the display clean.

  // Update the "Letters Remaining" table.
  update_remaining_table();

  // Let the user know what's going on.
  $("#messages").html("<br><div class='highlight_centered_success'> \
  BOARD AND TILES RESET.<br>CHECK THE RACK FOR NEW TILES.</div>");

  // Now we're done! Woot!
  return;
}


/*
 *    This function will force all the tiles in the game_tiles array back into the rack.
 */
function reset_tiles() {
  // Let the user know what's going on.
  $("#messages").html("<br><div class='highlight_centered_success'> \
  MOVING ALL TILES BACK TO THE RACK.</div>");

  // Load up the 7 pieces and move them back to the game rack.
  for(var i = 0; i < 7; i++) {
    var piece_ID = "#piece" + i;

    // Reposition the tile on top of the rack, nicely in a row with the other tiles.

    // We first get the rack's location on the screen. Idea from a Stackoverflow post,
    // URL: https://stackoverflow.com/questions/885144/how-to-get-current-position-of-an-image-in-jquery
    var pos = $("#the_rack").position();

    // Now figure out where to reposition the board piece.

    var img_left = pos.left + 30 + (50 * i);      // This controls left to right placement.
    var img_top = pos.top + 30;                   // This controls top to bottom placement.

    // Move the piece relative to where the rack is located on the screen.
    $(piece_ID).css("left", img_left).css("top", img_top).css("position", "absolute");

    $('#rack').append($(piece_ID));
  }

  // Now delete everything in the game board array. Do this by just emptying the array.
  game_board = [];

  // Update the word that is displayed.
  find_word();

  // Done! Woot. That wasn't so hard, was it?
  return;
}


/**
 *    This function loads up the scrabble pieces onto the rack.
 *    It also makes each of them draggable and sets various properties, including
 *    the images location and class / ID.
 *
 *    the tile IDs are in the form "piece#", where # is between 1 and 7.
 *
 */
function load_scrabble_pieces() {
  // I'm so used to C++ that I like defining variables at the top of a function. *shrugs*
  var base_url = "img/scrabble/Scrabble_Tile_";    // base URL of the image
  var random_letter = "";                             // Random letter for the tile
  var piece = "";
  var piece_ID = "";
  var what_piece = "";

  // Load up 7 pieces
  for(var i = 0; i < 7; i++) {
    // This gets a random letter (letter's index in the array).
    random_letter = get_random_tile();

    // Make the img HTML and img ID so we can easily append the tiles.
    piece = "<img class='pieces' id='piece" + i + "' src='" + base_url + random_letter + ".jpg" + "'></img>";
    piece_ID = "#piece" + i;
    game_tiles[i].letter = random_letter;

    // Reposition the tile on top of the rack, nicely in a row with the other tiles.

    // We first get the rack's location on the screen. Idea from a Stackoverflow post,
    // URL: https://stackoverflow.com/questions/885144/how-to-get-current-position-of-an-image-in-jquery
    var pos = $("#the_rack").position();

    // Now figure out where to reposition the board piece.

    var img_left = pos.left + 30 + (50 * i);      // This controls left to right placement.
    var img_top = pos.top + 30;                   // This controls top to bottom placement.

    /* Load onto the page and make draggable.
       The height / width get set using these tricks:
       https://stackoverflow.com/questions/10863658/load-image-with-jquery-and-append-it-to-the-dom
       https://stackoverflow.com/questions/2183863/how-to-set-height-width-to-image-using-jquery
       https://stackoverflow.com/questions/9704087/jquery-add-image-at-specific-co-ordinates

       The relative stuff came from this w3schools page. I realized I could set the top and left
       relative to the rack (and the board for the droppable targets), which makes things wayyyyy
       easier. URL: http://www.w3schools.com/css/css_positioning.asp
    */
    // Add the piece to the screen
    $("#rack").append(piece);

    // Move the piece relative to where the rack is located on the screen.
    $(piece_ID).css("left", img_left).css("top", img_top).css("position", "absolute");

    // Make the piece draggable.
    $(piece_ID).draggable({
      appendTo: scrabble_board,
      revert: "invalid",            // This is key. Only the rack and game board are considered valid!
      start: function(ev, ui) {
        // Save original position. (used for swapping tiles)
        startPos = ui.helper.position();
      },
      stop: function() {
        // If an invalid event is found, this will return the draggable object to its
        // default "invalid" option. From this Stackoverflow post (also used in the droppable part.)
        $(this).draggable('option','revert','invalid');
      }
    });
  }
}


/**
 *    This function will load up targets for the images to be dropped onto.
 *    I figure they will be transparent images that are overlayed on top of
 *    the game board.
 *
 *    Note: this is the main logic behind the game. Other functions help this one out,
 *    but all rules for where a tile can be dropped come from this function.
 *
 */
function load_droppable_targets() {

  /**
   *    Logic for getting a new tile. User must drop the tile on the red "swap a tile" div.
   *    This function will then generate a new letter, set the source on the tile to the new
   *    letter and finally place the tile back to the original position before it was dropped.
   *
   */
  $("#get_new_tile").droppable( {
    accept: ".ui-draggable",
    appendTo: "body",
    drop: function(event, ui) {
      var draggableID = ui.draggable.attr("id");
      var droppableID = $(this).attr("id");

      // Let the user know what's going on.
      $("#messages").html("<br><div class='highlight_centered_success'> \
      Swapping old tile for a new one.<br> Check the rack / board for your new tile!</div>");

      // Generate a new tile (using get_random_tile() ) and remove the old tile.
      // Also add it back into the pieces array so it's a straight swap. (no loss of ties)

      // Get new letter. Also create a new image source that will be applied later.
      var new_letter = get_random_tile();

      // Put the old letter back.
      var old_letter = find_letter(draggableID);

      // Debugging
      console.log("draggableID = " + draggableID);
      console.log("Old letter = " + old_letter + " New letter = " + new_letter);

      // Go through the pieces array to find the letter we want to put back.
      // Basically put it back in the "bag" of letters
      for(var i = 0; i < 26; i++) {
        // If we found the letter we are trying to swap
        if(pieces[i].letter == old_letter) {
          pieces[i].remaining++;  // Then increment by one so it's back in the bag.
        }
      }

      // Now we can change the letter of the tile to the new letter.
      for(var i = 0; i < 7; i++) {
        if(game_tiles[i].id == draggableID) {       // Find the tile in the game tile array.
          game_tiles[i].letter = new_letter;        // Assign the new letter to the tile.
        }
      }

      // Update the tile piece with the new image.
      // The idea came from this post on Stackoverflow:
      // https://stackoverflow.com/questions/554273/changing-the-image-source-using-jquery
      // I had to modify this to work on different IDs, as simply "draggableID" did nothing.
      $("#" + draggableID).attr("src", "img/scrabble/Scrabble_Tile_" + new_letter + ".jpg");

      // Place the tile back where it came from, either the rack or the game board.
      var posX = startPos.left;
      var posY = startPos.top;

      // Move the draggable image so it doesn't fly around randomly like to the bottom of the screen or whatever.
      ui.draggable.css("left", posX);
      ui.draggable.css("top", posY);
      ui.draggable.css("position", "absolute");

      // Update the letter's remaining table
      update_remaining_table();

      // Update the word as well, in case the user changed the word.
      find_word();
    }

  });


  /**
   *      Rack logic. Positions the rack on page load. Recalling the tiles is handled by the reset_tiles function.
   *      Positioning is done using the ui.helper.position method which the jQuery UI provides.
   *
   *
   *
   */
  $("#the_rack").droppable( {
    accept: ".ui-draggable",
    appendTo: "body",
    drop: function(event, ui) {
      var draggableID = ui.draggable.attr("id");
      var droppableID = $(this).attr("id");

      // Get board array length. This will be useful for our checks next.
      var gameboard_length = game_board.length;

      // Need to check for complete words, if there's any then change some logic.
      var number_of_words = complete_words.length;

      // See if this element is in the array and at the beginning or end.
      for(var i = 0; i < gameboard_length; i++) {
        if (game_board[i].tile == draggableID) {
          console.log("Found the object to remove!");

          // Make the spot droppable again.
          var spot_id = "#" + game_board[i].id;
          $(spot_id).droppable("enable");

          // We found it! Remove it from the game board array.
          // URL for this help: https://stackoverflow.com/questions/5767325/remove-a-particular-element-from-an-array-in-javascript
          game_board.splice(i, 1);

          // Update the word & score.
          find_word();

          // This trick comes from Stackoverflow.
          // URL: https://stackoverflow.com/questions/849030/how-do-i-get-the-coordinate-position-after-using-jquery-drag-and-drop
          var currentPos = ui.helper.position();
          var posX = parseInt(currentPos.left);
          var posY = parseInt(currentPos.top);

          // Move the draggable image so it doesn't fly around randomly like to the bottom of the screen or whatever.
          ui.draggable.css("left", posX);
          ui.draggable.css("top", posY);
          ui.draggable.css("position", "absolute");

          // Move the tile over to the rack. Prevents weird bugs where the table changes sizes and thinks there's two tiles in one spot.
          $('#rack').append($(ui.draggable));

          // If there's any completed words, and we just hit 1 tile left, then
          // remove that tile, it's one of the disabled tiles.
          if(number_of_words > 0) {
            game_board.splice(0, 1);  // Remove disabled tile.
            find_word();              // Update word & score.
          }

          // Quit now.
          return;
        }
      }
    }
  });


  /**
   *    Scrabble game board logic. Allows swapping of tiles that are not saved,
   *    determines valid game moves for both one word and multiple words. One word
   *    logic works very well - multiple word logic is bound to have bugs due to
   *    the complexity of having many words on the board at once.
   *
   */
  $("#scrabble_board td").droppable({
    accept: ".ui-draggable",
    appendTo: "body",
    drop: function(event, ui) {
      // To figure out which draggable / droppable ID was activated, I used this sweet code from stackoverflow:
      // https://stackoverflow.com/questions/5562853/jquery-ui-get-id-of-droppable-element-when-dropped-an-item
      var draggableID = ui.draggable.attr("id");    // The current Scrabble tile ID
      var droppableID = $(this).attr("id");         // The current spot on the game board ID
      var duplicate = false;            // This originally meant "we've seen this tile already". I will need to use this to support swapping of tiles.
      var dup_index = 0;                // I think this was to be where in the game board array the duplicate is.
      //left_right                      // Determines if the word is read left to right, or top to bottom. (THIS IS GLOBAL, IT NEEDS TO BE FOR THE FIND_WORD FUNCTION!)
      var insert_beg = false;           // Determines if we should tiles at the beginning or the end.
      var star_spot = "row7_col7";      // Star in the middle of the board.
      var gameboard_length = 0;         // The length of the game board array (global array).
      var number_of_words = 0;          // Number of played words.
      var valid = 0;                    // Used for determining valid right angles.
      var prev_spaceID = "";            // Used for determining left/right vs up/down and also inserting at the beginning / end. And even saved letters.

      // Get board array length. This will be useful for our checks next.
      gameboard_length = game_board.length;

      // Also determine how many words are currently played.
      number_of_words = complete_words.length;

      // For debugging purposes.
      console.log("draggableID: " + draggableID );
      console.log("droppableID: " + droppableID );

      //*****************************************
      //* Swap a tile logic.
      //*****************************************
      // I use something similar to this Stackoverflow post but the selector is
      // different because of the newer version of jQuery UI (I think anyway, its an old post)
      // https://stackoverflow.com/questions/8751866/check-if-droppable-already-contains-another-draggable-element-jquery-ui
      if( $(this).find(".ui-draggable").length == 1 ) {
        // If so, just swap the two tiles. Make sure to update the game board array!
        console.log("Swapping the two tiles!");

        // Get the originally dropped tile, so we can change it's positions in a second.
        var original_tile = $("#" + droppableID).find("img")[0].id;
        console.log("Original tile is = " + original_tile);

        // startPos has the original position of the current droppable.
        var posX = startPos.left;
        var posY = startPos.top;

        // Set the position of the old tile.
        $("#" + original_tile).css("left", posX);
        $("#" + original_tile).css("top", posY);
        $("#" + original_tile).css("position", "absolute");

        // Move the tile over to the rack. Prevents weird bugs where the table changes sizes and thinks there's two tiles in one spot.
        $('#rack').append($("#" + original_tile));

        // Now put the new tile in the spot where the older tile was.
        // (ui.draggable refers to the current tile that we want to place on the board.)
        ui.draggable.css("top", $(this).css("top"));
        ui.draggable.css("left", $(this).css("left"));
        ui.draggable.css("position", "relative");

        // Append the new tile to the game board
        $(this).append($(ui.draggable));

        // Now update the game board array with the new letter.
        for(var i = 0; i < gameboard_length; i++) {
          if(game_board[i].tile == original_tile) {
            game_board[i].tile = draggableID;
          }
        }

        // Update the word
        find_word();

        // We're done so quit.
        return;
      }

      //*************************************************************************
      //* Logic for one word here
      //*************************************************************************
      if(number_of_words == 0) {
        //*****************************************
        //* See if this tile is already on the game board.
        //*****************************************
        for (var i = 0; i < gameboard_length; i++) {
          if (game_board[i].tile == draggableID) {
            // We've got a duplicate.
            console.log("Found a duplicate! ");
            duplicate = true;
            dup_index = i;      // Save the index for later.
          }
        }

        //*****************************************
        //* Game board is empty case.
        //* If so, the user must start at the star.
        //*****************************************
        if (gameboard_length == 0) {
          console.log("Must start at the star.");

          if (droppableID != star_spot) {
            /* The only valid place is the star, row7_col7 */
            $("#messages").html("<br><div class='highlight_centered_error'> \
            Please start at the star in the middle of the game board.</div>");

            // Force the draggable to revert. Idea from:
            // https://stackoverflow.com/questions/6071409/draggable-revert-if-outside-this-div-and-inside-of-other-draggables-using-both
            ui.draggable.draggable('option', 'revert', true);
            return;
          }
          else {
            // Remove that old error message.
            $("#messages").html("");
          }
        }

        //*****************************************
        //* Game board length 1 case, OR moving the 2nd tile around the first tile.
        //*****************************************
        if (gameboard_length == 1 || (gameboard_length == 2 && duplicate == true) ) {
          console.log("Diagonals are not allowed.");
          /*  Disable diagonal placement.
              Example:

              X*X
              *+*
              X*X

              X = not allowed
              * = allowed
              + = current location
          */

          // If we get here, we should determine what the index is of our current
          // tile. Then we can use some math to determine what moves are allowed.
          var past_pos = find_table_position(game_board[0].id);
          var cur_pos = find_table_position(droppableID);

          // Debugging
          console.log("Past pos = " + past_pos + " Proposed position: " + cur_pos);

          /*  If this was 7,7 then the allowed positions would be:

              (6,7) & (8,7) => allowed, left to right read.
              (7,6) & (7,8) => allowed, top to bottom read.

              this could be written as past_pos needing to be equal to:
              (cur_pos[0] - 1, cur_pos[1]) & (cur_pos[0] + 1, cur_pos[1])   -> l/r
              or
              (cur_pos[0], cur_pos[1] - 1) & (cur_pos[0], cur_pos[1] + 1)   -> t/b
          */
          allowed_arrays = [
            [ parseInt(past_pos[0]) - 1, past_pos[1] ],     // these two are l / r
            [ parseInt(past_pos[0]) + 1, past_pos[1] ],
            [ past_pos[0], parseInt(past_pos[1]) - 1],     // these two are t / b
            [ past_pos[0], parseInt(past_pos[1]) + 1]
          ];

          // Debugging
          console.log("allowed positions are: " + allowed_arrays[0] + ' & ' + allowed_arrays[1] + ' & ' + allowed_arrays[2] + ' & ' + allowed_arrays[3]);

          // See if we have one of the allowed positions.
          var test = cur_pos.toString();

          if (test == allowed_arrays[0].toString() || test == allowed_arrays[1].toString() ) {
            // Yeah! And it's top to bottom!
            console.log("Allowed. T/B");
            left_right = false;

            // Need to insert at the front if we're inserting at the top.
            if (test == allowed_arrays[0].toString()) {
              console.log("Inserting at the beginning of the game board array.");
              insert_beg = true;
            }
          }
          else if (test == allowed_arrays[2].toString() || test == allowed_arrays[3].toString() ) {
            // Yep! And it's left to right too!
            console.log("Allowed. L/R");
            left_right = true;

            // Need to insert at the front if we're inserting from the left.
            if (test == allowed_arrays[2].toString()) {
              insert_beg = true;
            }
          }
          else {
            console.log("NOT ALLOWED. >:(");

            // Tell the user what the error was.
            $("#messages").html("<br><div class='highlight_centered_error'> \
            Sorry, diagonals are not allowed once at least one tile has been placed.</div>");

            // Force the draggable to revert. Idea from:
            // https://stackoverflow.com/questions/6071409/draggable-revert-if-outside-this-div-and-inside-of-other-draggables-using-both
            ui.draggable.draggable('option', 'revert', true);
            return;
          }

        }

        if (gameboard_length >= 2) {
          // Now there should only be up and down placement.
          console.log("Only up and down should be allowed.");

          /*
              X+X
              X*X
              X*X
              X+X

              * = the first / second tiles
              + = valid space
              X = NOT VALID SPACE

              Assuming (7,7) & (8,7) are already placed, then two valid places are
              (6,7) & (9,7)
          */
          if (left_right == true) {
            // First col - 1 and last col + 1 are valid, with same row.
            var valid_left = find_table_position(game_board[0].id);
            var valid_right = find_table_position(game_board[gameboard_length - 1].id);
            var cur_pos = find_table_position(droppableID);

            // Add or subtract for the valid position.
            valid_left[1] = parseInt(valid_left[1]) - 1;
            valid_right[1] = parseInt(valid_right[1]) + 1;

            // Debugging
            console.log("Valid left pos = " + valid_left + " Valid right position: " + valid_right + " Proposed position: " + cur_pos);

            var test = cur_pos.toString();

            // See if this is a valid move!
            if ( test == valid_left.toString() || test == valid_right.toString() ) {
              if( test == valid_left.toString() ) {
                insert_beg = true;
              }

              // Yes! It is allowed!
              console.log("Allowed. L/R. Game board length = " + gameboard_length);
            }
            else {
              // Not allowed.
              console.log("NOT Allowed. L/R. Game board length = " + gameboard_length);

              // Tell the user what the error was.
              $("#messages").html("<br><div class='highlight_centered_error'> \
              Sorry, only left and right placements are allowed.</div>");

              // Force the draggable to revert. Idea from:
              // https://stackoverflow.com/questions/6071409/draggable-revert-if-outside-this-div-and-inside-of-other-draggables-using-both
              ui.draggable.draggable('option', 'revert', true);
              return;
            }
          }
          else {
            // First row - 1 and last row + 1 are valid, with same col.
            var valid_top = find_table_position(game_board[0].id);
            var valid_bottom = find_table_position(game_board[gameboard_length - 1].id);
            var cur_pos = find_table_position(droppableID);

            // Add or subtract for the valid position.
            valid_top[0] = parseInt(valid_top[0]) - 1;
            valid_bottom[0] = parseInt(valid_bottom[0]) + 1;

            // Debugging
            console.log("Valid top pos = " + valid_top + " Valid bottom position: " + valid_bottom + " Proposed position: " + cur_pos);

            var test = cur_pos.toString();

            // See if this is a valid move!
            if ( test == valid_top.toString() || test == valid_bottom.toString() ) {
              if (test == valid_top.toString()) {
                insert_beg = true;
              }

              // Yes! It is allowed!
              console.log("Allowed. T/B. Game board length = " + gameboard_length);
            }
            else {
              // Not allowed.
              console.log("NOT Allowed. T/B. Game board length = " + gameboard_length);

              // Tell the user what the error was.
              $("#messages").html("<br><div class='highlight_centered_error'> \
              That wasn't a valid move.</div>");

              // Force the draggable to revert. Idea from:
              // https://stackoverflow.com/questions/6071409/draggable-revert-if-outside-this-div-and-inside-of-other-draggables-using-both
              ui.draggable.draggable('option', 'revert', true);
              return;
            }
          }
        }
      }
      //*************************************************************************
      //* Logic for more than one word here
      //*************************************************************************
      else {
        // Need to first determine all the possible valid moves.
        // This will be an array of IDs that are right angles around
        // the game board tiles (both saved and unsaved words)
        var possible_moves = [];

        // We will first determine valid spaces to move to around saved words.

        // First, go through all the words
        for(var i = 0; i < number_of_words; i++) {
          // Get number of tiles in the current word.
          var num_tiles = complete_words[i].length;

          // Debugging
          console.log("Number of tiles for this word: " + num_tiles);

          // Now go through the current word and grab all right angle spaces around each letter.
          // Make sure to ignore DISABLED spaces.
          for(var x = 0; x < num_tiles; x++) {
            var cur_letterID = complete_words[i][x].id;
            var coordinates = find_table_position(cur_letterID);    // Get the row / col values.

            console.log("cur_letterID = " + cur_letterID + " coordinates = " + coordinates);

            // Logic works like this:
            /*
                X*X
                *+*
                X*X

                + = current position to look at
                * = valid spots, l/r = row(-1),col & row(+1),col + t/b = row,col(-1) & row,col(+1)
                X = not valid spot
            */
            // Allow both left/right & top/bottom placement.
            if(gameboard_length < 1) {
              valid = [
                "row" + (parseInt(coordinates[0]) - 1) + "_col" + coordinates[1],     // top of space
                "row" + (parseInt(coordinates[0]) + 1) + "_col" + coordinates[1],      // bottom of space
                "row" + (coordinates[0]) + "_col" + (parseInt(coordinates[1]) - 1),   // left of space
                "row" + (coordinates[0]) + "_col" + (parseInt(coordinates[1]) + 1)    // right of space
              ];
            }
            // Only allow left to right spaces.
            else if(gameboard_length >= 1 && left_right == true) {
              valid = [
                "row" + (coordinates[0]) + "_col" + (parseInt(coordinates[1]) - 1),   // left of space
                "row" + (coordinates[0]) + "_col" + (parseInt(coordinates[1]) + 1)    // right of space
              ];
            }
            // Only allow top to bottom spaces.
            else if(gameboard_length >= 1 && left_right == false) {
              valid = [
                "row" + (parseInt(coordinates[0]) - 1) + "_col" + coordinates[1],     // top of space
                "row" + (parseInt(coordinates[0]) + 1) + "_col" + coordinates[1]      // bottom of space
              ];
            }

            // Debugging
            console.log("Valid array = " + valid);

            // Make sure each space is not disabled, and not in the possible moves array already.
            if(gameboard_length == 0) {
              for(y = 0; y < 4; y++) {
                // See if we find our space.
                if(String(valid[y]) == String(droppableID)) {
                  // We did! Save this ID then.
                  prev_spaceID = cur_letterID;
                }
                possible_moves.push(String(valid[y]));
              }
            }
            else {
              for(y = 0; y < 2; y++) {
                // See if we find our space.
                if(String(valid[y]) == String(droppableID)) {
                  // We did! Save this ID then.
                  prev_spaceID = cur_letterID;
                }
                possible_moves.push(String(valid[y]));
              }
            }
          }
        }

        // Debugging
        console.log("Possible moves = " + possible_moves);

        // Now let's look at spaces around the game board.
        for(var i = 0; i < gameboard_length; i++) {
          var cur_letterID = game_board[i].id;
          var coordinates = find_table_position(cur_letterID);    // Get the row / col values.

          // Logic works like this:
          /*
              X*X
              *+*
              X*X

              + = current position to look at
              * = valid spots, l/r = row(-1),col & row(+1),col + t/b = row,col(-1) & row,col(+1)
              X = not valid spot
          */
          // Allow both left/right & top/bottom placement.
          if(gameboard_length < 1) {
            valid = [
              "row" + (parseInt(coordinates[0]) - 1) + "_col" + coordinates[1],     // top of space
              "row" + (parseInt(coordinates[0]) + 1) + "_col" + coordinates[1],      // bottom of space
              "row" + (coordinates[0]) + "_col" + (parseInt(coordinates[1]) - 1),   // left of space
              "row" + (coordinates[0]) + "_col" + (parseInt(coordinates[1]) + 1)    // right of space
            ];
          }
          // Only allow left to right spaces.
          else if(gameboard_length >= 1 && left_right == true) {
            valid = [
              "row" + (coordinates[0]) + "_col" + (parseInt(coordinates[1]) - 1),   // left of space
              "row" + (coordinates[0]) + "_col" + (parseInt(coordinates[1]) + 1)    // right of space
            ];
          }
          // Only allow top to bottom spaces.
          else if(gameboard_length >= 1 && left_right == false) {
            valid = [
              "row" + (parseInt(coordinates[0]) - 1) + "_col" + coordinates[1],     // top of space
              "row" + (parseInt(coordinates[0]) + 1) + "_col" + coordinates[1]      // bottom of space
            ];
          }

          // Make sure each space is not disabled, and not in the possible moves array already.
          // URL for the droppable disabled: https://api.jqueryui.com/droppable/#option-disabled
          // URL for the $.inArray function: https://stackoverflow.com/questions/6116474/how-to-find-if-an-array-contains-a-specific-string-in-javascript-jquery
          if(gameboard_length == 0) {
            for(y = 0; y < 4; y++) {
              // See if we find our space.
              if(String(valid[y]) == droppableID) {
                // We did! Save this ID then.
                prev_spaceID = cur_letterID;
              }
              possible_moves.push(String(valid[y]));
            }
          }
          else {
            for(y = 0; y < 2; y++) {
              // See if we find our space.
              if(String(valid[y]) == droppableID) {
                // We did! Save this ID then.
                prev_spaceID = cur_letterID;
              }

              possible_moves.push(String(valid[y]));
            }
          }
        }

        // Debugging
        console.log("Possible moves = " + possible_moves);

        // Now see if the given spot the user tried to drop in is in the valid list.
        // Got the idea for this from Stackoverflow. This little JS code will return -1 if the array does
        // not contain the current droppable target, or the index if it does. We just need to check for -1.
        // https://stackoverflow.com/questions/12623272/how-to-check-if-a-string-array-contains-one-string-in-javascript
        var is_valid = possible_moves.indexOf(droppableID);

        // It is a valid move if is_valid isn't -1.
        if(is_valid != -1) {
          console.log("VALID MOVE.");
          $("#messages").html("");

          var past_row, past_col;
          var new_row, new_col;

          var tmp_pos = find_table_position(droppableID);
          new_row = parseInt(tmp_pos[0]);
          new_col = parseInt(tmp_pos[1]);

          console.log("past ID = " + prev_spaceID);

          tmp_pos = find_table_position(prev_spaceID);
          past_row = parseInt(tmp_pos[0]);
          past_col = parseInt(tmp_pos[1]);

          console.log("new = " + new_row + ", " + new_col);
          console.log("past = " + past_row + ", " + past_col);

          // Determine if we are going left to right or top to bottom.
          if(gameboard_length == 0) {
            if(past_row == new_row) {
              left_right = true;        // Yep the rows are the same, so it's left to right.

              console.log("This is left to right.");
            }
            else {
              left_right = false;       // Nope, rows are different, it's top to bottom.

              console.log("This is top to bottom.");
            }
          }

          // Determine if we should insert at the beginning or the end.
          if(left_right == true) {
            // For left to right, see if new_col > past_col
            if(new_col <= past_col) {  // True case
              insert_beg = true;

              console.log("Insert at the beginning L/R");
            }
            else if (new_col < past_col) {                    // False case
              insert_beg = false;

              console.log("Insert at the end. L/R");
            }
          }
          else if (left_right == false) {
            // For top to bottom, see if new_row < past_row
            if(new_row <= past_row) {
              insert_beg = true;

              console.log("Insert at the beginning T/B");
            }
            else if (new_row > past_row) {
              insert_beg = false;

              console.log("Insert at the end. T/B");
            }
          }

          // Determine if the prev space should be added to the game board array.
          if(gameboard_length == 0) {
            var tmp_obj = {};
            tmp_obj['id'] = prev_spaceID;          // This style works as an object.
            tmp_obj['tile'] = prev_spaceID;
            game_board.push(tmp_obj);
          }
        }
        else {
          console.log("NOT A VALID MOVE.");
          $("#messages").html("<br><div class='highlight_centered_error'> \
          That wasn't a valid move. Tiles must be placed at right angles.</div>");

          // Force the draggable to revert. Idea from:
          // https://stackoverflow.com/questions/6071409/draggable-revert-if-outside-this-div-and-inside-of-other-draggables-using-both
          ui.draggable.draggable('option', 'revert', true);
          return;
        }
      }

      //**********************************
      //* IF WE GET HERE, this is valid. *
      //**********************************

      // Add the current items to the game board array.
      // Style should be like: {"id": "drop0",  "tile": "pieceX"},
      var obj = {};
      obj['id'] = droppableID;          // This style works as an object.
      obj['tile'] = draggableID;

      // If it's a duplicate, just move it.
      if (duplicate == true) {
        if (insert_beg == false) {
          // remove then add it back at the end.
          game_board.splice(dup_index, 1);
          game_board.push(obj);
        }
        else{
          // remove then add it back at the beginning.
          game_board.splice(dup_index, 1);
          game_board.unshift(obj);
        }
      }

      // Don't add duplicates to the array again!
      if (duplicate == false) {
        if (insert_beg == false) {
          // Push back to the game board array.
          game_board.push(obj);
        }
        else {
          // Push to the front of the game board array.
          game_board.unshift(obj);    // URL for info: https://stackoverflow.com/questions/8159524/javascript-pushing-element-at-the-beginning-of-an-array
        }

      }

      // Recalculate this.
      gameboard_length = game_board.length;

      // This from Stackoverflow, it snaps to where it was dropped.
      // URL: https://stackoverflow.com/questions/30122234/how-to-make-an-accept-condition-for-droppable-td-to-accept-only-the-class-within
      $(this).append($(ui.draggable));
      ui.draggable.css("top", $(this).css("top"));
      ui.draggable.css("left", $(this).css("left"));
      ui.draggable.css("position", "relative");

      // Update the word as it stands now.
      find_word();
    },
    zIndex: -1
  });
}


/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 *
 * I did not originally write this, it is from this Stackoverflow post:
 * URL: https://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
