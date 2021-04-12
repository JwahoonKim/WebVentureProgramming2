// == 은 전부 === 으로 고쳐야해!!!!!!!!
/* <더 추가해야할 기능>
2. status 관련 3가지 구현해야함
    2) 현재 남은 지뢰 개수
3. 게임 종료조건에 대한 것 구현해야함
    1) 지뢰 클릭해버린 경우 --> 게임보드 핵폭탄 이미지 추가
    2) 게임 성공한 경우
6. 디자인 관련
    1) 깃발 모양
    2) 게임보드 디자인
    3) status 디자인
    4) 기타 명령창, input창 디자인   
*/


function Game(){
    const gameBoard = document.getElementById('gameBoard');
    const mineCounter = document.querySelector('.remainingMine');
    const timer = document.querySelector('#timer');
    const restartButton = document.querySelector('#restartButton input');
    let rows = [];
    let width;
    let height;
    let numberOfMine;
    
    //w, h, 지뢰수 입력 받기 
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
        const interval = setInterval(addSecond, 1000);

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
                    if(cell.isMine) return gameOver(false);

                    cell.clicked = true;
                    const neighbors = getNeighbors(cell);
                    cell.dom.textContent = neighbors.filter(neighbor => neighbor.isMine === true).length;

                    // 클릭한 곳 주변 지뢰가 0개라면 9개 방향 cell을 전부 open 해야한다.
                    if (cell.dom.textContent === '0'){
                        crushAroundZero(cell);
                    }  
                });

                // 우클릭에 대한 반응
                dom.addEventListener('contextmenu', function(e){
                    e.preventDefault();
                    if(cell.clicked === true) return;
                    if(cell.flagged){
                        cell.flagged = false;      
                        cell.dom.textContent = '';
                        // if(numberOfMines < width * height) numberOfMines ++;
                    } 
                    else {
                        cell.flagged = true;
                        cell.dom.textContent = 'P';
                        // if(numberOfMines > 0) numberOfMines --;
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
            clearInterval(interval);
            initGame();
        });

    }

    function gameOver(isWin){
        if(!isWin){
            alert("지뢰가 터져버렸습니다!");
        }
        // 다 깬 경우 if문 추가
        if(isWin){
            alert.log(`지뢰를 전부 제거하는데 성공하였습니다! 걸린 시간은 ${seconds}초!`)
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
                    if(!curCell.isMine){
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