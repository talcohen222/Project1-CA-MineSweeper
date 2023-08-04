"use strict";

function buildBoard(size) { // Builds the board , Set the mines , Call setMinesNegsCount() , Return the created board

  const board = [];
  for (var i = 0; i < size; i++) {
    board[i] = [];
    for (var j = 0; j < size; j++) {
      var isMine = false
      // if (i === 3 && j === 1 || i === size - 3 && j === size - 2) isMine = true

      board[i][j] = {
        minesAroundCount: EMPTY,
        isShown: false,
        isMine: isMine,
        isMarked: false
      };
    }
  }
  return board
}


function renderBoard(board) { // Render the board as a <table> to the page

  var strHTML = ''
  var cellContent

  for (var i = 0; i < board.length; i++) {
    strHTML += '\n<tr>\n'
    for (var j = 0; j < board[0].length; j++) {

      const minesAroundCount = board[i][j].minesAroundCount
      const isShown = board[i][j].isShown
      const isMine = board[i][j].isMine
      const isMarked = board[i][j].isMarked

      if (isShown) {
        if (isMine) cellContent = MINE
        else cellContent = minesAroundCount
      }
      else cellContent = isMarked ? MARKED : EMPTY

      var classNameForOpen = board[i][j].isShown ? 'opened-cell' : ''
      var classNameForMines = board[i][j].isShown && board[i][j].isMine ? 'mine-cell' : ''

      const tdId = 'cell-' + i + '-' + j
      strHTML += `\t<td id=${tdId} class="cell ${classNameForOpen} ${classNameForMines}" oncontextmenu="javascript:onCellMarked(this);return false;"
          onclick="onCellClicked(this, ${i}, ${j})">${cellContent}</td>\n` 
    }
    strHTML += '</tr>'
  }

  const elContainer = document.querySelector('.board-cells')
  elContainer.innerHTML = strHTML
}


function setMinesNegsCount(board, rowIdx, colIdx) { // Count mines around each cell and set the cell's minesAroundCount.

  var count = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (i === rowIdx && j === colIdx) continue;
      if (j < 0 || j >= board[0].length) continue;
      var currCell = board[i][j];
      if (currCell.isMine) count++;
    }
  }
  return count
}


function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function playSound() {
  const audio = new Audio("1.wav");
  audio.play();
}
