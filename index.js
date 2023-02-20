require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'Shortener url API' });
});

const urlArr = [];
let key = 1;

app.post('/api/shorturl', function (req, res) {
  let url;
  try {
    url = new URL(req.body.url);
  } catch (error) {
    res.json({ error: 'Invalid url' });
  }

  dns.lookup(url.hostname, (err) => {
    if (err) {
      res.json({ error: 'invalid url' });
    }

    let result = urlArr.find((e) => e.original_url === url);

    if (result === undefined) {
      urlArr.push({
        original_url: url,
        short_url: key,
      });
      res.json({
        original_url: url,
        short_url: key,
      });

      key++;
    } else {
      res.json({
        original_url: result.original_url,
        short_url: result.short_url,
      });
    }
  });
});

app.get('/api/shorturl/:short_url', function (req, res) {
  const redirectUrl = urlArr.find(
    (e) => e.short_url === parseInt(req.params.short_url)
  );

  res.redirect(redirectUrl.original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
