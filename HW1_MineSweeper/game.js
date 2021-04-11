// == 은 전부 === 으로 고쳐야해!!!!!!!!
/* <더 추가해야할 기능>
1. 지뢰를 무작위로 심어야함
2. status 관련 3가지 구현해야함
    1) restart
    2) 현재 남은 지뢰 개수
    3) 타이머
3. 게임 종료조건에 대한 것 구현해야함
    1) 지뢰 클릭해버린 경우
    2) 게임 성공한 경우
4. x, y, z값 입력 받아서 게임실행하도록 해야함
5. x, y, z값이 valid한 값인지 체크해야함
6. 디자인 관련
    1) 깃발 모양
    2) 게임보드 디자인
    3) status 디자인
    4) 기타 명령창, input창 디자인   
*/


function startGame(){
    const gameBoard = document.getElementById('gameBoard');
    const rows = [];
    const width = 30;
    const height = 30;

    function initGame(width, height, numberOfMines) {
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
                    isMine : 0.1 > Math.random()// 수정 필요 
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
                    } 
                    else {
                        cell.flagged = true;
                        cell.dom.textContent = 'P';
                    }
                });
            }
        }
    }

    function gameOver(isWin){
        if(!isWin){
            console.log("지뢰가 터져버렸습니다!");
        }
        // 다 깬 경우 if문 추가
        if(isWin){
            console.log("지뢰를 전부 제거하는데 성공하였습니다!")
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
            visited_row = [];
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

    initGame(width, height, 5);
}

startGame();