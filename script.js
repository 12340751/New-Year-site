(() => {
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const targetLabel = document.getElementById('target-label');
  const celebration = document.getElementById('celebration');
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const now = new Date();
  const nextYear = now.getFullYear() + 1;
  const target = new Date(nextYear, 0, 1, 0, 0, 0, 0);
  targetLabel.textContent = `${target.toLocaleString()}`;

  function pad(v){return String(v).padStart(2,'0')}

  // previous values for flip detection
  let prev = {
    days: null,
    hours: null,
    minutes: null,
    seconds: null
  };

  let ticking = true;

  function update(){
    const t = Date.now();
    const diff = target.getTime() - t;
    if(diff <= 0){
      daysEl.textContent = '0';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      if(ticking){
        celebrate();
        ticking = false;
      }
      return;
    }
    const s = Math.floor(diff / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    // update with flip animation when changed
    updateNumber(daysEl, d, 'days');
    updateNumber(hoursEl, pad(h), 'hours');
    updateNumber(minutesEl, pad(m), 'minutes');
    updateNumber(secondsEl, pad(sec), 'seconds');
  }

  function updateNumber(el, value, key){
    const str = String(value);
    if(prev[key] === null){
      el.textContent = str;
      prev[key] = str;
      return;
    }
    if(prev[key] !== str){
      // restart animation
      el.classList.remove('flip');
      // force reflow
      void el.offsetWidth;
      el.textContent = str;
      el.classList.add('flip');
      prev[key] = str;
      // remove class after animation
      setTimeout(()=> el.classList.remove('flip'), 600);
    }
  }

  const interval = setInterval(update, 200);
  update();

  // Simple confetti implementation
  const particles = [];
  const colors = ['#ffd166','#06d6a0','#118ab2','#ef476f','#ffd6a5'];

  function rand(min,max){return Math.random()*(max-min)+min}

  function createParticle(x,y){
    return {
      x,y,
      vx: rand(-6,6),
      vy: rand(-12,-4),
      size: rand(6,14),
      color: colors[Math.floor(Math.random()*colors.length)],
      rot: rand(0,Math.PI*2),
      vr: rand(-0.15,0.15),
      life: 0,
      ttl: rand(90,160),
      shape: Math.random()>0.5? 'rect':'circle'
    };
  }

  function launchConfetti(amount=120){
    for(let i=0;i<amount;i++){
      const x = rand(canvas.width*0.2, canvas.width*0.8);
      const y = rand(canvas.height*0.1, canvas.height*0.4);
      particles.push(createParticle(x,y));
    }
  }

  let animating = false;

  function updateParticles(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.life++;
      p.vy += 0.35; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.95;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 14;
      if(p.shape === 'circle'){
        ctx.beginPath();
        ctx.arc(0,0,p.size/2,0,Math.PI*2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      if(p.life > p.ttl || p.y > canvas.height + 50) particles.splice(i,1);
    }
    if(particles.length===0){
      animating = false;
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }
  }

  function animate(){
    if(!animating) return;
    updateParticles();
    requestAnimationFrame(animate);
  }

  function celebrate(){
    celebration.classList.remove('hidden');
    launchConfetti(200);
    if(!animating){animating = true; requestAnimationFrame(animate)}
    // also small repeating bursts
    let bursts = 0;
    const burstInt = setInterval(()=>{
      launchConfetti(40);
      if(!animating){animating = true; requestAnimationFrame(animate)}
      bursts++;
      if(bursts>6) clearInterval(burstInt);
    }, 700);
  }

})();
