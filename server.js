
const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

async function checkProductAvailability(url) {
  try {
    const apiUrl = `http://35.222.94.60/api/product/check?source_url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);
    return response.data.data.exist ? '✅ Available' : '❌ Not Available';
  } catch (err) {
    return '❌ Error';
  }
}

app.post('/upload', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  const results = await Promise.all(data.map(async row => {
    const url = row.URL || row.url || row.link;
    const status = await checkProductAvailability(url);
    return { URL: url, Status: status };
  }));

  const newWB = xlsx.utils.book_new();
  const newWS = xlsx.utils.json_to_sheet(results);
  xlsx.utils.book_append_sheet(newWB, newWS, 'Results');
  const resultPath = `uploads/results_${Date.now()}.xlsx`;
  xlsx.writeFile(newWB, resultPath);

  fs.unlinkSync(filePath);

  res.download(resultPath, err => {
    if (err) console.error(err);
    fs.unlinkSync(resultPath);
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
