/*
    File: ~/js/scrabble/util.js
    91.461 Assignment 9: Implementing a Bit of Scrabble with Drag-and-Drop
    Jason Downing - student at UMass Lowell in 91.461 GUI Programming I
    Contact: jdowning@cs.uml.edu or jason_downing@student.uml.edu
    MIT Licensed - see http://opensource.org/licenses/MIT for details.
    Anyone may freely use this code. Just don't sue me if it breaks stuff.
    Created: Nov 24, 2015.
    Last Updated: Dec 8, 9PM.

    This JavaScript file is for the 9th assignment, "Scrabble".

    This file contains any utility functions for the other JS files.
*/


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
    if (x > 25) {   // hack to make Blank show "2".
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
      if (x > 25) {
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
