#!/usr/bin/env node

'use strict';

var __package__ = require("./package.json");

try {
    var config = require("./local_config");
}
catch (err) {
    var config = require("./config")
}

const inquirer = require('inquirer');
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


elasticClient.indices.stats({}, function(err, response) {
    if (err) {
        console.log("SOMETHING WENT WRONG");
    }
    else {
        var indices = Object.keys(response.indices).map(function(s) {
            return { "name": s }
        });

        inquirer.prompt([
            {
              type: 'checkbox',
              message: 'Select indices to delete',
              name: 'indices',
              choices: indices
            }
        ])
        .then(function(selected) {
            removeIndices(selected.indices);
        });
    }
});

function removeIndices(names) {
    for (var i=0; i < names.length; i++) {
        (function _delete(client, name) {
            client.indices.delete({ "index": name }, function(err, response) {
                if (!err) {
                    console.log(`Deleted ${name}.`);
                }
                else {
                    console.log("ERORR", err)
                }
            })
        })(elasticClient, names[i]);
    }
}
