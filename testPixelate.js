const canvas = document.getElementById('mainPanel');
const ctx = canvas.getContext('2d');

function init() {
  ctx.beginPath();
  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, 500, 500);
  ctx.closePath();
}

init();
