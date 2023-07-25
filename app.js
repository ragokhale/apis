const puppeteer = require('puppeteer');

async function scrapeIPOData() {
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

//// Call the function and handle the output
//scrapeIPOData().then((ipoData) => {
//  if (ipoData) {
//    console.log('Security Name\tStart Date\tEnd Date\tOffer Price\tFace Value\tType of Issue\tIssue Status');
//    ipoData.forEach((item) => {
//      console.log(
//        `${item.securityName}\t${item.startDate}\t${item.endDate}\t${item.offerPrice}\t${item.faceValue}\t${item.typeOfIssue}\t${item.issueStatus}`
//      );
//    });
//  }
//});

async function sendEmailWithTable(tableData) {
  const tableString = generateTableString(tableData);
}

function generateTableString(data) {
  let tableString = 'Security Name\tStart Date\tEnd Date\tOffer Price\tFace Value\tType of Issue\tIssue Status\n';
  data.forEach((item) => {
    tableString += `${item.securityName}\t${item.startDate}\t${item.endDate}\t${item.offerPrice}\t${item.faceValue}\t${item.typeOfIssue}\t${item.issueStatus}\n`;
  });
  return tableString;
}

(async () => {
  const scrapedData = await scrapeIPOData();
  if (scrapedData) {
    console.log('Scraped data:', scrapedData);
    sendEmailWithTable(scrapedData);
  }
})();