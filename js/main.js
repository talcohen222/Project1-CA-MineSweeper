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
var gLivesLeft
var gCount
var secsPassed
var gTimerIntervalID
var gSafeClicks
var gSeconds
var gThousandth
var gLevelName = 'Beginner'
var gTimeleft


function onInit() { //This is called when page loads 
    // localStorage.clear()

    gBoard = []
    gCount = 0
    gLivesLeft = 3
    gIsFirstMove = true
    gSafeClicks = 3
    changeInnerText('.live-left-num', gLivesLeft)
    changeInnerText('.state', '😄')
    changeInnerText('.safe-clicks-left', 3)


    gLevel = {
        SIZE: gSize,
        MINES: gMines
    }

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0

    }

    updateScoresDisplay()

    changeInnerText('.left-mines', gLevel.MINES)
    clearInterval(gTimerIntervalID)
    changeInnerText('.timer-second', '0.')
    changeInnerText('.timer-thousand', '000')

    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard)
}


function onCellClicked(elCell, i, j) { //Called when a cell is clicked
    if (gIsFirstMove) gGame.isOn = true
    if (!gGame.isOn) return
    if (gBoard[i][j].isMarked) return
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMine) {
        updateLiveLeft()
        playSound()
    }

    if (gIsFirstMove) {
        placeRandomMines(i, j)
        expandShown(gBoard, elCell, i, j) //model
        gIsFirstMove = false
        var startTime = Date.now()
        gTimerIntervalID = setInterval(showTimer, 37, startTime)
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
    checkGameOver()
}


function onCellMarked(elCell) { // Called when a cell is rightclicked.  See how you can hide the context menu on right click

    if (gIsFirstMove) return
    if (!gGame.isOn) return

    var row = getLocation(elCell.id).i
    var col = getLocation(elCell.id).j

    if (gBoard[row][col].isShown) return

    if (gBoard[row][col].isMarked) gLevel.MINES++
    else gLevel.MINES--


    gBoard[row][col].isMarked = !gBoard[row][col].isMarked //remove or add the flag

    changeInnerText('.left-mines', gLevel.MINES)
    renderBoard(gBoard)
    checkGameOver()
}


function checkGameOver() { // Game ends when all mines are marked, and all the other cells are shown
    var win = true
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if ((gBoard[i][j].isMarked && !gBoard[i][j].isMine) ||
                (!gBoard[i][j].isMarked && gBoard[i][j].isMine && !gBoard[i][j].isShown) ||
                (!gBoard[i][j].isShown && !gBoard[i][j].isMine)) {
                win = false
                break
            }
        }
    }

    if (win) {
        changeInnerText('.state', '😎')
        updateBestScores()
        updateScoresDisplay()
        gameOver()
    }
}


function expandShown(board, elCell, rowIdx, colIdx) {

    if (rowIdx < 0 || rowIdx > board.length - 1 || colIdx < 0 || colIdx > board.length - 1) return  //if out of bounds

    if (board[rowIdx][colIdx].isShown) return // if is shown

    if (board[rowIdx][colIdx].isMine) { // if mine
        if (getLocation(elCell.id).i === rowIdx && getLocation(elCell.id).j === colIdx) { //if clicked cell - open it and return, else- return
            gBoard[rowIdx][colIdx].isShown = true
        }
        return
    }

    var minesAroundCount = setMinesNegsCount(board, rowIdx, colIdx)
    board[rowIdx][colIdx].minesAroundCount = (minesAroundCount === 0) ? EMPTY : minesAroundCount
    board[rowIdx][colIdx].isShown = true

    if (board[rowIdx][colIdx].minesAroundCount !== EMPTY) return //if not empty cell

    expandShown(board, elCell, rowIdx - 1, colIdx - 1)
    expandShown(board, elCell, rowIdx - 1, colIdx)
    expandShown(board, elCell, rowIdx - 1, colIdx + 1)
    expandShown(board, elCell, rowIdx, colIdx - 1)
    expandShown(board, elCell, rowIdx, colIdx + 1)
    expandShown(board, elCell, rowIdx + 1, colIdx - 1)
    expandShown(board, elCell, rowIdx + 1, colIdx)
    expandShown(board, elCell, rowIdx + 1, colIdx + 1)
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


function updateLiveLeft() {
    gLivesLeft--
    changeInnerText('.live-left-num', gLivesLeft)
    if (gLivesLeft === 0) {
        changeInnerText('.state', '😖')
        showAllMines(gBoard)
        gameOver()
    }
}


function gameOver() {
    clearInterval(gTimerIntervalID)
    gGame.isOn = false
}


function showAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine && !board[i][j].isShown) board[i][j].isShown = true
        }
    }
    renderBoard(board)
}


