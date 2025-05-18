const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const PORT = process.env.PORT || 3000;
const path = require('path');
const fs = require('fs');

// Middleware to parse JSON and URL-encoded payloads using built-in express methods
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure output directory exists
const outputDir = path.resolve(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Sending the data required for creating the hmtl file
app.post('/generate-html', (req, res) => {
    const { A, B, C } = req.body;

  if (!A || !B || !C) {
    return res.status(400).json({ error: 'Request body must contain A, B, and C stringified JSON data' });
  }

  try {
    const rootDir = __dirname;

    // Parse and write A.json
    const aData = JSON.parse(A);
    fs.writeFileSync(path.resolve(rootDir, 'A.json'), JSON.stringify(aData, null, 2), 'utf-8');

    // Parse and write B.json
    const bData = JSON.parse(B);
    fs.writeFileSync(path.resolve(rootDir, 'B.json'), JSON.stringify(bData, null, 2), 'utf-8');

    // Parse and write C.json
    const cData = JSON.parse(C);
    fs.writeFileSync(path.resolve(rootDir, 'C.json'), JSON.stringify(cData, null, 2), 'utf-8');

    res.json({ message: 'JSON files updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Serve the HTML file
app.get('/', (req, res) => {
  const filePath = path.resolve(__dirname, 'index.html');
  res.sendFile(filePath);
});

app.post('/generate-pdf', async (req, res) => {
  // Always use local iframe.html file in the same directory as server.js
  const rootDir = __dirname;
  const filePath = path.resolve(rootDir, 'iframe.html');
  const fileUrl = 'file://' + filePath;
  let pdfPath = await generatePdf(fileUrl);
  try {
    res.json({ message: 'PDF generated successfully', path: pdfPath });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`PDF generation API listening at http://localhost:${port}`);
});

async function generatePdf(fileUrl) {
  // Use local HTML file iframe.html in the same directory
  const rootDir = __dirname;
  // Ensure output directory exists
  const outputDir = path.resolve(rootDir, 'to-pdf-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // Navigate to the local HTML file URL and wait until network is idle
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  // Wait for the table element to be present in the page
  await page.waitForSelector('table');

  // Generate PDF file of the entire page with US Letter size (8.5 x 11 inches)
  const outputPath = path.resolve(outputDir, 'table.pdf');
  await page.pdf({ path: outputPath, format: 'Letter' });

  await browser.close();
  console.log(`PDF generated successfully: ${outputPath}`);
  return outputPath;
}