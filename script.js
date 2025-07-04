const challenges = [
    { question: "Dose de 3/8 do frasco. Clique nas gotas para adicioná-las ao potinho!", total: 8, answer: 3 },
    { question: "Dose de 2/5 do frasco.", total: 5, answer: 2 },
    { question: "Dose de 5/10 do frasco.", total: 10, answer: 5 },
    { question: "Dose de 7/12 do frasco.", total: 12, answer: 7 },
    { question: "Dose de 4/9 do frasco.", total: 9, answer: 4 },
    { question: "Dose de 9/10 do frasco.", total: 10, answer: 9 },
    { question: "Dose de 5/6 do frasco.", total: 6, answer: 5 },
    { question: "Dose de 3/7 do frasco.", total: 7, answer: 3 },
    { question: "Dose de 7/8 do frasco.", total: 8, answer: 7 },
    { question: "Dose de 11/12 do frasco.", total: 12, answer: 11 }
];

let currentChallenge = 0;
let drops = [];
let falling = [];
let collected = 0;
let animating = false;
let score = 0;

const frascoCanvas = document.getElementById('frascoCanvas');
const ctx = frascoCanvas.getContext('2d');
const challengeText = document.getElementById('challengeText');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');
const checkBtn = document.getElementById('checkBtn');
const nextBtn = document.getElementById('nextBtn');
const fractionInput = document.getElementById('fractionInput');

