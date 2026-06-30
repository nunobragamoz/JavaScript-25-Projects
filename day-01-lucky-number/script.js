const numberDisplay = document.getElementById('luckyNumber');
const statusText = document.getElementById('status');

const generateBtn = document.getElementById('generateBtn');
const historyList = document.getElementById('history');


function generateLuckyNumber() {

let luckyNumber = Math.floor(Math.random() * 100) + 1;

console.log(luckyNumber);

numberDisplay.textContent = luckyNumber; 

let message = '';

if (luckyNumber > 50) {
    message = `${luckyNumber} is a 🔥 hot number!`;
} else {
    message = `${luckyNumber} is a ❄️ cold number!`;
}

statusText.textContent = message;

historyList.innerHTML = `<li class="list-group-item">Your number was ${luckyNumber}!</li>` + historyList.innerHTML;

}

generateBtn.addEventListener('click', generateLuckyNumber);