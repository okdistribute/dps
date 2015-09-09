# dps (data per second)

Search and manage datasets. This is mostly vaporware.

[![NPM](https://nodei.co/npm/dps.png)](https://nodei.co/npm/dps/)

With open data comes a price. Tracking and managing many urls from which you harvest data APIs can be a nightmare, let alone if you have custom scraping processes to clean that data!

Enter dps.

### `dps get <name/url>`
  * name will be found through any 'tracked' registries.
  * url could be the url of anything that gives data with HTTP GET (not in a tracked registry)
  * auto-detects dat endpoints and tracks version changes
  * `dps update` will triger the re-download of this data

### `dps add <script> [<name>]`
  * will add a script, which should output data to stdout.
  * can be referenced by optional name
  * `dps update` will triger the re-running of this script

### `dps list [--trackers]`
  * see list of all tracked data (metadata, names)
  * --trackers lists only trackers

### `dps search <keyword>`
  * does a search through the tracker metadata

### `dps mount [name] [--database=<name>] [--container=<container>]`
  * if name not supplied, will mount all the datasets currently tracked by dps
  * mounts the data in docker in the database of your choice. uses postgres by default
  * must have docker4data installed
  * can specify container 

### `dps update [dataset] [--trackers]`
  * updates a given dataset, or all datasets.
  * fetches the dataset via the given HTTP url
  * `--trackers` updates only the trackers, not the data.

### `dps track <url>`
  * add a tracker that will be searchable through 'dps search'

### `dps publish <tracker> [-c <config-file>]`
  * publish the metadata to the given tracker, including scripts to pull down data with `dat add`
  * will use ./dps.json if config-file isn't specified
