const numbers = [3, 2, 9, 4, 5];
let sum = 0
//  numbers.reduce((acc,curr,index, array)=>{
//     console.log("acc: ",acc)
//     console.log("curr: ",curr)

   
// })
// console.log(sum)
// numbers.reduce((acc,curr,index, array) =>{
//     // console.log(number)
//     // console.log(array(0,3))
//     // console.log(array[array.length-1])
//     array = array.slice(-4,2)
//     console.log(array)
// })
// console.log(numbers.splice(0, 3))
// const nested = [[1, 2], [3, 4], [5]];
// let flatten = nested.map((acc,curr) =>{
//     return acc.concat(curr)

// })
// console.log(flatten)
// nested.concat([]).concat

const fruits = ['apple', 'banana', 'apple', 'orange', 'banana', 'apple'];

// const count = fruits.reduce((acc, fruit) => {
//   acc[fruit] = (acc[fruit] || 0)+1

//   return acc;
// }, {});
// console.log(count)
let person = {}
person["name"] = "abebe"

for(let key in person){
    console.log(person[key])
}