function showTimer(startTime) {

    var now = Date.now()
    gTimeleft = now - startTime;
    gSeconds = Math.floor((gTimeleft % (1000 * 60)) / 1000);
    gThousandth = Math.floor((gTimeleft % (1000)));

    changeInnerText('.timer-second', gSeconds + '.')
    changeInnerText('.timer-thousand', gThousandth)

    gGame.secsPassed = gSeconds + "." + gThousandth
}


function getSafeCell() {
    if (!gGame.isOn) return
    if (gSafeClicks === 0) {
        alert("You have already used all the safe clicks")
        return
    }
    var safeCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (!cell.isShown && !cell.isMarked && !cell.isMine) safeCells.push({ i, j })
        }
    }
    if (safeCells.length === 0) {
        alert("There are no safe clicks at this point")
        return
    }
    var randIdx = getRandomIntInclusive(0, safeCells.length - 1)
    var safeCell = safeCells[randIdx]
    var elCell = document.getElementById('cell-' + safeCell.i + '-' + safeCell.j)
    elCell.classList.add('show-safe-click')

    setTimeout(() => {
        elCell.classList.remove('show-safe-click')
    }, 1000);

    gSafeClicks--
    changeInnerText('.safe-clicks-left', gSafeClicks)
}


function updateBestScores() {
    const storageScore = localStorage.getItem(gLevelName)
    if (storageScore === null) { //first game in this level
        localStorage.setItem(gLevelName, gTimeleft)
        return
    }
    if (gTimeleft < storageScore) { //not first game in this level and better score
        localStorage.setItem(gLevelName, gTimeleft)
    }
}


function updateScoresDisplay() {
    var storageScore = localStorage.getItem(gLevelName)
    var score = (storageScore === null) ? 0 : gTimeleft

    var str
    if (score === 0) {
        str = gLevelName + ' best score: 0.000'
        changeInnerText('.best-scores', str)
    }
    else if (score <= storageScore) {
        str = gLevelName + ' best score: ' + gSeconds + '.' + gThousandth
        changeInnerText('.best-scores', str)
    }
}


function updateLevel(value) {
    if (value === 'Beginner') {
        gSize = 4
        gMines = 2
        gLevelName = 'Beginner'
        // gLivesLeft = 1
    }
    if (value === 'Medium') {
        gSize = 8
        gMines = 14
        gLevelName = 'Medium'
        // gLivesLeft = 3
    }
    if (value === 'Expert') {
        gSize = 12
        gMines = 32
        gLevelName = 'Expert'
        // gLivesLeft = 3
    }
    onInit()
}


function getLocation(id) {
    var parts = id.split('-')
    return {
        i: +parts[1],
        j: +parts[2]
    }
}


function changeInnerText(selector, value) {
    document.querySelector(selector).innerText = value
}


// function expandShown(board, elCell, rowIdx, colIdx) { // Open cells around the clicked cell

//     if (board[rowIdx][colIdx].isMine) { //if mine- will not open cells around
//         gBoard[rowIdx][colIdx].isShown = true
//         return
//     }
//     for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
//         if (i < 0 || i >= board.length) continue;
//         for (var j = colIdx - 1; j <= colIdx + 1; j++) {
//             if (j < 0 || j >= board[0].length) continue;
//             if (!board[i][j].isMine) {
//                 var minesAroundCount = setMinesNegsCount(board, i, j)
//                 board[i][j].minesAroundCount = (minesAroundCount === 0) ? EMPTY : minesAroundCount
//                 board[i][j].isShown = true
//             }
//         }
//     }
// }