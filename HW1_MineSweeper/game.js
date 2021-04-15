function Game(){
    const gameBoard = document.getElementById('gameBoard');
    const mineCounter = document.querySelector('.remainingMine');
    const timer = document.querySelector('#timer');
    const restartButton = document.querySelector('#restartButton input');
    let rows = [];
    let width;
    let height;
    let numberOfMines;
    let interval;
    let timerPause = true;

    //width, height, 지뢰수 입력 받기 
    function setGameBoard(){
        while(true){
            width = prompt("Width를 입력하세요. 5 ~ 30 사이로!");
            if(5 <= width && width <= 30) break;
        }
        while(true){
            height = prompt("Height를 입력하세요. 5 ~ 30 사이로!");
            if(5 <= height && height <= 30) break;
        }
        while(true){
            numberOfMines = prompt(`지뢰의 개수를 입력하세요. 0 ~ ${parseInt(width) * parseInt(height)}사이로!`);
            if(0 <= numberOfMines && numberOfMines <= width * height) break;
        }
        return;
    }
    setGameBoard();

    
    function initGame() {
        //status 기능 구현
        mineCounter.textContent = numberOfMines;

        let seconds = 0;
        function addSecond(){
            seconds ++;
            timer.textContent = "TIME : " + seconds +"s";            
        }
        if(timerPause){
            timerPause = false;
            interval = setInterval(addSecond, 1000);
        }
        // 행 생성해주기
        for(let i = 0; i < height ; i++){
            const row = [];
            rows.push(row);
            const rowDom = document.createElement('div');
            rowDom.className = 'row';
            gameBoard.appendChild(rowDom);
        
            // 각 cell을 row에 넣어서 열 생성해주기
            for(let j = 0; j < width; j++){
                const dom = document.createElement('div');
                dom.className = 'cell';
                rowDom.appendChild(dom);
                                
                const cell = {
                    dom,
                    x : j,
                    y : i,
                    clicked : false,
                    flagged : false,
                    isMine : false
                };
                row.push(cell);

                // 좌클릭에 대한 반응
                dom.addEventListener('click', function(){
                    if(cell.clicked || cell.flagged) return;
                    if(cell.isMine) return gameOver(false, interval);

                    cell.clicked = true;
                    const neighbors = getNeighbors(cell);
                    cell.dom.textContent = neighbors.filter(neighbor => neighbor.isMine === true).length;

                    // 클릭한 곳 주변 지뢰가 0개라면 9개 방향 cell을 전부 open 해야한다.
                    if (cell.dom.textContent === '0'){
                        crushAroundZero(cell);
                    }
                    if(checkEnd() === true) return gameOver(true, interval);  
                });

                // 우클릭에 대한 반응
                dom.addEventListener('contextmenu', function(e){
                    e.preventDefault();
                    if(cell.clicked === true) return;
                    if(cell.flagged){
                        cell.flagged = false;      
                        cell.dom.textContent = '';
                        mineCounter.textContent = parseInt(mineCounter.textContent) + 1;
                    } 
                    else {
                        if(mineCounter.textContent > '0'){
                            cell.flagged = true;
                            cell.dom.textContent = '🚩';
                            mineCounter.textContent = parseInt(mineCounter.textContent) - 1;
                            if(checkEnd() === true){
                                return gameOver(true, interval);
                            } 
                        } 
                        else{
                            alert("지뢰수보다 많은 깃발을 꽂을 수 없어요!");
                        }
                    }
                });
            }
        }
        plantMines();
        
        restartButton.addEventListener('click', function(){
            rows = [];
            for(let i = 0; i < height; i++) {
                let row = document.querySelector('.row');
                gameBoard.removeChild(row);
            }
            if(!timerPause){
                timerPause = true;
                clearInterval(interval);
            }
            initGame();
        });

        function checkEnd(){
            for(let i = 0; i < width; i ++){
                for(let j = 0; j < height; j++){
                    const nowCell = rows[j][i];
                    if(nowCell.isMine){
                        if(!nowCell.flagged) return false;
                    }
                    else if(!nowCell.isMine){
                        if(!nowCell.clicked) return false;
                    }
                }
            }
            return true;
        }
    }

    function gameOver(isWin, interval){
        if(!timerPause){
            timerPause = true;
            clearInterval(interval);
        }
        if(!isWin){
            alert("지뢰가 터져버렸습니다! GameOver!");
            return;
        }
        // 다 깬 경우 if문 추가
        if(isWin){
            alert("지뢰를 전부 제거하는데 성공하였습니다! Clear!");
            return;
        } 
    };


    function getNeighbors(cell){
        const dx = [-1,0,1,-1,1,-1,0,1];
        const dy = [-1,-1,-1,0,0,1,1,1];
        const x = cell.x;
        const y = cell.y;
        const neighbors = []; 

        for(let k = 0; k < 8; k ++){
            let nx = x + dx[k];
            let ny = y + dy[k];
            if (0 <= nx && nx < width && 0 <= ny && ny < height){
                neighbors.push(rows[ny][nx]);
            }
        }
        return neighbors;
    }

    function crushAroundZero(cell){
        const zeroCells = [cell];
        const dx = [-1,0,1,-1,1,-1,0,1];
        const dy = [-1,-1,-1,0,0,1,1,1];
        const visited = [];
        for(let i = 0; i < height; i ++){
            let visited_row = [];
            for(let j = 0; j < width; j ++){
                visited_row.push(false);
            }
            visited.push(visited_row);   
        }
        while(zeroCells.length !== 0){
            const zeroCell = zeroCells.pop();
            const x = zeroCell.x;
            const y = zeroCell.y;
            visited[y][x] = true;
            for(let t = 0; t < 8; t++){
                const nx = x + dx[t];
                const ny = y + dy[t];
                if (0 <= nx && nx < width && 0 <= ny && ny < height){
                    const curCell = rows[ny][nx];
                    if((!curCell.isMine) && curCell.flagged === false ){
                        curCell.dom.textContent = getNeighbors(curCell).filter(neighbor => neighbor.isMine === true).length;
                        curCell.clicked = true;
                        if(visited[ny][nx] === false && curCell.dom.textContent === '0'){
                            zeroCells.push(curCell);
                        }
                    }
                }
            }
        }       
    }

    function plantMines(){
        let count = 0;
        while(count < numberOfMines){
            let randomNumber = Math.trunc((Math.random() * width * height));
            let x = randomNumber % width;
            let y = Math.trunc(randomNumber / width);
            if(rows[y][x].isMine === true) continue;
            rows[y][x].isMine = true;
            count ++;
        }
    }

    initGame();
}

Game();