function drawFrasco(total, drops, falling, collected) {
    ctx.clearRect(0, 0, frascoCanvas.width, frascoCanvas.height);

    // Desenha potinho
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(130, 290, 54, 18, 0, 0, 2 * Math.PI);
    ctx.fillStyle = "#d1c9be";
    ctx.fill();
    ctx.restore();
    // Parte de cima do potinho (para efeito)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(130, 275, 44, 12, 0, 0, 2 * Math.PI);
    ctx.fillStyle = "#ebe1d7";
    ctx.fill();
    ctx.restore();

    // Desenha gotas já coletadas no potinho
    for (let i = 0; i < collected; i++) {
        let cx = 100 + (i % 7) * 15 + Math.floor(i / 7) * 5;
        let cy = 282 + Math.floor(i / 7) * 8;
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
        ctx.fillStyle = "#13ce66";
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#bbb";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Desenha frasco de remédio
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(90, 50);
    ctx.lineTo(170, 50);
    ctx.quadraticCurveTo(180, 70, 180, 190);
    ctx.arc(130, 190, 50, 0, Math.PI, true);
    ctx.quadraticCurveTo(80, 190, 80, 50);
    ctx.closePath();
    ctx.fillStyle = "#c9daf6";
    ctx.fill();
    ctx.restore();

    // Gotas dentro do frasco
    for (let i = 0; i < drops.length; i++) {
        if (!drops[i].collected && !drops[i].falling) {
            ctx.beginPath();
            ctx.arc(drops[i].x, drops[i].y, 13, 0, 2 * Math.PI);
            ctx.fillStyle = "#3878c2";
            ctx.globalAlpha = 0.88;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
            // Detalhe da gota
            ctx.beginPath();
            ctx.arc(drops[i].x + 3, drops[i].y - 3, 3, 0, 2 * Math.PI);
            ctx.fillStyle = "#fff";
            ctx.fill();
        }
    }

    // Gotas caindo
    for (let i = 0; i < drops.length; i++) {
        if (drops[i].falling) {
            ctx.beginPath();
            ctx.arc(drops[i].fx, drops[i].fy, 13, 0, 2 * Math.PI);
            ctx.fillStyle = "#13ce66";
            ctx.globalAlpha = 0.93;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
            // Detalhe da gota
            ctx.beginPath();
            ctx.arc(drops[i].fx + 3, drops[i].fy - 3, 3, 0, 2 * Math.PI);
            ctx.fillStyle = "#fff";
            ctx.fill();
        }
    }
}

function setupDrops(total) {
    drops = [];
    let angleStart = Math.PI + 0.25, angleEnd = 2 * Math.PI - 0.25;
    for (let i = 0; i < total; i++) {
        let angle = angleStart + (angleEnd - angleStart) * (i / (total - 1));
        let x = 130 + 58 * Math.cos(angle);
        let y = 140 + 45 * Math.sin(angle);
        drops.push({
            x, y, fx: x, fy: y, falling: false, collected: false
        });
    }
}

function startChallenge(index) {
    let ch = challenges[index];
    challengeText.textContent = ch.question;
    collected = 0;
    setupDrops(ch.total);
    feedback.textContent = "";
    scoreDisplay.textContent = "Pontos: " + score;
    fractionInput.value = "";
    checkBtn.disabled = false;
    nextBtn.style.display = "none";
    animating = false;
    drawFrasco(ch.total, drops, falling, collected);
}

frascoCanvas.addEventListener('click', function(e) {
    if (animating) return; // Evita clicks enquanto animação ocorre
    let ch = challenges[currentChallenge];
    let rect = frascoCanvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    for (let i = 0; i < drops.length; i++) {
        if (drops[i].collected || drops[i].falling) continue;
        let dx = x - drops[i].x, dy = y - drops[i].y;
        if (dx*dx + dy*dy <= 13*13) {
            drops[i].falling = true;
            animateDrop(i, ch.total);
            break;
        }
    }
});

function animateDrop(idx, total) {
    animating = true;
    let drop = drops[idx];
    let targetX = 100 + (collected % 7) * 15 + Math.floor(collected / 7) * 5;
    let targetY = 282 + Math.floor(collected / 7) * 8;
    let steps = 18;
    let step = 0;
    let dx = (targetX - drop.x) / steps;
    let dy = (targetY - drop.y) / steps;

    function anim() {
        drop.fx += dx;
        drop.fy += dy;
        drawFrasco(total, drops, falling, collected);
        step++;
        if (step < steps) {
            requestAnimationFrame(anim);
        } else {
            drop.falling = false;
            drop.collected = true;
            drop.fx = drop.x;
            drop.fy = drop.y;
            collected++;
            drawFrasco(total, drops, falling, collected);
            animating = false;
        }
    }
    anim();
}

checkBtn.addEventListener('click', function() {
    let ch = challenges[currentChallenge];
    let result = Number(fractionInput.value.replace(",", "."));
    let correct = ch.answer / ch.total;
    let precision = 0.001;
    let selectedCount = collected;
    if (
        selectedCount === ch.answer &&
        Math.abs(result - correct) <= precision
    ) {
        feedback.innerHTML = "🎉 <span style='color:#13ce66'>Correto! Dose exata e valor da fração certo.</span>";
        score += 1;
        scoreDisplay.textContent = "Pontos: " + score;
        frascoCanvas.style.boxShadow = "0 0 14px 4px #13ce66";
        setTimeout(()=>frascoCanvas.style.boxShadow = "0 2px 8px #e4ecf1", 350);
        checkBtn.disabled = true;
        nextBtn.style.display = "inline-block";
    } else if (selectedCount !== ch.answer && Math.abs(result - correct) <= precision) {
        feedback.innerHTML = "⚠️ <span style='color:#f59e42'>Valor da fração correto, mas quantidade de gotas errada.</span>";
    } else if (selectedCount === ch.answer && Math.abs(result - correct) > precision) {
        feedback.innerHTML = "⚠️ <span style='color:#f59e42'>Quantidade certa, mas valor da fração errado.</span>";
    } else {
        feedback.innerHTML = "⛔ <span style='color:#e24d4d'>Errou. Tente de novo!</span>";
    }
});

nextBtn.addEventListener('click', function() {
    currentChallenge++;
    if (currentChallenge < challenges.length) {
        startChallenge(currentChallenge);
    } else {
        challengeText.textContent = "Parabéns! Você concluiu todos os desafios!";
        ctx.clearRect(0, 0, frascoCanvas.width, frascoCanvas.height);
        feedback.textContent = `Pontuação final: ${score}/${challenges.length}`;
        checkBtn.style.display = "none";
        nextBtn.style.display = "none";
    }
});

// Inicializa o jogo
startChallenge(0);
