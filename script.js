const challenges = [
    { 
        question: "Dose de 3/8 do frasco. Clique nas gotas e depois responda: Qual fração da dose você selecionou?", 
        total: 8, answer: 3 
    },
    { 
        question: "Dose de 2/5 do frasco. Clique nas gotas e depois responda a fração.", 
        total: 5, answer: 2 
    },
    { 
        question: "Dose de 5/10 do frasco.", 
        total: 10, answer: 5 
    },
    { 
        question: "Dose de 7/12 do frasco.", 
        total: 12, answer: 7 
    },
    { 
        question: "Dose de 4/9 do frasco.", 
        total: 9, answer: 4 
    },
    { 
        question: "Dose de 9/10 do frasco.", 
        total: 10, answer: 9 
    },
    { 
        question: "Dose de 5/6 do frasco.", 
        total: 6, answer: 5 
    },
    { 
        question: "Dose de 3/7 do frasco.", 
        total: 7, answer: 3 
    },
    { 
        question: "Dose de 7/8 do frasco.", 
        total: 8, answer: 7 
    },
    { 
        question: "Dose de 11/12 do frasco.", 
        total: 12, answer: 11 
    }
];
let currentChallenge = 0;
let selected = [];
let score = 0;

const frascoCanvas = document.getElementById('frascoCanvas');
const ctx = frascoCanvas.getContext('2d');
const challengeText = document.getElementById('challengeText');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');
const checkBtn = document.getElementById('checkBtn');
const nextBtn = document.getElementById('nextBtn');
const fractionInput = document.getElementById('fractionInput');

function drawFrasco(total, selectedArr) {
    ctx.clearRect(0, 0, frascoCanvas.width, frascoCanvas.height);

    // desenha o frasco
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(90, 30);
    ctx.lineTo(170, 30);
    ctx.quadraticCurveTo(180, 50, 180, 190);
    ctx.arc(130, 190, 50, 0, Math.PI, true);
    ctx.quadraticCurveTo(80, 190, 80, 30);
    ctx.closePath();
    ctx.fillStyle = "#c9daf6";
    ctx.fill();
    ctx.restore();

    // desenha as gotas dentro do frasco
    for (let i = 0; i < total; i++) {
        let dropX = 130 + 60 * Math.cos(Math.PI + (i+1) * Math.PI / (total+1));
        let dropY = 140 + 35 * Math.sin(Math.PI + (i+1) * Math.PI / (total+1));
        ctx.beginPath();
        ctx.arc(dropX, dropY, 13, 0, 2*Math.PI);
        ctx.fillStyle = selectedArr[i] ? "#13ce66" : "#3878c2";
        ctx.globalAlpha = selectedArr[i] ? 0.95 : 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
        // Detalhe da gota
        ctx.beginPath();
        ctx.arc(dropX+3, dropY-3, 3, 0, 2*Math.PI);
        ctx.fillStyle = "#fff";
        ctx.fill();
    }
}

function startChallenge(index) {
    let ch = challenges[index];
    challengeText.textContent = ch.question;
    selected = Array(ch.total).fill(false);
    drawFrasco(ch.total, selected);
    feedback.textContent = "";
    scoreDisplay.textContent = "Pontos: " + score;
    fractionInput.value = "";
    checkBtn.disabled = false;
    nextBtn.style.display = "none";
}

frascoCanvas.addEventListener('click', function(e) {
    let ch = challenges[currentChallenge];
    let rect = frascoCanvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    for (let i = 0; i < ch.total; i++) {
        let dropX = 130 + 60 * Math.cos(Math.PI + (i+1) * Math.PI / (ch.total+1));
        let dropY = 140 + 35 * Math.sin(Math.PI + (i+1) * Math.PI / (ch.total+1));
        let dx = x - dropX, dy = y - dropY;
        if (dx*dx + dy*dy <= 13*13) {
            selected[i] = !selected[i];
            drawFrasco(ch.total, selected);
            break;
        }
    }
});

checkBtn.addEventListener('click', function() {
    let ch = challenges[currentChallenge];
    let totalSel = selected.filter(Boolean).length;
    let userFrac = fractionInput.value.trim().replace(/\s/g,'');
    let correctFrac = `${ch.answer}/${ch.total}`;
    let correctSel = (totalSel === ch.answer);
    let userCorrect = (userFrac === correctFrac || userFrac === simplifyFrac(totalSel, ch.total));
    if (correctSel && userCorrect) {
        feedback.innerHTML = "🎉 <span style='color:#13ce66'>Correto! Você selecionou a dose e acertou a fração.</span>";
        score += 1;
        scoreDisplay.textContent = "Pontos: " + score;
        frascoCanvas.style.boxShadow = "0 0 14px 4px #13ce66";
        setTimeout(()=>frascoCanvas.style.boxShadow = "0 2px 8px #e4ecf1", 350);
        checkBtn.disabled = true;
        nextBtn.style.display = "inline-block";
    } else if (!correctSel && userCorrect) {
        feedback.innerHTML = "⚠️ <span style='color:#f59e42'>Fração correta, mas quantidade de gotas errada.</span>";
    } else if (correctSel && !userCorrect) {
        feedback.innerHTML = "⚠️ <span style='color:#f59e42'>Quantidade certa, mas fração errada. Reveja sua resposta!</span>";
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
        drawFrasco(10, Array(10).fill(false));
        feedback.textContent = `Pontuação final: ${score}/${challenges.length}`;
        checkBtn.style.display = "none";
        nextBtn.style.display = "none";
    }
});

function simplifyFrac(num, den) {
    function gcd(a, b) { return b ? gcd(b, a % b) : a; }
    let g = gcd(num, den);
    return `${num/g}/${den/g}`;
}

// Inicializa o jogo
startChallenge(0);
