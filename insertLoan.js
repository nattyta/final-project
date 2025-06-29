const mongoose = require('mongoose');
const { loanModel } = require('./model/loanModel'); // Adjust path if necessary

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/librarydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  try {
    // Insert an overdue loan (due date in the past, not returned)
    await loanModel.create({
      userId: ['685dd5d751392eb50a355582'],
      bookId: '685dd71751392eb50a355585',
      issueDate: new Date('2025-06-10T00:00:00Z'),
      dueDate: new Date('2025-06-15T00:00:00Z'),
      returned: false
    });

    console.log('✅ Overdue loan record inserted successfully');
  } catch (error) {
    console.error('❌ Error inserting loan record:', error.message);
  } finally {
    mongoose.connection.close();
  }
}).catch(err => {
  console.error('❌ Database connection error:', err.message);
});
