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
var gTimerIntervalID
var gSafeClicks
var gMin
var gSeconds
var gThousandth
var gLevelName = 'Beginner'
var gTimeleft
var GgameHistory
var gIsMegaHint
var gCellsClickedForMega
var gIsUserPositMines
var gTempMines
var gisUserPlacedMines
var gIsDarkMode
var gIsHintMode

function onInit() { //This is called when page loads 
    // localStorage.clear()

    gBoard = []
    GgameHistory = []
    gCount = 0
    gLivesLeft = 3
    gIsFirstMove = true
    gSafeClicks = 3
    gIsMegaHint = false
    gCellsClickedForMega = []
    gIsUserPositMines = false
    gisUserPlacedMines = false
    gTempMines = gMines
    gIsDarkMode = false
    gIsHintMode = false
    changeInnerText('.live-left-num', gLivesLeft)
    changeInnerText('.state', '😄')
    changeInnerText('.safe-clicks-left', 3)
    changeInnerText('.mines-to-posit', gMines)
    document.querySelector('.light1').classList.remove('light-opacity')
    document.querySelector('.light2').classList.remove('light-opacity')
    document.querySelector('.light3').classList.remove('light-opacity')


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
    changeInnerText('.timer', '0:00:00')

    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard)

}


function onCellClicked(elCell, i, j) { //Called when a cell is clicked
    if (gIsFirstMove) gGame.isOn = true

    if (gIsMegaHint && gGame.isOn && !gIsFirstMove && !gIsHintMode) { //Mega hint
        gCellsClickedForMega.push({ i, j })
        if (gCellsClickedForMega.length === 2) {
            getMegaHint(gCellsClickedForMega)
            gIsMegaHint = false
        }
        return
    }

    if (gIsHintMode && !gIsMegaHint && !gIsFirstMove) {//hint
        showHint(i, j)
        return
    }

    if (gIsUserPositMines && gGame.isOn) { //user positioned mines
        elCell.classList.add('posit-mine')
        if (gBoard[i][j].isMine) return
        gBoard[i][j].isMine = true
        if (gTempMines === 1) {
            gIsUserPositMines = false
            renderBoard(gBoard)
        }
        gTempMines--
        changeInnerText('.mines-to-posit', gTempMines)
        return
    }

    if (!gGame.isOn || gBoard[i][j].isMarked || gBoard[i][j].isShown) return

    if (gBoard[i][j].isMine && !gIsUserPositMines) {
        updateLiveLeft()
        playSound()
    }
    if (gIsFirstMove && !gIsUserPositMines) {
        startTimer()
        if (!gisUserPlacedMines) placeRandomMines(i, j)
        expandShown(gBoard, elCell, i, j) //model
        gIsFirstMove = false
    }
    else {
        var minesAround = setMinesNegsCount(gBoard, i, j)
        if (minesAround === 0) expandShown(gBoard, elCell, i, j) //model , if no mines around- open neighbors, else- open just the selected cell  
        else {
            gBoard[i][j].isShown = true //model
            gBoard[i][j].minesAroundCount = minesAround //model
        }
    }

    var boardCopy = deepCopy(gBoard)
    GgameHistory.push({ board: boardCopy, liveLeft: gLivesLeft, marked: gLevel.MINES })

    renderBoard(gBoard) //DOM
    checkGameOver()
}


function onCellMarked(elCell) { // Called when a cell is rightclicked.  See how you can hide the context menu on right click

    if (gIsFirstMove || !gGame.isOn) return

    var row = getLocation(elCell.id).i
    var col = getLocation(elCell.id).j

    if (gBoard[row][col].isShown) return

    if (gBoard[row][col].isMarked) gLevel.MINES++
    else gLevel.MINES--

    gBoard[row][col].isMarked = !gBoard[row][col].isMarked //remove or add the flag

    changeInnerText('.left-mines', gLevel.MINES)

    var boardCopy = deepCopy(gBoard)
    GgameHistory.push({ board: boardCopy, liveLeft: gLivesLeft, marked: gLevel.MINES })

    renderBoard(gBoard)
    checkGameOver()
}


function deepCopy(board) {
    var boardCopy = []
    for (var i = 0; i < board.length; i++) {
        boardCopy[i] = []
        for (var j = 0; j < board[0].length; j++) {
            boardCopy[i][j] = {
                minesAroundCount: board[i][j].minesAroundCount,
                isShown: board[i][j].isShown,
                isMine: board[i][j].isMine,
                isMarked: board[i][j].isMarked
            }
        }
    }
    return boardCopy
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
    gLevel.MINES--
    gLivesLeft--
    changeInnerText('.live-left-num', gLivesLeft)
    changeInnerText('.left-mines', gLevel.MINES)
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

    gMin = String(new Date(gTimeleft).getMinutes()).padStart(2, '0')
    gSeconds = String(Math.floor((gTimeleft % (1000 * 60)) / 1000)).padStart(2, '0');
    gThousandth = String(Math.floor((gTimeleft % (1000)))).padStart(3, '0');

    changeInnerText('.timer', gMin + ':' + gSeconds + ':' + gThousandth)

    gGame.secsPassed = gMin + ':' + gSeconds + ':' + gThousandth
}


