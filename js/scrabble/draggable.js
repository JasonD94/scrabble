/*
    File: ~/js/scrabble/draggable.js
    91.461 Assignment 9: Implementing a Bit of Scrabble with Drag-and-Drop
    Jason Downing - student at UMass Lowell in 91.461 GUI Programming I
    Contact: jdowning@cs.uml.edu or jason_downing@student.uml.edu
    MIT Licensed - see http://opensource.org/licenses/MIT for details.
    Anyone may freely use this code. Just don't sue me if it breaks stuff.
    Created: Nov 24, 2015.
    Last Updated: Dec 8, 9PM.

    This JavaScript file is for the 9th assignment, "Scrabble".

    This file controls the draggable logic.
*/


/**
 *    This function loads up the scrabble pieces onto the rack.
 *    It also makes each of them draggable and sets various properties, including
 *    the images location and class / ID.
 *
 *    the tile IDs are in the form "piece#", where # is between 1 and 7.
 *
 */
function load_scrabble_pieces() {
  var base_url = "img/scrabble/Scrabble_Tile_";       // base URL of the image
  var random_letter = "";                             // Random letter for the tile
  var piece = "";                                     // HTML for the current tile (image tag)
  var piece_ID = "";                                  // ID for the current tile. In the form "piece#" where # is between 0 and 6.
  var pos;                                            // Position of the rack.
  var img_left, img_top;                              // Used to set the tile's position, based on the position of the rack (pos)

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
    pos = $("#the_rack").position();

    // Now figure out where to reposition the board piece.
    img_left = pos.left + 30 + (50 * i);      // This controls left to right placement.
    img_top = pos.top + 30;                   // This controls top to bottom placement.

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
        startPos = ui.helper.position();  // startPos is a global variable found in variables.js
      },
      stop: function() {
        // If an invalid event is found, this will return the draggable object to its
        // default "invalid" option. From this Stackoverflow post (also used in the droppable part.)
        $(this).draggable('option','revert','invalid');
      }
    });
  }
}
