/*
    File: ~/js/scrabble/droppable.js
    91.461 Assignment 9: Implementing a Bit of Scrabble with Drag-and-Drop
    Jason Downing - student at UMass Lowell in 91.461 GUI Programming I
    Contact: jdowning@cs.uml.edu or jason_downing@student.uml.edu
    MIT Licensed - see http://opensource.org/licenses/MIT for details.
    Anyone may freely use this code. Just don't sue me if it breaks stuff.
    Created: Nov 24, 2015.
    Last Updated: Dec 9, 4PM.

    This JavaScript file is for the 9th assignment, "Scrabble".

    This file contains the droppable code. This basically controls almost all of
    the Scrabble game logic. It uses other functions, such as the score / util,
    even draggable / buttons / variables files. Basically everything connects to
    this file.

    It is also VERY badly done. It needs to be separated out into more functions
    that would make it much easier to read.
*/


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
      console.log("Entering $(\"#get_new_tile\").droppable()");
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
   *      Rack logic. Positions the rack on page load.
   *      Recalling the tiles is handled by the reset_tiles function.
   *      Positioning is done using the ui.helper.position method which the jQuery UI provides.
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

          // Make the spot droppable again.
          var spot_id = "#" + game_board[i].id;
          $(spot_id).droppable("enable");

          // We found it! Remove it from the game board array.
          // URL for this help: https://stackoverflow.com/questions/5767325/remove-a-particular-element-from-an-array-in-javascript
          game_board.splice(i, 1);

          find_word();            // Update the word & score.

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

          // If there's any completed words, and we just removed the last currently played word,
          // we need to remove any disabled tiles from the word array.
          if(number_of_words > 0) {

            // See if its time to remove these letters.
            if(gameboard_length - 1 <= used_letters) {        // Yep, the length is at or below the user_letters
              // Remove disabled tiles.
              game_board.splice(0, gameboard_length);

              // Reset the used_letters counter.
              used_letters = 0;
            }
          }

          find_word();              // Update word & score.
          return;                   // Quit now.
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

      // Remove old error messages.
      $("#messages").html("");

      // Get board array length. This will be useful for our checks next.
      gameboard_length = game_board.length;

      // Also determine how many words are currently played.
      number_of_words = complete_words.length;

      // For debugging purposes.
      console.log("Entering: $(\"#scrabble_board td\").droppable()");
      console.log("draggableID: " + draggableID );
      console.log("droppableID: " + droppableID );

      //*****************************************
      //* See if this tile is already on the game board.
      //*****************************************
      for (var i = 0; i < gameboard_length; i++) {
        if (game_board[i].tile == draggableID) {
          duplicate = true;       // We've got a duplicate.
          dup_index = i;          // Save the index for later.
        }
      }

      // If it's a duplicate, don't allow it to be moved. The user will need to
      // bring the tile back to the rack; other wise the game board word could become
      // messed up. This will prevent many of the multiple word errors.
      if (duplicate == true) {
          $("#messages").html("<br><div class='highlight_centered_error'> \
          Sorry, tiles that are already placed on the board cannot be moved. \
          You will need to return the tile to the rack to move it. \
          You are also allowed to swap two tiles by dropping a new tile on top of a \
          currently played tile.</div>");

          // Force the draggable to revert. Idea from:
          // https://stackoverflow.com/questions/6071409/draggable-revert-if-outside-this-div-and-inside-of-other-draggables-using-both
          ui.draggable.draggable('option', 'revert', true);
          return;
      }

      //*****************************************
      //* Swap a tile logic.
      //*****************************************
      // I use something similar to this Stackoverflow post but the selector is
      // different because of the newer version of jQuery UI (I think anyway, its an old post)
      // https://stackoverflow.com/questions/8751866/check-if-droppable-already-contains-another-draggable-element-jquery-ui
      if( $(this).find(".ui-draggable").length == 1 ) {
        // If so, just swap the two tiles. Make sure to update the game board array!
        // Get the originally dropped tile, so we can change it's positions in a second.
        var original_tile = $("#" + droppableID).find("img")[0].id;

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

        find_word();        // Update the word
        return;             // We're done so quit.
      }

      //*************************************************************************
      //* Logic for one word here
      //*************************************************************************
      if(number_of_words == 0) {
        //*****************************************
        //* Game board is empty case.
        //* If so, the user must start at the star.
        //*****************************************
        if (gameboard_length == 0) {
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
            $("#messages").html("");      // Remove that old error message.
          }
        }

        //*****************************************
        //* Game board length 1 case, OR moving the 2nd tile around the first tile.
        //*****************************************
        if (gameboard_length == 1 || (gameboard_length == 2 && duplicate == true) ) {
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
              console.log("Inserting at the beginning of the game board array.");
              insert_beg = true;
            }
          }
          else {
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
          /*
              X+X
              X*X
              X*X
              X+X

              * = the first / second tiles
              + = valid space
              X = NOT VALID SPACE

              Assuming (7,7) & (8,7) are already placed,
              then two valid places are (6,7) & (9,7)
          */
          if (left_right == true) {     // **** Left and right case   ****
            // First col - 1 and last col + 1 are valid, with same row.
            var valid_left = find_table_position(game_board[0].id);
            var valid_right = find_table_position(game_board[gameboard_length - 1].id);
            var cur_pos = find_table_position(droppableID);

            // Add or subtract for the valid position.
            valid_left[1] = parseInt(valid_left[1]) - 1;
            valid_right[1] = parseInt(valid_right[1]) + 1;

            var test = cur_pos.toString();      // Test against the current position.

            // See if this is a valid move!
            if ( test == valid_left.toString() || test == valid_right.toString() ) {
              // Yes! It is allowed!
              console.log("Allowed. L/R. Game board length = " + gameboard_length);

              if( test == valid_left.toString() ) {
                insert_beg = true;
              }
            }
            else {                // Not allowed.
              // Tell the user what the error was.
              $("#messages").html("<br><div class='highlight_centered_error'> \
              Sorry, only left and right placements are allowed when 2 or more tiles are played.</div>");

              // Force the draggable to revert. Idea from:
              // https://stackoverflow.com/questions/6071409/draggable-revert-if-outside-this-div-and-inside-of-other-draggables-using-both
              ui.draggable.draggable('option', 'revert', true);
              return;
            }
          }
          else {                          // **** Top and bottom case.    *****
            // First row - 1 and last row + 1 are valid, with same col.
            var valid_top = find_table_position(game_board[0].id);
            var valid_bottom = find_table_position(game_board[gameboard_length - 1].id);
            var cur_pos = find_table_position(droppableID);

            // Add or subtract for the valid position.
            valid_top[0] = parseInt(valid_top[0]) - 1;
            valid_bottom[0] = parseInt(valid_bottom[0]) + 1;

            var test = cur_pos.toString();      // Test against the current position.

            // See if this is a valid move!
            if ( test == valid_top.toString() || test == valid_bottom.toString() ) {
              // Yes! It is allowed!
              console.log("Allowed. T/B. Game board length = " + gameboard_length);

              if (test == valid_top.toString()) {
                insert_beg = true;
              }
            }
            else {                 // Not allowed.
              // Tell the user what the error was.
              $("#messages").html("<br><div class='highlight_centered_error'> \
              Sorry, only up and down positions are allowed when 2 or more tiles are played.</div>");

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

        //************************************************************
        //* Scan COMPLETED WORDS array for possible valid placement
        //************************************************************
        for(var i = 0; i < number_of_words; i++) {
          // Get number of tiles in the current word.
          var num_tiles = complete_words[i].length;

          // Now go through the current word and grab all right angle spaces around each letter.
          // Make sure to ignore DISABLED spaces.
          for(var x = 0; x < num_tiles; x++) {
            var cur_letterID = complete_words[i][x].id;
            var coordinates = find_table_position(cur_letterID);    // Get the row / col values.

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
                "row" + (parseInt(coordinates[0]) + 1) + "_col" + coordinates[1],     // bottom of space
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

              // Make sure we stay in the same row.
              var test_spaceID = game_board[0];
              var test_coord = find_table_position(test_spaceID);

              // Row is [0], so if these are the same, we're good.
              if (test_coord[0] == valid[0]) {
                // valid
              }
              // Not valid otherwise.
              else {
                valid = [];   // make it null so it won't match.
              }
            }
            // Only allow top to bottom spaces.
            else if(gameboard_length >= 1 && left_right == false) {
              valid = [
                "row" + (parseInt(coordinates[0]) - 1) + "_col" + coordinates[1],     // top of space
                "row" + (parseInt(coordinates[0]) + 1) + "_col" + coordinates[1]      // bottom of space
              ];

              // Make sure to stay in the same column.
              var test_spaceID = game_board[0];
              var test_coord = find_table_position(test_spaceID);

              // Col is [1], so if these are the same, we're good.
              if (test_coord[1] != valid[1]) {
                valid = [];   // Not valid. Make it null so it won't match.
              }               // Note, no need for else since else does nothing in this case.
            }

            // Make sure each space is not disabled, and not in the possible moves array already.
            if(gameboard_length == 0) {
              for(y = 0; y < 4; y++) {
                // See if we find our space.
                if(String(valid[y]) == String(droppableID)) {
                  prev_spaceID = cur_letterID;      // We did! Save this ID then.
                }
                possible_moves.push(String(valid[y]));
              }
            }
            else {
              for(y = 0; y < 2; y++) {
                // See if we find our space.
                if(String(valid[y]) == String(droppableID)) {
                  prev_spaceID = cur_letterID;      // We did! Save this ID then.
                }
                possible_moves.push(String(valid[y]));
              }
            }
          }
        }

        //************************************************************
        //* Scan the currently placed word for possible moves.
        //************************************************************
        for(var i = 0; i < gameboard_length; i++) {
          var cur_letterID = game_board[i].id;
          var coordinates = find_table_position(cur_letterID);    // Get the row / col values.

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
              if(String(valid[y]) == droppableID) { // See if we find our space.
                prev_spaceID = cur_letterID;        // We did! Save this ID then.
              }
              possible_moves.push(String(valid[y]));
            }
          }
          else {
            for(y = 0; y < 2; y++) {
              if(String(valid[y]) == droppableID) { // See if we find our space.
                prev_spaceID = cur_letterID;        // We did! Save this ID then.
              }
              possible_moves.push(String(valid[y]));
            }
          }
        }

        // Now see if the given spot the user tried to drop in is in the valid list.
        // Got the idea for this from Stackoverflow. This little JS code will return -1 if the array does
        // not contain the current droppable target, or the index if it does. We just need to check for -1.
        // https://stackoverflow.com/questions/12623272/how-to-check-if-a-string-array-contains-one-string-in-javascript
        var is_valid = possible_moves.indexOf(droppableID);

        // It is a valid move if is_valid isn't -1.
        if(is_valid != -1) {
          $("#messages").html("");      // Valid move, so erase the last error message.

          var past_row, past_col;       // Need to get last position and current position.
          var new_row, new_col;         // Last is basically the tile immediately next to the tile we placed.
                                        // Say we added an "S" to the end of "Home", the "e" in "Home" would be the last position.
          var tmp_pos = find_table_position(droppableID);
          new_row = parseInt(tmp_pos[0]);
          new_col = parseInt(tmp_pos[1]);

          tmp_pos = find_table_position(prev_spaceID);
          past_row = parseInt(tmp_pos[0]);
          past_col = parseInt(tmp_pos[1]);

          // Determine if we are going left to right or top to bottom.
          if(gameboard_length == 0) {
            if(past_row == new_row) {
              left_right = true;        // Yep the rows are the same, so it's left to right.
            }
            else {
              left_right = false;       // Nope, rows are different, it's top to bottom.
            }
          }

          // Determine if we should insert at the beginning or the end.
          if(left_right == true) {                            // Left to right check.
            if(new_col <= past_col) {                         // YES
              insert_beg = true;
            }
            else if (new_col < past_col) {                    // NO
              insert_beg = false;
            }
          }
          else if (left_right == false) {                     // Must be Up/Down
            if(new_row <= past_row) {                         // YES
              insert_beg = true;
            }
            else if (new_row > past_row) {                    // NO
              insert_beg = false;
            }
          }

          // Determine if the prev space should be added to the game board array.
          if(gameboard_length == 0) {
            // Go up or down to grab the entire previous word.
            // Current space is: droppableID
            if(left_right == true) {         // All the way to the left.
              // Need to go left and see if we find any disabled spaces.
              // We know this row is: new_row

              // Var to determine when to stop checking words.
              var test_word = true;

              // Go all the way to the left or right.
              var col_index = parseInt(new_col);          // Index for the column.

              if(insert_beg != true) {
                col_index = new_col - 1;                  // Start going to the left.
              }
              else {
                col_index = new_col + 1;                  // Start going to the right.
              }

              // While there's a letter to add, keep adding.
              // Once test_word is false, we stop adding letters to the array.
              while(test_word == true) {
                var row_pos = new_row;                  // Row position stays constant.
                var col_pos = col_index;                // Column must change.

                // See if this a valid disabled space.
                var test_cord = "row" + row_pos + "_col" + col_pos;

                // If this is a valid disabled space, sweet! Add it to the array!
                if(find_letter(test_cord) != -1 && test_word == true) {
                  // Create an object to add.
                  var tmp_obj = {};
                  tmp_obj['id'] = test_cord;          // This style works as an object.
                  tmp_obj['tile'] = test_cord;

                  // Do we insert at the beginning or the end?
                  if(insert_beg != true) {          // No! Beginning!
                    game_board.unshift(tmp_obj);
                    col_index--;
                  }
                  else {                            // Yes, the end!
                    game_board.push(tmp_obj);
                    col_index++;
                  }

                  used_letters++;                   // Keep track of used letters.
                }
                else {
                  // Time to break. This prevents reading the entire row and adding silly letters.
                  test_word = false;
                }
              }
            }
            else {                                // Up / Down case
              // Need to go up and see if we find any disabled spaces.
              // We know this col is: new_col

              // Var to determine when to stop checking words.
              var test_word = true;

              // Go all the way to the left or right.
              var row_index = parseInt(new_row);          // Index for the row.

              if(insert_beg != true) {
                row_index = new_row - 1;                  // Start going up.
              }
              else {
                row_index = new_row + 1;                  // Start going down.
              }

              // While there's a letter to add, keep adding.
              // Once test_word is false, we stop adding letters to the array.
              while(test_word == true) {
                var row_pos = row_index;                  // Row must change.
                var col_pos = new_col;                    // Column position stays constant.

                // See if this a valid disabled space.
                var test_cord = "row" + row_pos + "_col" + col_pos;

                // If this is a valid disabled space, sweet! Add it to the array!
                if(find_letter(test_cord) != -1 && test_word == true) {
                  // Create an object to add.
                  var tmp_obj = {};
                  tmp_obj['id'] = test_cord;          // This style works as an object.
                  tmp_obj['tile'] = test_cord;

                  // Do we insert at the beginning or the end?
                  if(insert_beg != true) {            // No! Beginning!
                    game_board.unshift(tmp_obj);
                    row_index--;
                  }
                  else {                              // Yes, the end!
                    game_board.push(tmp_obj);
                    row_index++;
                  }

                  used_letters++;                  // Keep track of used letters.
                }
                else {
                  // Time to break. This prevents reading the entire row and adding silly letters.
                  test_word = false;
                }
              }
            }
          }
        }
        //*******************************************
        //* If we get here, it wasn't a valid move. *
        //*******************************************
        else {
          $("#messages").html("<br><div class='highlight_centered_error'> \
          Sorry, that wasn't a valid move. Tiles must be placed at right angles, as diagonals are not allowed.</div>");

          // Alert users to restrictions on row / columns.
          // If the game board length is 0, then any placement around tiles is fine. So the above message is completely valid.
          // However, when the game board greater than 0, the user must stay in the same column or row.
          if(gameboard_length > 0) {
            // Check for left / right to provide the most accurate error message.
            if(left_right == true) {
              $("#messages").html("<br><div class='highlight_centered_error'> \
              Sorry, that wasn't a valid move. Tiles must be placed on the same row (left / right) after one tile has been placed on a row.</div>");
            }
            // Must be top / down, so provide that error message.
            else {
              $("#messages").html("<br><div class='highlight_centered_error'> \
              Sorry, that wasn't a valid move. Tiles must be placed on the same column (top / down) after one tile has been placed on a column.</div>");
            }
          }

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

      // This part adds the currently placed tile to the game_board array, which
      // makes the whole Scrabble logic work. It's kind of important.
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

      // This from Stackoverflow, it makes the tiles snap to where it was dropped.
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
