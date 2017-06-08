/*
    File: ~/js/scrabble_v2.js
    91.461 Assignment 9: Implementing a Bit of Scrabble with Drag-and-Drop
    Jason Downing - student at UMass Lowell in 91.461 GUI Programming I
    Contact: jdowning@cs.uml.edu or jason_downing@student.uml.edu
    MIT Licensed - see http://opensource.org/licenses/MIT for details.
    Anyone may freely use this code. Just don't sue me if it breaks stuff.
    Created: Nov 24, 2015.
    Last Updated: Dec 8, 9PM.

    This JavaScript file is for the 9th assignment, "Scrabble".

    This file was the original file I used for the Scrabble game.

    All this file will do in the future is run the document.ready function,
    which runs on the first page load after the DOM is loaded.
*/


/**
 *      This loads up the initial game board and makes
 *      the game playable on the first load of the web page.
 *
 **/
$( document ).ready(function() {
  load_pieces_array();        // Load up the default pieces array.
  load_scrabble_pieces();     // Load up the 7 random Scrabble pieces.
  load_droppable_targets();   // Load up the targets for the Scrabble pieces.
  update_remaining_table();   // Update the Letters Remaining table.
  fill_in_table();            // Add special items to the table.
});

