let BlinkTradeWS = require('blinktrade').BlinkTradeWS;
let config = require('./config');

let blinktrade = new BlinkTradeWS({
  prod: true,
  currency: "BRL",
  brokerId: 4
});

blinktrade.connect()
  .then(function() {
    return blinktrade.login({ username: "age", password: config.pass, secondFactor: "<YOUR_SECOND FACTOR>" });
  }).then(function() {
    console.log('Logged-in');
    checkBalance();
    checkMarket();
    print();
  })
  .catch(function(err) {
    console.log(err);
  });

///

let status = {
  latest: null,
  high: null,
  low: null,
  balance_brl: 0,
  av_btc: 0,
  av_brl: 0,
  lk_btc: 0,
  lk_brl: 0
};

function checkBalance() {
  blinktrade.balance().then(balance => {
    status.av_brl = balance.Available.BRL / 1e8;
    status.av_btc = balance.Available.BTC / 1e8;
    status.lk_brl = balance['4'].BRL_locked / 1e8;
    status.lk_btc = balance['4'].BTC_locked / 1e8;
    status.brl = balance['4'].BRL;
  });
}

function checkMarket() {
  blinktrade.subscribeTicker(["BLINK:BTCBRL"])
    .on("BLINK:BTCBRL", function(symbol) {
      checkBalance();
      status.balance_brl = status.av_btc * symbol.LastPx + (status.brl / 1e8);
      status.high = symbol.HighPx.toFixed(2);
      status.low = symbol.LowPx.toFixed(2);
      status.latest = symbol.LastPx.toFixed(2);
    });
}

///

function print() {
  let statusString = '👉 {latest}|👆 {high}|👇 {low}||💸 {balance_brl} 💎 {av_btc}|| Av.BRL: {av_brl}|| Lk.BRL: {lk_brl}';

  for(var i in status) 
    statusString = statusString.replace('{'+i+'}', status[i]);

  console.log('\033[2J');
  console.log(statusString);

  setTimeout(() => {print();}, 1000);
}