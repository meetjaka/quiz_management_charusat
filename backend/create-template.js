const xlsx = require('xlsx');

// Create sample data with email and password
const sampleData = [
  { email: "john.doe@charusat.edu.in", password: "temp123456" },
  { email: "jane.smith@charusat.edu.in", password: "coord123456" },
  { email: "mike.wilson@charusat.edu.in", password: "student123" },
  { email: "sarah.brown@charusat.edu.in", password: "temp789012" }
];

// Create worksheet and workbook
const worksheet = xlsx.utils.json_to_sheet(sampleData);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Users");

// Write Excel file
xlsx.writeFile(workbook, 'bulk_users_template.xlsx');
console.log('✅ Excel template created: bulk_users_template.xlsx');