/* ================================================
   Koningsspelen Kroontjes – app.js
   ================================================ */

(function () {
    'use strict';

    /* ──────────────────────────────────────────────
       CHALLENGE-DATA
    ────────────────────────────────────────────── */
    const CHALLENGES = [
        {
            id: 1,
            title: 'Potloodbalans',
            instruction: 'Balanceer een potlood op één vinger.',
            rule: 'Laat je het potlood vallen? Dan ben je af.'
        },
        {
            id: 2,
            title: 'Knieënhoek',
            instruction: 'Zak door je knieën alsof je op een onzichtbare stoel zit.',
            rule: 'Kom je omhoog of verlies je je houding? Dan ben je af.'
        },
        {
            id: 3,
            title: 'Flamingodraai',
            instruction: 'Ga op één been staan en draai heel langzaam een rondje.',
            rule: 'Zet je je voet neer of verlies je je evenwicht? Dan ben je af.'
        },
        {
            id: 4,
            title: 'Ogen Dicht',
            instruction: 'Ga op één been staan met je ogen dicht.',
            rule: 'Zet je je voet neer of ga je wiebelen? Dan ben je af.'
        },
        {
            id: 5,
            title: 'Kroonhouding',
            instruction: 'Leg een gum, propje papier of ander klein voorwerp op je hoofd.',
            rule: 'Valt het eraf? Dan ben je af.'
        },
        {
            id: 6,
            title: 'Koninklijke Neus',
            instruction: 'Klem een potlood tussen je neus en bovenlip.',
            rule: 'Laat je het vallen? Dan ben je af.'
        },
        {
            id: 7,
            title: 'Lach Niet',
            instruction: 'Kijk naar voren en probeer niet te lachen.',
            rule: 'Lach, grijns of giechel je? Dan ben je af.'
        },
        {
            id: 8,
            title: 'Spiegeltekenen',
            instruction: 'Teken met je niet-schrijfhand een kroon.',
            rule: 'De leerkracht kiest de grappigste, mooiste of meest koninklijke tekening.'
        },
        {
            id: 9,
            title: 'Koninklijk Portret',
            instruction: 'Teken in korte tijd een koning of koningin.',
            rule: 'De leerkracht kiest het leukste portret.'
        },
        {
            id: 10,
            title: 'Sing-It!',
            instruction: 'Wie kan als eerste een liedje zingen met het woord koning, koningin, king of queen erin?',
            rule: 'Wie als eerste een goed voorbeeld zingt, wint deze challenge.'
        }
    ];

    /* ──────────────────────────────────────────────
       STAAT
    ────────────────────────────────────────────── */
    const usedIds = new Set();
    let activeChallenge = null;

    /* ──────────────────────────────────────────────
       DOM-REFERENTIES
    ────────────────────────────────────────────── */
    const $ = id => document.getElementById(id);

    const mainScreen        = $('kks-main-screen');
    const grid              = $('kks-grid');
    const challengeScreen   = $('kks-challenge-screen');
    const challengeBadge    = $('kks-challenge-badge');
    const challengeTitle    = $('kks-challenge-title');
    const challengeInstr    = $('kks-challenge-instruction');
    const challengeRule     = $('kks-challenge-rule');
    const backBtn           = $('kks-back-btn');
    const endScreen         = $('kks-end-screen');
    const restartBtn        = $('kks-restart-btn');
    const confettiContainer = $('kks-confetti');

    /* ──────────────────────────────────────────────
       KROON SVG
       ViewBox 0 0 100 90
       Punten:  bottom-left  (5,82)
                outer-left   (5,42)
                valley-left  (30,58)
                center-peak  (50,14)   ← hoogste punt
                valley-right (70,58)
                outer-right  (95,42)
                bottom-right (95,82)
    ────────────────────────────────────────────── */
    function makeCrownSVG(num) {
        const label = String(num);
        const fontSize = label.length > 1 ? '17' : '22';

        return `<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg"
                     aria-hidden="true" focusable="false">

            <!-- Schaduw -->
            <polygon points="5,82 5,42 30,58 50,14 70,58 95,42 95,82"
                     fill="rgba(0,0,0,0.10)" transform="translate(2,3)"/>

            <!-- Kroontjeslichaam -->
            <polygon points="5,82 5,42 30,58 50,14 70,58 95,42 95,82"
                     fill="#FF8C00" stroke="#CC5A00" stroke-width="1.5"
                     stroke-linejoin="round"/>

            <!-- Bovenste glanslaag -->
            <polygon points="30,58 50,14 70,58 60,42 50,20 40,42"
                     fill="rgba(255,255,255,0.18)"/>

            <!-- Basisband -->
            <rect x="5" y="66" width="90" height="17" rx="5" fill="#CC5A00"/>

            <!-- Edelstenen op band -->
            <circle cx="50" cy="74.5" r="7"   fill="#FFD700" stroke="#FFBD00" stroke-width="1.2"/>
            <circle cx="26" cy="74.5" r="5"   fill="#FF4455"/>
            <circle cx="74" cy="74.5" r="5"   fill="#3399FF"/>

            <!-- Gouden bolletjes op pieken -->
            <circle cx="50" cy="14" r="5.5"   fill="#FFD700" stroke="#FFBD00" stroke-width="1"/>
            <circle cx="5"  cy="42" r="4"     fill="#FFD700" stroke="#FFBD00" stroke-width="0.8"/>
            <circle cx="95" cy="42" r="4"     fill="#FFD700" stroke="#FFBD00" stroke-width="0.8"/>

            <!-- Nummer -->
            <text x="50" y="46"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  fill="white"
                  font-size="${fontSize}"
                  font-weight="900"
                  font-family="'Arial Black', 'Arial Bold', Arial, sans-serif"
                  stroke="#CC5A00"
                  stroke-width="0.4"
                  paint-order="stroke fill">${label}</text>
        </svg>`;
    }

    /* ──────────────────────────────────────────────
       RENDER GRID
    ────────────────────────────────────────────── */
    function renderGrid() {
        grid.innerHTML = '';

        CHALLENGES.forEach((challenge, index) => {
            const used = usedIds.has(challenge.id);

            /* Knop */
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'kks-crown-btn' + (used ? ' kks-used' : '');
            btn.setAttribute(
                'aria-label',
                `Challenge ${challenge.id}: ${challenge.title}${used ? ' – al gespeeld' : ''}`
            );
            btn.style.animationDelay = `${index * 0.05}s`;
            if (used) btn.disabled = true;

            /* SVG wrapper */
            const wrap = document.createElement('div');
            wrap.className = 'kks-svg-wrap';
            wrap.innerHTML = makeCrownSVG(challenge.id);

            /* Vinkje bij gebruikte kroon */
            if (used) {
                const check = document.createElement('div');
                check.className = 'kks-check';
                check.setAttribute('aria-hidden', 'true');
                check.textContent = '✓';
                wrap.appendChild(check);
            }

            btn.appendChild(wrap);
            if (!used) {
                btn.addEventListener('click', () => openChallenge(challenge));
            }

            grid.appendChild(btn);
        });
    }

    /* ──────────────────────────────────────────────
       CHALLENGE OPENEN
    ────────────────────────────────────────────── */
    function openChallenge(challenge) {
        activeChallenge = challenge;

        challengeBadge.textContent   = `Challenge ${challenge.id}`;
        challengeTitle.textContent   = challenge.title;
        challengeInstr.textContent   = challenge.instruction;
        challengeRule.textContent    = challenge.rule;

        mainScreen.classList.add('kks-hidden');
        challengeScreen.classList.remove('kks-hidden');
        backBtn.focus();
    }

    /* ──────────────────────────────────────────────
       TERUG NAAR OVERZICHT
    ────────────────────────────────────────────── */
    function goBack() {
        if (activeChallenge) {
            usedIds.add(activeChallenge.id);
            activeChallenge = null;
        }

        challengeScreen.classList.add('kks-hidden');

        if (usedIds.size === CHALLENGES.length) {
            showEndScreen();
        } else {
            mainScreen.classList.remove('kks-hidden');
            renderGrid();
        }
    }

    /* ──────────────────────────────────────────────
       EINDSCHERM
    ────────────────────────────────────────────── */
    function showEndScreen() {
        endScreen.classList.remove('kks-hidden');
        spawnConfetti();
        restartBtn.focus();
    }

    /* ──────────────────────────────────────────────
       OPNIEUW STARTEN
    ────────────────────────────────────────────── */
    function restart() {
        usedIds.clear();
        activeChallenge = null;
        confettiContainer.innerHTML = '';
        endScreen.classList.add('kks-hidden');
        mainScreen.classList.remove('kks-hidden');
        renderGrid();
    }

    /* ──────────────────────────────────────────────
       CONFETTI
    ────────────────────────────────────────────── */
    const CONFETTI_COLORS = [
        '#FF8C00', '#FFD700', '#FF4455', '#3399FF',
        '#FF69B4', '#66CC66', '#FF6B6B', '#FFC200',
        '#AA44FF', '#00CCAA'
    ];

    function spawnConfetti() {
        for (let i = 0; i < 70; i++) {
            const piece = document.createElement('div');
            piece.className = 'kks-confetti-piece';

            const size = Math.random() * 10 + 6;          // 6–16 px
            const isCircle = Math.random() > 0.5;
            const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
            const duration = Math.random() * 2.5 + 2;     // 2–4.5 s
            const delay = Math.random() * 3;              // 0–3 s

            piece.style.cssText = `
                left: ${Math.random() * 100}%;
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                border-radius: ${isCircle ? '50%' : '2px'};
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
            `;
            confettiContainer.appendChild(piece);
        }
    }

    /* ──────────────────────────────────────────────
       EVENT LISTENERS
    ────────────────────────────────────────────── */
    backBtn.addEventListener('click', goBack);
    restartBtn.addEventListener('click', restart);

    /* Escape-toets sluit challenge-scherm */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !challengeScreen.classList.contains('kks-hidden')) {
            goBack();
        }
    });

    /* ──────────────────────────────────────────────
       START
    ────────────────────────────────────────────── */
    renderGrid();

})();
