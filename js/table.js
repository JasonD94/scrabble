/*
    File: ~/js/table.js
    91.461 Assignment 6: Creating an Interactive Dynamic Table
    Jason Downing - student at UMass Lowell in 91.461 GUI Programming I
    Contact: jdowning@cs.uml.edu or jason_downing@student.uml.edu
    MIT Licensed - see http://opensource.org/licenses/MIT for details.
    Anyone may freely use this code. Just don't sue me if it breaks stuff.
    Created: Oct 13, 2015.
    Last Updated: Oct 16th, 3:30PM

    This page is for the 6th assignment, "Creating an Interactive Dynamic Table".
    It contains a JavaScript function called table_calc() which calculates out
    the multiplication table, and then calls a function called table_fill() which
    fills in the table.
*/

// This function calculates the multiplication table.
function table_calc() {
  /*  User input - from the form on the assignment 6 HTML doc.
      Convert to a number using type casting. This fixed so many random bugs
      in my code. W3Schools helped a ton in figuring this out, as comparisons
      would fail randomly before I added this.
      http://www.w3schools.com/js/js_comparisons.asp
  */
  var hor_start = Number(document.getElementById('horiz_start').value);
  var hor_end = Number(document.getElementById('horiz_end').value);
  var vert_start = Number(document.getElementById('vert_start').value);
  var vert_end = Number(document.getElementById('vert_end').value);

  // Check to see if the numbers are read correctly.
  console.log("Horizontal start: ", hor_start, "Horizontal end: ", hor_end,
              "---Vertical start: ", vert_start, "Vertical end: ", vert_end);

  // Swap beginning / ending numbers if the start is larger than the beginning.
  if (hor_start > hor_end) {
    var tmp_num = hor_start;
    hor_start = hor_end;
    hor_end = tmp_num;
  }
  // Also swap vertical beginning / ending
  if (vert_start > vert_end) {
    var tmp_num = vert_start;
    vert_start = vert_end;
    vert_end = tmp_num;
  }

  // It crashes on huge numbers so don't let users enter numbers greater/less than 1,000
  if (hor_start < -1000 || hor_end > 1000 || vert_start < -1000 || vert_end > 1000) {
    alert("Sorry, but valid input is a number between -1000 and 1000.");
    return;
  }

  /*  Instead of an array of arrays, use an object containing each rows array.
      Example:
      matrix {
        row1: [1, 2, 3,  4,  5],
        row2: [3, 6, 9, 12, 15],
        row3: [etc],
        row4: [etc]
      }
  */
  var matrix = {};

  // Flip the inputs around if the end is less than the start.
  // This would break the <= row code below.
  // Also use absolute values - so if we got say -8 it would ignore the negative.
  var rows = Math.abs(hor_end - hor_start);
  var columns = Math.abs(vert_end - vert_start);

  // Indexes for the 2D array.
  var horz = hor_start;
  var vert = vert_start;

  /*  Calculate the multiplication table using an object (matrix) and a bunch
      of arrays. I use a temp. array, calculate out a whole row's values, and
      then save that row's array in the object. See the example where var matrix
      is declared for an example.    */
  for (var x = 0; x <= columns; x++) {
    var tmp_arr = [];

    for (var y = 0; y <= rows; y++) {
      // Calculate the given spot in the multiplication table.
      var calc = horz * vert;
      tmp_arr[y] = calc;
      horz++;
    }

    // Save the current row in the object.
    matrix["row" + x] = tmp_arr;

    horz = hor_start;        // Reset each pass since we're moving down a row.
    vert++;
  }

  table_fill(matrix);
  return false;
}


// This function fills in the multiplication table.
function table_fill(matrix) {
  // Debugging.
  console.log("The array looks like:\n", matrix);

  // User input
  // Convert to number to prevent random shit
  // http://www.w3schools.com/js/js_comparisons.asp
  var hor_start = Number(document.getElementById('horiz_start').value);
  var hor_end = Number(document.getElementById('horiz_end').value);
  var vert_start = Number(document.getElementById('vert_start').value);
  var vert_end = Number(document.getElementById('vert_end').value);

  // Check to see if the numbers are read correctly.
  console.log("Horizontal start: ", hor_start, "Horizontal end: ", hor_end,
              "---Vertical start: ", vert_start, "Vertical end: ", vert_end);

  // Swap beginning / ending numbers if the start is larger than the beginning.
  if (hor_start > hor_end) {
    var tmp_num = hor_start;
    hor_start = hor_end;
    hor_end = tmp_num;
  }
  // Also swap vertical beginning / ending
  if (vert_start > vert_end) {
    var tmp_num = vert_start;
    vert_start = vert_end;
    vert_end = tmp_num;
  }

  // Flip the inputs around if the end is less than the start. This would break <= row code below.
  // Do using this absolute values - so if we got say -8 it would ignore the negative.
  var rows = Math.abs(hor_end - hor_start);
  var columns = Math.abs(vert_end - vert_start);

  // Now we can fill in the table.
  // w3schools is helpful: http://www.w3schools.com/html/html_tables.asp
  var content = "";

  // Opening table tags.
  content += "<table>";

  // First row, and put an empty spot in the top left corner.
  content += "<tr><td></td>";

  // Now fill out the rest of the first row.
  for (var a = hor_start; a <= hor_end; a++) {
    content += "<td>" + a + "</td>";
  }

  // Close the first row.
  content += "</tr>";

  // Print out the left most column using this variable.
  var vert = vert_start;

  // Fill in each row after the first.
  for (var x = 0; x <= columns; x++) {
    // Set the left most column first.
    content += "<tr><td>" + vert + "</td>";

    // Add in all the multiplication for this row.
    for (var y = 0; y <= rows; y++) {
      content += "<td>" + matrix["row" + x][y] + "</td>";
    }
    vert++;

    // Close each row.
    content += "</tr>";
  }

  // Ending table tags.
  content += "</table>";

  // Now the content gets loaded into the HTML page.
  $("#multiplication_table").html(content);
}
