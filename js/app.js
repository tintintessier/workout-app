console.log('Application Train7k prête.');
// Vibration et audio fictifs pour test
if ('vibrate' in navigator) navigator.vibrate(200);
const audio = new Audio('assets/voice.mp3');
document.addEventListener('click', () => audio.play());
