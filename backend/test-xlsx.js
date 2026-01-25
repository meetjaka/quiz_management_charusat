const xlsx = require('xlsx');
const fs = require('fs');

console.log('Testing Excel generation...');

try {
  const sampleData = [
    {
      email: "john.doe@charusat.edu.in",
      password: "temp123456"
    },
    {
      email: "jane.smith@charusat.edu.in",
      password: "coord123456"
    }
  ];

  console.log('Sample data created:', sampleData);

  // Create worksheet and workbook
  const worksheet = xlsx.utils.json_to_sheet(sampleData);
  console.log('Worksheet created successfully');

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Users");
  console.log('Workbook created successfully');

  // Write to file
  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  console.log('Excel buffer created, size:', buffer.length, 'bytes');

  fs.writeFileSync('test-template.xlsx', buffer);
  console.log('✅ Excel file written successfully to test-template.xlsx');

} catch (error) {
  console.error('❌ Excel generation error:', error);
  console.error('Error stack:', error.stack);
}