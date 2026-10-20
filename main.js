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
    { slug: 'hungry-puppy-decimals', name: 'Hungry Puppy Decimals', topic: 'Decimals' },
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
            <span class="game-name">${game.name}</span>
            <span class="game-topic">${game.topic}</span>
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
dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeGame()
})

document.getElementById('play-random').addEventListener('click', () => openGame(randomGame()))
document.getElementById('game-shuffle').addEventListener('click', () => openGame(randomGame()))
document.getElementById('game-close').addEventListener('click', closeGame)

// twinkling starfield background
const canvas = document.getElementById('stars')
const ctx = canvas.getContext('2d')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const COLORS = ['#ffffff', '#3be8ff', '#ff4fa3', '#ffd23b']
let stars = []

function resizeStars() {
    const ratio = window.devicePixelRatio || 1
    canvas.width = window.innerWidth * ratio
    canvas.height = window.innerHeight * ratio
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    const count = Math.round((window.innerWidth * window.innerHeight) / 9000)
    stars = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() < 0.85 ? 1 : 2,
        speed: 0.05 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))
}

function drawStars(time) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    for (const star of stars) {
        if (!reduceMotion) {
            star.y += star.speed
            if (star.y > window.innerHeight) star.y = 0
        }
        ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(time / 900 + star.phase))
        ctx.fillStyle = star.color
        ctx.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size)
    }
    if (!reduceMotion) requestAnimationFrame(drawStars)
}

resizeStars()
window.addEventListener('resize', resizeStars)
requestAnimationFrame(drawStars)
