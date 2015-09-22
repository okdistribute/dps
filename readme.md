# dps (data per second)

Search, manage, and update datasets. **This is mostly vaporware right now.**

With open data comes a price. Tracking and managing many urls from which you harvest data APIs can be a nightmare, let alone if you have custom scraping processes to clean that data! This will quickly become a desktop application that maps point-and-click functions to commandline features.

## Example

```
$ dps add http://www.opendatacache.com/cookcounty.socrata.com/api/geospatial/26nm-wd5q
{
  path: 'http_wwwopendatacachecomcookcountysocratacomapigeospatial26nmwd5q',
  location: 'http://www.opendatacache.com/cookcounty.socrata.com/api/geospatial/26nm-wd5q',
  type: 'url',
  meta: {
    modified: Wed Jun 24 2015 14:52:26 GMT-0700 (PDT),
    size: 618400,
    checked: Tue Sep 22 2015 01:51:43 GMT-0700 (PDT)
  }
}
```


```
$ dps add http://eukaryota.dathub.org/
Cloning http://eukaryota.dathub.org into http_eukaryotadathuborg...
Progress:  [+2, -0] and 1 file(s).
Clone from remote to http_eukaryotadathuborg has completed.
{
  path: 'http_eukaryotadathuborg',
  location: 'http://eukaryota.dathub.org',
  type: 'dat',
  meta: {
    modified: Mon Sep 21 2015 21:07:41 GMT-0700 (PDT),
    checked: Tue Sep 22 2015 01:52:57 GMT-0700 (PDT),
    size: 4059
  }
}
```

See status:
```
$ dps status
http://www.opendatacache.com/cookcounty.socrata.com/api/geospatial/26nm-wd5q
  checked: 3 minutes ago  modified: 3 months ago  size: 618.4 kB

http://localhost:6442
  checked: just now  modified: 5 hours ago  size: 4.06 kB
```

Check the sources for updates.
```
$ dps check
http://www.opendatacache.com/cookcounty.socrata.com/api/geospatial/26nm-wd5q
  checked: just now  modified: 3 months ago  size: 618.4 kB

http://localhost:6442
  checked: just now  modified: 5 hours ago  size: 4.06 kB
```

## CLI api

### `dps add <url>`
  * name will be found through any 'tracked' registries.
  * url could be the url of anything that gives data with HTTP GET (not in a tracked registry)
  * auto-detects dat endpoints and tracks version changes
  * `dps update/` will triger the re-download of this data

### `dps update [dataset] [--trackers]`
  * updates a given dataset, or all datasets.
  * fetches the dataset via the given HTTP url
  * `--trackers` updates only the trackers, not the data.

### `dps status`
  * see list of all tracked data
  * --trackers lists only trackers

### `dps destroy`
  * removes everything, including the data!

## federated search

### `dps search <keyword>`
  * does a search through the tracker metadata

### `dps track <url>`
  * add a tracker that will be searchable through 'dps search'

### `dps publish <tracker> [-c <config-file>]`
  * publish the metadata to the given tracker, including scripts to pull down data with `dat add`
  * will use ./dps.json if config-file isn't specified

## advanced/experimental

### `dps add --exec=<script> <name>`
  * will add a script, which should output data to stdout.
  * referenced by given name
  * `dps update` will trigger the re-running of this script

### `dps mount [name] [--database=<name>] [--container=<container>]`
  * if name not supplied, will mount all the datasets currently tracked by dps
  * mounts the data in docker in the database of your choice. uses postgres by default
  * must have docker4data installed
  * can specify container
