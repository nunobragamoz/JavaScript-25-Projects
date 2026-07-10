const buttons = document.querySelectorAll('.drum');

function getSound(letter) {

  switch (letter) {
    case 'w':
        return 'sounds/kick-bass.mp3';
    case 'a':
        return 'sounds/snare.mp3';
    case 's':
        return 'sounds/tom-1.mp3';
    case 'd':
        return 'sounds/tom-2.mp3';
    case 'j':
        return 'sounds/tom-3.mp3';
    case 'k':
        return 'sounds/tom-4.mp3';
    case 'l':
        return 'sounds/crash.mp3';
    default:
        return '';   
  }
}

function playDrum(letter) {

    //get Letter and guard against non Letter
  const soundPath = getSound(letter);
  if (!soundPath) return;

  // play sound
  const audio = new Audio(soundPath);
  audio.play();

  // flash the button
  const button = document.querySelector('.' + letter);
  button.classList.add('pressed');
  setTimeout(function() {
    button.classList.remove('pressed');
  }, 100);

}

for (const button of buttons) {

  button.addEventListener('click', function() {
    playDrum(button.classList[0]);
  });

}

document.addEventListener('keydown', function(event) {

  playDrum(event.key);
  
});
