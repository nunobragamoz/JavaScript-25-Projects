const rockBtn = document.getElementById('rockBtn');
const paperBtn = document.getElementById('paperBtn');
const scissorsBtn = document.getElementById('scissorsBtn');
const resetBtn = document.getElementById('resetBtn');

const playerChoice = document.getElementById('playerChoice');
const computerChoice = document.getElementById('computerChoice');
const scoreDisplay = document.getElementById('scoreDisplay');
const resultText = document.getElementById('resultText');

let playerScore = 0;
let computerScore = 0;

function getComputerChoice() {

    const choices = ['rock', 'paper', 'scissors'];

    const randomIndex = Math.floor(Math.random() * 3);

    return choices[randomIndex];
}

function determineWinner(player, computer) {

    if (player === computer) {

        return 'tie';

    } else if (

        (player === 'rock' && computer === 'scissors') || 
        (player === 'paper' && computer === 'rock') ||
        (player === 'scissors' && computer === 'paper') 

    ) {

        return 'win';

    } else {

        return 'lose';
    }

}

function playRound(player) {

  const computer = getComputerChoice();
  const result = determineWinner(player, computer);

  playerChoice.textContent = player;
  computerChoice.textContent = computer;

  if (result === 'win') {

    resultText.textContent = 'You win! 🎉';
    playerScore += 1;

  } else if (result === 'tie') {

    resultText.textContent = "It's a tie! 🤝";
    

  } else {

    resultText.textContent = 'You lose! 😢';
    computerScore += 1;
  }

  scoreDisplay.textContent = `Player Score: ${playerScore} | Computer Score: ${computerScore}`;

}

function resetGame() {

    playerScore = 0;
    computerScore = 0;

    scoreDisplay.textContent = `Player Score: ${playerScore} | Computer Score: ${computerScore}`;
    playerChoice.textContent = 'None';
    computerChoice.textContent = 'None';
    resultText.textContent = '';

    console.log(playerScore === 0 && computerScore === 0 ? 'Game reset ✅' : 'Reset failed ❌');

}

rockBtn.addEventListener('click', () => playRound('rock'));
paperBtn.addEventListener('click', () => playRound('paper'));
scissorsBtn.addEventListener('click', () => playRound('scissors'));
resetBtn.addEventListener('click', resetGame);


