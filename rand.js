const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()~?"

let str = ''

for(let i = 0; i <= 15; i++){
    const randIndex = Math.floor(Math.random() * char.length)
    str += char[randIndex]
}
console.log(str)