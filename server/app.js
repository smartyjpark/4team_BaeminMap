var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var config = require('./config');
var eachAsync = require('each-async');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(3000, ()=> {
  console.log('start 3000port!')
})


app.post('/shops', (req, res)=> {
  var shops = {}
  var shopArray = []
  config.getToken(()=> {
    eachAsync(config.categoryList, function(category, index, done) {
      request({
        url: config.standardUrl+'/v2/shops?size=2000',
        method: 'POST',
        json: true,
        headers: {
          'Authorization': 'Bearer '+config.token
        },
        body: {
          'lat': req.body.lat,
          'lng': req.body.lng,
          'category': category
        }
      }, function(err, res, body) {
        shopArray = shopArray.concat(body.content)
        shops[category] = body.content
        done()
      })
    }, function(err) {
      if(err) throw err;
      res.json({shops: shops, shopArray: shopArray})
    })
  })
})
