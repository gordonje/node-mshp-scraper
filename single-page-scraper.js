const axios = require('axios');
const cheerio = require('cheerio');

const url = "https://www.mshp.dps.missouri.gov/HP68/AccidentDetailsAction?ACC_RPT_NUM=210197381";


function extractData(html) {

  const $ = cheerio.load(html);
  const tables = $('.accidentOutput');
  const crashInfoTable = tables.first().get();
  const injuryInfoTable = tables.slice(2, 3).get();

  const crashInfoHeader = $(crashInfoTable)
    .find('.columnHeading')
    .map( (i, e) => $(e).text().trim() )
    .get();

  const crashInfoRow = $(crashInfoTable)
    .find('tr')
    .last()
    .find('.infoCell3')
    .map( (i, e) => $(e).text().trim() )
    .get();

  let data = {};
  data['crash_info'] = {};
  data['injury_info'] = [];

  crashInfoHeader
    .forEach( (k, i) => {
      data['crash_info'][k] = crashInfoRow[i] 
    });

  const injuryInfoHeader = $(injuryInfoTable)
    .find('.columnHeading')
    .map( (i, e) => $(e).text().trim() )
    .get();

  const injuryInfoRows = $(injuryInfoTable)
    .find('tr')
    .slice(1)
    .each( (i, e) => {
      const cells = $(e)
        .find('.infoCell3')
        .map( (i, e) => $(e).text().trim() )
        .get()

      let injury = {};

      injuryInfoHeader
        .forEach( (k, i) => injury[k] = cells[i] )

      data['injury_info'].push(injury);

    })

  return JSON.stringify(data);

}

axios
  .get(url)
  // handle success
  .then( response => console.log(extractData(response.data)) )
   // handle error
  .catch(error => console.log(error));

