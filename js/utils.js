"use strict";

function buildBoard(size) { // Builds the board , Set the mines , Call setMinesNegsCount() , Return the created board

  const board = [];
  for (var i = 0; i < size; i++) {
    board[i] = [];
    for (var j = 0; j < size; j++) {
      var isMine = false
      // if (i === 1 && j === 1 || i === size - 2 && j === size - 2) {
      //   isMine = true
      // }
      board[i][j] = {
        minesAroundCount: EMPTY, ////////////////////////////////// ****************** Call setMinesNegsCount()
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
        // if (isMine) cellContent = isMarked ? MARKED : MINE
        if (isMine) cellContent = MINE
        else cellContent = minesAroundCount
      }
      else cellContent = isMarked ? MARKED : EMPTY

      var classNameForOpen = board[i][j].isShown ? 'opened-cell' : ''
      var classNameForMines = board[i][j].isShown && board[i][j].isMine ? 'mine-cell' : ''

      const tdId = 'cell-' + i + '-' + j
      strHTML += `\t<td id=${tdId} class="cell ${classNameForOpen} ${classNameForMines}" oncontextmenu="javascript:onCellMarked(this);return false;"
          onclick="onCellClicked(this, ${i}, ${j})">${cellContent}</td>\n` //<td class="cell cell-i-j">${cellContent}</td>
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


//----------------------------------------------------------------------------//


function createMat(rowIdx, colIdx) {
  const mat = [];
  for (var i = 0; i < rowIdx; i++) {
    const row = [];
    for (var j = 0; j < colIdx; j++) {
      row.push("♻️");
    }
    mat.push(row);
  }
  return mat;
}

function getEmptyCells(board) {
  var emptyCells = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      const currCell = board[i][j];
      if (currCell.type === FLOOR && currCell.gameElement === null)
        emptyCells.push({ i, j });
    }
  }
  if (!emptyCells.length) return null;
  return emptyCells;
}


//-----------------Rendering-------------//

// --> Renders into an already made board in the HTML


// location such as: {i: 2, j: 7}
function renderCell(location, value) {
  // Select the elCell and set the value
  const elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
  elCell.innerHTML = value;
}


//-----------------Randoms-------------//

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
  // The maximum is exclusive and the minimum is inclusive
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


//--------------extra shit and sheet--------------//

function makeId(length = 6) {
  var txt = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return txt;
}

function handleModal() {
  gElModal.classList.toggle("hidden");
  /* <div class='modal hidden'>modal</div> */
}

function playSound() {
  const audio = new Audio("filename.type");
  audio.play();
}

function onHandleKey(event) {
  const i = gGamerPos.i;
  const j = gGamerPos.j;
  switch (event.key) {
    case "ArrowLeft":
    case "a":
      moveTo(i, j - 1);
      break;
    case "ArrowRight":
    case "d":
      moveTo(i, j + 1);
      break;
    case "ArrowUp":
    case "w":
      moveTo(i - 1, j);
      break;
    case "ArrowDown":
    case "s":
      moveTo(i + 1, j);
      break;
  }
}
