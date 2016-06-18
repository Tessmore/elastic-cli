#!/usr/bin/env node

try {
    var config = require("./local_config");
}
catch (err) {
    var config = require("./config")
}

const argv = require('minimist')(process.argv.slice(2));
const split2 = require('split2');
const through2 = require('through2');

const elastic = require('elasticsearch');
const elasticClient = new elastic.Client({
  "host": [
    {
      "host": 'localhost',
      "auth": config.auth
    }
  ],
  "requestTimeout": 10000
});


var indexName = argv.index || "index-" + Date().now();

var reader = through2({ objectMode: true }, function(chunk, enc, callback) {
    var mapping = false;

    try {
        mapping = JSON.parse(chunk.toString().trim());
    }
    catch (err) {
        callback(err);
    }


    var indexSettings = {
        "index": indexName,
        "body" : mapping,
    };

    elasticClient.indices.create(indexSettings, function(err, body) {
        if (err) {
            callback(err);
        }
        else {
            callback();
        }
    });
});


process.stdin
  .pipe(through2())
  .pipe(reader)
  .on('error', function(error) {
      console.log("ERROR", error);
  })
  .on('finish', function() {
      console.log("Created elasticsearch index:", indexName);
  })
