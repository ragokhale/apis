const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

async function scrapePublicIssueData() {
  const url = 'https://www.bseindia.com/markets/PublicIssues/IPOIssues_new.aspx?id=1&Type=p';

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Wait for the table to be rendered
    await page.waitForSelector('#ctl00_ContentPlaceHolder1_tblID');

    // Extract data from the table
    const data = await page.evaluate(() => {
      const rows = document.querySelectorAll('#ctl00_ContentPlaceHolder1_tblID tr');
      const rowData = [];
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 7) {
          rowData.push({
            securityName: cells[0].innerText.trim(),
            startDate: cells[1].innerText.trim(),
            endDate: cells[2].innerText.trim(),
            offerPrice: cells[3].innerText.trim(),
            faceValue: cells[4].innerText.trim(),
            typeOfIssue: cells[5].innerText.trim(),
            issueStatus: cells[6].innerText.trim(),
          });
        }
      }
      return rowData;
    });

    await browser.close();

    return data;
  } catch (error) {
    console.error('Error occurred:', error);
    return null;
  }
}

async function scrapeIPOData() {
  const url = 'https://www.bseindia.com/markets/PublicIssues/IPODRHP.aspx';

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Wait for the table to be rendered
    await page.waitForSelector('#ctl00_ContentPlaceHolder1_gvData');

    // Extract data from the table
    const data = await page.evaluate(() => {
      const rows = document.querySelectorAll('#ctl00_ContentPlaceHolder1_gvData tr');
      const rowData = [];
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
          rowData.push({
            companyName: cells[0].innerText.trim(),
            draftRHP: cells[1].querySelector('a') ? cells[1].querySelector('a').href : '-',
            RHP: cells[2].querySelector('a') ? cells[2].querySelector('a').href : '-',
            prospectus: cells[3].querySelector('a') ? cells[2].querySelector('a').href : '-',
            advert: cells[4].querySelector('a') ? cells[4].querySelector('a').href : '-',
          });
        }
      }
      return rowData;
    });

    await browser.close();

    return data;
  } catch (error) {
    console.error('Error occurred:', error);
    return null;
  }
}

app.get("/", (req, res) => res.type('html').send(html));

app.get('/publicIssue', async (req, res) => {
  const publicIssue = await scrapePublicIssueData();
  if (publicIssue) {
    res.json(publicIssue);
  } else {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/ipo', async (req, res) => {
  const ipo = await scrapeIPOData();
  if (ipo) {
    res.json(ipo);
  } else {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});


const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>BSE APIs</title>
  </head>
  <body>
	<h3><a href="./publicIssue">BSE Public Issues API</a></h1>
	<h3><a href="./ipo">BSE IPO API</a></h1>
  </body>
</html>
`