// import the modules of the two packages we installed with npm
// axios is our HTTP client: https://www.npmjs.com/package/axios
const axios = require('axios');
// cheerio is our DOM query tool: https://cheerio.js.org
const cheerio = require('cheerio');
// also importing this module from Node's standard library 
// see: https://www.npmjs.com/package/axios#using-applicationx-www-form-urlencoded-format
const querystring = require('querystring');

// the URL for the search form, which we will reuse
const searchURL = "https://www.mshp.dps.missouri.gov/HP68/SearchAction";

// Extracts the options in the injury type select box on the search form.
// Takes an html string as an argument.
// Returns an Array.
function extractInjuryTypes(html) {

	// create a cheerio instance by loading in the html string
	const $ = cheerio.load(html);

	// select all the options in the element with an "injuryType" id
	const injuryTypes = $('#injuryType option')
		// coerce the Node collection to an array
		.toArray()
		// extract the "value" attribute of each element
		.map(d => d.attribs.value)
		// filter the array to items with a non-zero length
		.filter(d => d.length > 0);

	return injuryTypes;

}

// Gets the injury types.
// Return Promise until we get a response from the MSHP web server.
// Then return an Array.
async function getInjuryTypes() {

	// set up an empty Array
	let injuryTypes = [];

	// make a GET request and wait for response
	await axios
		.get(searchURL)
	  // handle success
	  .then(response => {
			// pass the response to the extractor function
	    extractInjuryTypes(response.data)
	    // iterate over the injury types, pushing each to the local binding
	    	.forEach(d => injuryTypes.push(d));
	    }
	   )
	   // handle error
	  .catch(error => console.log(error));

	 return injuryTypes;

	}


// Extracts the URLs from the <a> elements in the column of the search results.
// Takes an html string as an argument.
// Returns an Array.
function extractReportURLs(html) {

	// create a cheerio instance by loading in the html string
	const $ = cheerio.load(html);

	// select
	// - <a> elements 
	// - in the <td> elements 
	// - with a infoCellPrint class
	const urls = $('td.infoCellPrint a')
		// coerce to an Array
		.toArray()
		// extract the "href" attribute of each element
		.map(d => d.attribs.href)

	return new Set(urls);

}


// Gets the URLs for reports where there was a given type of injury.
// Return Promise until we get a response from the MSHP web server.
// Then return an Array.
async function getReportURLs(injuryType) {

	// set up an empty array
	let urls = [];
	
	// encode the injury type into the form data to be submitted
	const params = querystring.stringify({ 'searchInjury': injuryType });

	// make a POST request and wait for a response
	await axios
		// be share to base in the form data
		.post(searchURL, params)
		// handle success
		.then(
			// pass the response to the extractor function
			response => {
				extractReportURLs(response.data)
				// iterate over the URLs, push each to the the local binding
					.forEach(d => urls.push(d))
			}
		)
		// handle error
		.catch(error => console.log(error))

	return urls

}


function extractReportData(html) {
	const $ = cheerio.load(html);

	const data = $(".accidentOutput").first().get("caption").text

	return data

}


async function getReportData(url) {

	siteURL = "https://www.mshp.dps.missouri.gov/"

	let data = ""

	await axios
		.get(url)
		.then(response => data += append(extractReportData(response.data)))
		.catch(error => console.log(error))

	return data

}


// actual call to get the injury types
getInjuryTypes()
	// handle success
	.then(
		// map each injury type to a call to get the URLs for reports with that injury type
		injuryTypes => {
			injuryTypes.map(
				d => getReportURLs(d).then(
					urls => {
						urls.slice(0, 2).map(d => getReportData(d))
					}
				)
			)
		}
	)
	.catch(error => console.log(error));