function getSafeCell() {
    if (!gGame.isOn) return
    if (gSafeClicks === 0) {
        alert("You have already used all the safe clicks")
        return
    }
    var safeCells = getSafeCells()

    if (safeCells.length === 0) {
        alert("There are no safe clicks at this point")
        return
    }
    showSafeCell(safeCells)
    gSafeClicks--
    changeInnerText('.safe-clicks-left', gSafeClicks)
}


function getSafeCells() {
    var safeCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (!cell.isShown && !cell.isMarked && !cell.isMine) safeCells.push({ i, j })
        }
    }
    return safeCells
}


function showSafeCell(safeCells) {
    var randIdx = getRandomIntInclusive(0, safeCells.length - 1)
    var safeCell = safeCells[randIdx]
    var elCell = document.getElementById('cell-' + safeCell.i + '-' + safeCell.j)
    elCell.classList.add('show-safe-click')

    setTimeout(() => {
        elCell.classList.remove('show-safe-click')
    }, 1000);
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

    if (score === 0) str = gLevelName + ' best score: 00:00:000' //if nothing is stored
    else if (score <= storageScore) str = gLevelName + ' best score: ' + gMin + ':' + gSeconds + ':' + gThousandth //if better score
    else str = gLevelName + ' best score: ' + new Date(storageScore).getMinutes() + parseInt((+storageScore) / 1000) + ':' + (+storageScore) % 1000 //if not better score- display the storage score

    changeInnerText('.best-scores', str)
}


function getOneStepBack() {

    if (!gGame.isOn || GgameHistory.length === 1) return

    GgameHistory.pop()

    var lastStep = GgameHistory[GgameHistory.length - 1]
    gLivesLeft = lastStep.liveLeft //MODEL
    gLevel.MINES = lastStep.marked
    gBoard = lastStep.board
    renderBoard(gBoard) //DOM
    changeInnerText('.live-left-num', gLivesLeft)
    changeInnerText('.left-mines', gLevel.MINES)
}

function startTimer() {
    var startTime = Date.now()
    gTimerIntervalID = setInterval(showTimer, 37, startTime)
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


function getArea() {
    if (gCellsClickedForMega.length < 2 && !gIsFirstMove) gIsMegaHint = true
    if (!gIsFirstMove && !gIsMegaHint) alert("You can use mega hint only once")
}

function getDarkMode() {
    document.querySelector('.all').style.backgroundColor = gIsDarkMode ? '#000000' : '#ffffff' 
    document.querySelector('.best-scores').style.color = gIsDarkMode ? '#ffffff' : '#000000' 
    gIsDarkMode = !gIsDarkMode
}


function getMegaHint(cellsClickedForMega) {

    var row1 = cellsClickedForMega[0].i
    var col1 = cellsClickedForMega[0].j
    var row2 = cellsClickedForMega[1].i
    var col2 = cellsClickedForMega[1].j

    var startRow = (row1 < row2) ? row1 : row2
    var endRow = (row1 < row2) ? row2 : row1
    var startCol = (col1 < col2) ? col1 : col2
    var endCol = (col1 < col2) ? col2 : col1

    var openedCells = []
    var boardWithHint = deepCopy(gBoard)
    for (var i = startRow; i <= endRow; i++) {
        for (var j = startCol; j <= endCol; j++) {
            boardWithHint[i][j].isShown = true
            boardWithHint[i][j].minesAroundCount = setMinesNegsCount(boardWithHint, i, j)
            openedCells.push({ i, j })
        }
    }
    renderBoard(boardWithHint)

    for (var t = 0; t < openedCells.length; t++) {
        var tdId = 'cell-' + openedCells[t].i + '-' + openedCells[t].j
        document.getElementById(tdId).classList.add('show-safe-click')
    }

    setTimeout(() => {
        renderBoard(gBoard)
    }, 2000);
}


function startPositMines() {
    changeInnerText('.mines-to-posit', gLevel.MINES)
    if (!gIsFirstMove) {
        alert('You can positioned mines only on first move')
        return
    }
    else {
        gIsUserPositMines = true
        gisUserPlacedMines = true
    }
}


function getHint(elLight) {

    if (elLight.classList.contains('light-opacity')) return
    if (!gGame.isOn || gIsHintMode) return

    elLight.classList.add('light-opacity')
    gIsHintMode = true
}


function showHint(rowIdx, colIdx) {
    var boardCopy = deepCopy(gBoard)
    var openedCells = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= boardCopy.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= boardCopy[0].length) continue;
            openedCells.push({ i, j })
            boardCopy[i][j].isShown = true
           
            var neighbors = setMinesNegsCount(boardCopy, i, j)
            if (!boardCopy[i][j].isMine) boardCopy[i][j].minesAroundCount = neighbors
        }
    }

    renderBoard(boardCopy)
    for (var t = 0; t < openedCells.length; t++) {
        var tdId = 'cell-' + openedCells[t].i + '-' + openedCells[t].j
        document.getElementById(tdId).classList.add('show-safe-click')
    }

    setTimeout(() => {
        renderBoard(gBoard)
        gIsHintMode = false
    }, 1500);
}

