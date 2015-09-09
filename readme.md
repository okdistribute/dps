# dps (data per second)

Search and manage datasets. This is mostly vaporware.

[![NPM](https://nodei.co/npm/dps.png)](https://nodei.co/npm/dps/)

With open data comes a price. Tracking and managing many urls from which you harvest data APIs can be a nightmare, let alone if you have custom scraping processes to clean that data!

Enter dps.

### `dps add <name/url>`
  * name will be found through any 'tracked' registries.
  * url could be the url of anything that gives data with HTTP GET

### `dps list`
  * see list of all tracked data

### `dps create <command>`
  * create a scraper
  * instead of adding a url, add a local scraper.
  * will have to specify the command to run. the command should output data on stdout

### `dps search <keyword>`
  * does a search through the tracker metadata

### `dps mount <database>`
  * mounts the data in docker in the database of your choice. uses postgres by default
  * must have docker4data installed

### `dps update [dataset] [--trackers]`
  * updates a given dataset, or all datasets.
  * fetches the dataset via the given HTTP url
  * `--trackers` updates only the trackers, not the data.

### `dps track <url>`
  * add a tracker that will be searchable through 'dps search'

### `dps trackers`
  * see all trackers

### `dps publish <url> <tracker>`
  * publish the url to a given tracker
