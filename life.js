let gameInterval = null;

const scrn = document.getElementById("leif");

//Randomly returns an integer in a desired range.
function randRange(min, max){
	const rand = Math.random();
	const rangeVal = rand * (max - min);
	return Math.trunc(rangeVal + min);	
}

//Creates an empty board of desired dimensions.
function createBoard(height, width){
	if (!height || !width) return undefined;
	return Array(height).fill().map(() => Array(width).fill(0));
}

//Randomly fills in a board with random life/non-life values.
function randomFill(board){
	for (let i = 0; i < board.length; i++){
		for (let j = 0; j < board[0].length; j++){
			board[i][j] = randRange(0,2);
		}
	}		
}

//Creates a string representation of the life board.
function stringifyBoard(b){
	let buff = [];
	const chrs = [' ', '#'];
	for (let i = 0; i < b.length; i++){
		buff.push('|');
		for (let j = 0; j < b[0].length; j++){
			buff.push(chrs[b[i][j] % 2]);
			buff.push('|');	
		}
		buff.push('\n');
	}	
	return buff.join('');
}

//Counts up the number of living neighbors for a given spot.
function countAliveNeighbors(board, row, col){
	const height = board.length;
	const width = board[0].length;
	const offsets = [
		-1, -1,
		-1, 0,
		-1, 1,
		0, -1,
		0, 1,
		1, -1,
		1, 0,
		1, 1,
	];

	let total = 0;
	
	for (let i = 0; i < 16; i += 2){
		const rowAtt = row + offsets[i];
		const colAtt = col + offsets[i + 1];

		//If position at offset is valid, 
		// it adds to total based on liveness.
		if (rowAtt > -1 && rowAtt < height 
			&& colAtt > -1 && colAtt < width){
			total += (board[rowAtt][colAtt] % 2);	
		}	
	}	

	return total;
}

//Updates game board by filling in 
// the next one based on the current one.
function update(curr, next){
	if (curr.length != next.length || curr[0].length != next[0].length) {
		return undefined;
	}

	for (let i = 0; i < curr.length; i++){
		for (let j = 0; j < curr[0].length; j++){
			const count = countAliveNeighbors(curr, i, j);
			const isAlive = curr[i][j] === 1;
			const alive = 1;
			const dead = 0;
		
			//If fewer than 2 neighbors, die of lonliness.
			if (isAlive && count < 2){
				next[i][j] = dead;
			}				

			//If 2 or 3 neighbors and alive, stay alive.
			else if (isAlive && (count === 2 || count === 3)){
				next[i][j] = alive;
			}	

			//If more than 3 neighbors and alive, die of overpopulation.
			else if (isAlive && count > 3){
				next[i][j] = dead;
			}
			
			//If dead cell and 3 neighbors, baby spawns.
			else if (!isAlive && count === 3){
				next[i][j] = alive;
			}

			else{
				next[i][j] = dead;
			}

	
		}
	}

}

function main(){
	const height = randRange(1, 64);
	const width = randRange(1, 64);
	let curr = createBoard(height, width);
	let next = createBoard(height, width);
	randomFill(curr);
	let generation = 1;

	gameInterval = setInterval(
		() => {
			scrn.innerText = `Generation:${generation}\n${stringifyBoard(curr)}`;	
			update(curr, next);
			let tmp = curr;
			curr = next;
			next = tmp ; 
			generation++;
		}
	, 200);

}

//Resets the life game when restart button pressed.
document.getElementById("restart").addEventListener("click", () => {
	clearInterval(gameInterval);
	main();
});

//Stops game when stop button pressed.
document.getElementById("stop").addEventListener("click", () => {
	clearInterval(gameInterval);
});

//Stops game when stop button pressed.
document.getElementById("clear").addEventListener("click", () => {
	scrn.innerText = "";		
});

main();

