function calculateFine(dueDate, returnDate, ){
    const baseFee = 50
 const miliSecondPerDay = 1000 * 60 * 60 * 24
 const overdueDays = Math.floor((returnDate - dueDate)/miliSecondPerDay)

 if(overdueDays <= 0){
    return 0;
 }

 const rate = 0.02;
 const fee = baseFee * Math.pow(1 + rate, overdueDays);
 console.log("💰 Calculated fee:", fee);

 return parseFloat(fee.toFixed(3))
}

module.exports = { calculateFine }