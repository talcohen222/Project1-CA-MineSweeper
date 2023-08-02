'use strict'

var gBoard
var gLevel
var gGame

const MINE = '💣'
const EMPTY = ''
const MARKED = '🚩'

var gIsFirstMove
var gSize = 4
var gMines = 2
var gLivesLeft = 1
var gCount

function onInit() { //This is called when page loads 
    gBoard = []
    gCount = 0
    gIsFirstMove = true
    document.querySelector('.live-left-num').innerText = gLivesLeft
    document.querySelector('.state').innerText = '😄'

    gLevel = {
        SIZE: gSize,
        MINES: gMines
    }

    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }

    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard)
}

function onCellClicked(elCell, i, j) { //Called when a cell is clicked
    if (!gGame.isOn) return
    if (gBoard[i][j].isMarked) return
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMine) updateLiveLeft()

    if (gIsFirstMove) {
        gIsFirstMove = false
        placeRandomMines(i, j)
        expandShown(gBoard, elCell, i, j) //model
    }
    else {
        var minesAround = setMinesNegsCount(gBoard, i, j)
        if (minesAround === 0) expandShown(gBoard, elCell, i, j) //model , if no mines around- open neighbors, else- open just the selected cell  
        else {
            gBoard[i][j].isShown = true //model
            gBoard[i][j].minesAroundCount = minesAround //model
        }
    }
    renderBoard(gBoard) //DOM
    if(checkGameOver()) {
        document.querySelector('.state').innerText = '😎'
        gameOver()

    }
    console.log('gBoard[i][j]:', gBoard[i][j])
}

function onCellMarked(elCell) { // Called when a cell is rightclicked.  See how you can hide the context menu on right click

    if (!gGame.isOn) return

    var row = getLocation(elCell.id).i
    var col = getLocation(elCell.id).j

    if (gBoard[row][col].isShown) return

    gBoard[row][col].isMarked = !gBoard[row][col].isMarked //remove ot add the flag

    renderBoard(gBoard)
    checkGameOver() 
    console.log('gBoard[row][col]:', gBoard[row][col])
}

function checkGameOver() { // Game ends when all mines are marked, and all the other cells are shown
    console.log("aaaaa");
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if(gBoard[i][j].isMarked && !gBoard[i][j].isMine) return false
            if(!gBoard[i][j].isMarked && gBoard[i][j].isMine) return false
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMine) return false
        }
    }
    return true
}

function expandShown(board, elCell, rowIdx, colIdx) { // Open cells around the clicked cell

    if (board[rowIdx][colIdx].isMine) { //if mine- will not open cells around
        gBoard[rowIdx][colIdx].isShown = true
        return
    }
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (!board[i][j].isMine) {
                var minesAroundCount = setMinesNegsCount(board, i, j)
                board[i][j].minesAroundCount = (minesAroundCount === 0) ? EMPTY : minesAroundCount
                board[i][j].isShown = true
            }
        }
    }
}

function placeRandomMines(row, col) {
    var optinonalPlaces = [] //find optional places to place mines
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!((i === row && j === col) || (i === row && j === col - 1) || (i === row && j === col) || (i === row && j === col + 1) ||
                (i === row - 1 && j === col - 1) || (i === row - 1 && j === col) || (i === row - 1 && j === col + 1) ||
                (i === row + 1 && j === col - 1) || (i === row + 1 && j === col) || (i === row + 1 && j === col + 1))) { //mines  are not placed in the first clicked cell and its neighbors
                optinonalPlaces.push({ i, j })
            }
        }
    }
    for (var i = 0; i < gLevel.MINES; i++) { //place mines in the model
        var randIdx = getRandomIntInclusive(0, optinonalPlaces.length - 1)
        var idxToPlace = optinonalPlaces[randIdx]
        gBoard[idxToPlace.i][idxToPlace.j].isMine = true
        optinonalPlaces.splice(randIdx, 1)
    }
}

// function openCellsNegs(rowIdx, colIdx) {
//     if(gBoard[rowIdx][colIdx].isMine){ //if mine- will not open cells around
//         gBoard[rowIdx][colIdx].isShown = true
//         return
//     }
//     for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
//         if (i < 0 || i >= gBoard.length) continue;
//         for (var j = colIdx - 1; j <= colIdx + 1; j++) {
//             if (j < 0 || j >= gBoard[0].length) continue;
//             if (!gBoard[i][j].isMine) {
//                 var minesAroundCount = setMinesNegsCount(gBoard, i, j)
//                 gBoard[i][j].minesAroundCount = (minesAroundCount === 0) ? EMPTY : minesAroundCount
//                 gBoard[i][j].isShown = true
//             }
//         }
//     }
// }

function getLocation(id) {
    var parts = id.split('-')
    return {
        i: +parts[1],
        j: +parts[2]
    }
}

function updateLevel(elBtn) {
    if (elBtn.innerText === 'Beginner') {
        gSize = 4
        gMines = 2
        gLivesLeft = 1
    }
    if (elBtn.innerText === 'Medium') {
        gSize = 8
        gMines = 14
        gLivesLeft = 3
    }
    if (elBtn.innerText === 'Expert') {
        gSize = 12
        gMines = 32
        gLivesLeft = 3
    }
    onInit()
}

function updateLiveLeft() {
    console.log("aaaa");
    gLivesLeft--
    document.querySelector('.live-left-num').innerText = gLivesLeft
    if (gLivesLeft === 0) {
        document.querySelector('.state').innerText = '😖'
        gameOver()
    }
}

function gameOver() {
    gGame.isOn = false
}