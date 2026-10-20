// Eklavya games: slug matches the deployed folder name and the screenshot file
const GAME_BASE = 'https://content.dev.eklavya.me/devek.designer/'
const GAMES = [
    { slug: 'penguin-count', name: 'Penguin Count', topic: 'Counting' },
    { slug: 'number-express', name: 'Number Express', topic: 'Addition' },
    { slug: 'sky-balloon-quest', name: 'Sky Balloon Quest', topic: 'Addition' },
    { slug: 'bridge-the-sum', name: 'Bridge the Sum', topic: 'Sums' },
    { slug: 'number-climb', name: 'Number Climb', topic: 'Comparing numbers' },
    { slug: 'hungry-monsters', name: 'Hungry Monsters', topic: 'Multiplication' },
    { slug: 'division-derby', name: 'Division Derby', topic: 'Division' },
    { slug: 'math-munch', name: 'Math Munch', topic: 'Prime numbers' },
    { slug: 'tracing-game', name: 'Tracing Game', topic: 'Letter tracing' },
]

const gameUrl = (game) => `${GAME_BASE}${game.slug}-phaser/index.html`

// render the games grid
const grid = document.getElementById('games-grid')
GAMES.forEach((game, index) => {
    const tile = document.createElement('button')
    tile.className = 'game-tile'
    tile.style.setProperty('--i', index)
    tile.innerHTML = `
        <span class="game-thumb">
            <img src="images/games/${game.slug}.webp" alt="" loading="lazy" />
            <span class="play-badge"><i class="fa-solid fa-play"></i></span>
        </span>
        <span class="game-info">
            <span class="game-topic">${game.topic}</span>
            <span class="game-name">${game.name}</span>
        </span>`
    tile.addEventListener('click', () => openGame(game))
    grid.appendChild(tile)
})

// game modal
const dialog = document.getElementById('game-dialog')
const frame = document.getElementById('game-frame')
const title = document.getElementById('game-title')
const newTab = document.getElementById('game-newtab')
let currentGame = null

function openGame(game) {
    currentGame = game
    title.textContent = game.name
    frame.title = `${game.name}, an Eklavya.Me game`
    frame.classList.remove('loaded')
    frame.src = gameUrl(game)
    newTab.href = gameUrl(game)
    if (!dialog.open) dialog.showModal()
}

function randomGame() {
    const choices = GAMES.filter((game) => game !== currentGame)
    return choices[Math.floor(Math.random() * choices.length)]
}

function closeGame() {
    dialog.close()
}

dialog.addEventListener('close', () => {
    // unload the game so its audio stops
    frame.src = 'about:blank'
    currentGame = null
})
frame.addEventListener('load', () => {
    if (frame.src !== 'about:blank') frame.classList.add('loaded')
})
dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeGame()
})

document.getElementById('play-random').addEventListener('click', () => openGame(randomGame()))
document.getElementById('game-shuffle').addEventListener('click', () => openGame(randomGame()))
document.getElementById('game-close').addEventListener('click', closeGame)

// ---------- rollable d20 ----------
const dice = document.getElementById('dice')
const diceNumber = document.getElementById('dice-number')
const diceResult = document.getElementById('dice-result')
let audioContext = null
let rolling = false
let hideResult = null

// a short wooden clack, made with Web Audio so no sound files are needed
function clack(volume = 0.2) {
    try {
        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)()
        const length = 0.05
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * length, audioContext.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 4)
        const source = audioContext.createBufferSource()
        const filter = audioContext.createBiquadFilter()
        const gain = audioContext.createGain()
        filter.type = 'bandpass'
        filter.frequency.value = 900 + Math.random() * 900
        gain.gain.value = volume
        source.buffer = buffer
        source.connect(filter).connect(gain).connect(audioContext.destination)
        source.start()
    } catch {
        // audio is optional
    }
}

function rollMessage(value) {
    if (value === 20) return 'Natural 20! Critical success.'
    if (value === 1) return 'Natural 1. Critical fail.'
    if (value >= 15) return `You rolled ${value}. Nice roll!`
    if (value >= 8) return `You rolled ${value}.`
    return `You rolled ${value}. Ouch.`
}

function rollDice() {
    if (rolling) return
    rolling = true
    const value = Math.floor(Math.random() * 20) + 1
    clearTimeout(hideResult)
    diceResult.classList.remove('show', 'crit', 'fail')
    dice.classList.remove('crit', 'fail')
    dice.classList.add('rolling')

    // flick through random faces while it tumbles, slowing down at the end
    const steps = 12
    for (let step = 0; step < steps; step++) {
        setTimeout(() => {
            diceNumber.textContent = Math.floor(Math.random() * 20) + 1
            if (step % 3 === 0) clack(0.12)
        }, Math.pow(step / steps, 1.6) * 1000)
    }

    setTimeout(() => {
        diceNumber.textContent = value
        dice.classList.remove('rolling')
        clack(0.3)
        if (value === 20) dice.classList.add('crit')
        if (value === 1) dice.classList.add('fail')
        diceResult.textContent = rollMessage(value)
        diceResult.classList.add('show')
        if (value === 20) diceResult.classList.add('crit')
        if (value === 1) diceResult.classList.add('fail')
        rolling = false
        hideResult = setTimeout(() => diceResult.classList.remove('show'), 4000)
    }, 1100)
}

dice.addEventListener('click', rollDice)

// ---------- fade sections in as they scroll into view ----------
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add('visible')
            revealObserver.unobserve(entry.target)
        })
    },
    { threshold: 0.12 },
)
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element))
