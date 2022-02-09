const canvas = document.querySelector('#canvas-game')
const c = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight
const scoreEL = document.querySelector('#scoreEL')
const startGamebtn = document.querySelector('#button-game')
const modolEL = document.querySelector('#modolEL')
const final_score = document.querySelector('#final-score')
console.log(scoreEL)


class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}
const x = canvas.width /2
const y = canvas.height /2

let player = new Player (x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []
let score = 0

function init(){
    player = new Player (x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
}

class Projectile{
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }

}



window.addEventListener('click', (Event) => {
    const angle = Math.atan2(Event.clientY - canvas.height /2, Event.clientX - canvas.width /2)
    const velocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin (angle) * 6
    }
    projectiles.push(new Projectile(canvas.width /2, canvas.height /2, 4, 'white', velocity))
})

class Enemy{
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }

}


function spawnEnemies(){
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4
        let x
        let y
        if (Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
       
        
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2(canvas.height /2 - y, canvas.width /2 - x)
        if (radius < 10){
            const velocity = {
                x: Math.cos(angle) *3,
                y: Math.sin (angle) *3
            } 
            enemies.push(new Enemy(x, y, radius, color, velocity))
        }else if (radius >=10 && radius < 20){
            const velocity = {
                x: Math.cos(angle) *2,
                y: Math.sin (angle) *2
            } 
            enemies.push(new Enemy(x, y, radius, color, velocity))
        }else{
            const velocity = {
                x: Math.cos(angle),
                y: Math.sin (angle)
            } 
            enemies.push(new Enemy(x, y, radius, color, velocity))
        }
        
    }, 1000)
}

const friction = 0.99

class Particle{
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    draw(){
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    update(){
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }

}

let animationId


function animate(){
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0 , 0, canvas.width, canvas.height)
    player.draw()

    particles.forEach((particle, index) =>{
        particle.update()
        if (particle.alpha <= 0){
            particles.splice(index, 1)
        }
    })

    projectiles.forEach((projectile, index) => {
        projectile.update()

        if (projectile.x - projectile.radius < 0 || 
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius <0 ||
            projectile.y - projectile.radius > canvas.height){
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, index) => {
        enemy.update()
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId)
            modolEL.style.display = 'flex'
            final_score.innerText = score
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
           
            //Projeto toca os inimigos
            if (dist - enemy.radius - projectile.radius < 1){

                

                //Explosões
                for(let i = 0; i < enemy.radius * 2; i++){
                    particles.push(new Particle(
                        projectile.x, 
                        projectile.y, 
                        Math.random() * 2, 
                        enemy.color, 
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 6),
                            y: (Math.random() - 0.5) * (Math.random() * 6)
                        }))
                }

                if (enemy.radius -10 > 5){
                    //Score
                    score +=100
                    scoreEL.innerText = score
                    gsap.to(enemy, {
                        radius: enemy.radius - 10,

                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0) //Flash gone.
                } else {
                    //Score
                    score +=250,
                    scoreEL.innerText = score
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0) //Flash gone.
                }               
            }
        })
    })
}

startGamebtn.addEventListener('click', () =>{
    init()
    animate()
    spawnEnemies()
    
    modolEL.style.display = 'none'
})




