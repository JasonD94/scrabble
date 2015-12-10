/*
    File: ~/js/scrabble/buttons.js
    91.461 Assignment 9: Implementing a Bit of Scrabble with Drag-and-Drop
    Jason Downing - student at UMass Lowell in 91.461 GUI Programming I
    Contact: jdowning@cs.uml.edu or jason_downing@student.uml.edu
    MIT Licensed - see http://opensource.org/licenses/MIT for details.
    Anyone may freely use this code. Just don't sue me if it breaks stuff.
    Created: Nov 24, 2015.
    Last Updated: Dec 8, 9PM.

    This JavaScript file is for the 9th assignment, "Scrabble".

    This file contains functions that run when one of the three buttons are pressed.
    These include:

    Submit word -> runs check word function that sees if the word is valid;
                     NO ->  it prints an error message to the screen.
                    YES ->  it prints a success message and adds another button
                            for saving the word and playing another.

    Recall tiles -> runs a function to return all currently played tiles to the rack.
                    SAVED WORDS ARE NOT RETURNED, SEE "RESET BOARD" BUTTON

    Reset Board -> runs a function to confirm if the user wants to reset the board.
                     NO ->  cancels the reset so nothing happens.
                    YES ->  resets the entire game board, returning all tiles to the
                            "bag" and resetting the score / word.
*/


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

  // Reset the used letters counter.
  used_letters = 0;

  // Update the word that is displayed.
  find_word();

  // Done! Woot. That wasn't so hard, was it?
  return;
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

  // Reset the used letters counter.
  used_letters = 0;

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
