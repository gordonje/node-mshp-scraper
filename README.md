# MSHP Scraper

Simple web scraping app for collecting crash reports from the Missouri State Highway Patrol's [website](https://www.mshp.dps.missouri.gov/HP68/SearchAction).

Built in [Node.js](https://nodejs.org/en/), with help from [axios](https://www.npmjs.com/package/axios) and [cheerio](https://cheerio.js.org).

**Intended for class demonstration purposes only.**

## How it works

1. Get the injury types
	- Make a GET request for [`/HP68/SearchAction`](https://www.mshp.dps.missouri.gov/HP68/SearchAction)
	- Extract the value attribute of every `<option>` element in the `<select>` element with the id `injuryType`
2. Get the URLs for all incident reports where an injury of that type was recorded
	- For each injury type, make a POST request for `/HP68/SearchAction`
		- In the [form data](https://developer.mozilla.org/en-US/docs/Web/API/FormData), encode the `searchInjury` value.
	- Extract the href attribute of every `<a>` element in a `<td>` element with an `infoCellPrint` class.
		- Remove duplicate URLs
3. Get the report for each incident
	- Make a GET request for each incident report URL (e.g., [`/HP68/AccidentDetailsAction?ACC_RPT_NUM=210157217`](https://www.mshp.dps.missouri.gov/HP68/AccidentDetailsAction?ACC_RPT_NUM=210157217)
	- Extract the text from the elements in:
		- the "Crash Information" table
		- the "Vehicle Information" table
		- the "Injury Information" table
		- the "Misc. Information" table
4. Write out the rows from each table to a separate csv file.