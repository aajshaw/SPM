'use strict'

const http = require('http');
const parseString = require('xml2js-parser').parseString;

function httpXMLRequest(params, postData) {
  return new Promise(function(resolve, reject) {
    let req = http.request(params, function(res) {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error('statusCode = ' + res.statusCode));
      }
      res.setEncoding('utf8');
      res.on('readable', function() {
        let xml = res.read();
        if (xml) {
          parseString(xml, (err, result) => {
            if (!err) {
              resolve(result);
            } else {
              reject(err);
            }
          });
        }
      });
    });
    req.on('error', function(err) {
      reject(err);
    });
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

module.exports = function(app) {
  app.get('/data', function(req, res) {
    let data = { 'status': 'success' }
    httpXMLRequest({host: 'enasolar-gt', method: 'GET', path: '/meters.xml'})
    .then(function(xml) {
      data.outputPower = (xml.response.OutputPower * 1.0).toFixed(3);
      data.inputVoltage = ((xml.response.InputVoltage * 1.0) + (xml.response.InputVoltage2 * 1.0)).toFixed(1);
      data.outputVoltage = (xml.response.OutputVoltage * 1.0).toFixed(1);
      httpXMLRequest({host: 'enasolar-gt', method: 'GET', path: '/data.xml'})
      .then(function(xml) {
        data.energyToday = (parseInt(xml.response.EnergyToday, 16) / 100.0).toFixed(2);
        data.hoursToday = Math.floor(xml.response.HoursExportedToday / 60);
        data.minutesToday = xml.response.HoursExportedToday % 60;
        data.energyYesterday = (parseInt(xml.response.EnergyYesterday, 16) / 100.0).toFixed(2);
        data.hoursYesterday = Math.floor(xml.response.HoursExportedYesterday / 60);
        data.minutesYesterday = xml.response.HoursExportedYesterday % 60;
        data.energyLifetime = (parseInt(xml.response.EnergyLifetime, 16) / 100.0).toFixed(2);
        data.hoursLifetime = Math.floor(parseInt(xml.response.HoursExportedLifetime, 16) / 60);
        data.minutesLifetime = parseInt(xml.response.HoursExportedLifetime, 16) % 60;
        data.daysProducing = parseInt(xml.response.DaysProducing, 16);
        data.averageDailyProduction = (data.energyLifetime / data.daysProducing).toFixed(2);

        res.json(data);
      })
      .catch(function(error) {
        data.error = error;
        data.status = 'failure';
        res.json(data);
      });
    })
    .catch(function(error) {
      data.error = error;
      data.status = 'failure';
      res.json(data);
    });
  });
}
