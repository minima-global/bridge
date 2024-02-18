//Load required files..
MDS.load("./js/puresha1.js");
MDS.load("./js/jslib.js");
MDS.load("./js/scripts.js");
MDS.load("./js/auth.js");
MDS.load("./js/orderbook.js");
MDS.load("./js/balance.js");
MDS.load("./js/ethers-v4.min.js");
MDS.load("./js/ethprovider.js");

//The USER details..
var USER_DETAILS = {};
var myoldorderbook = JSON.stringify(getEmptyOrderBook());

//Check YOUR orderBook details..
function checkMyOrderBook(callback) {
  //My Order book status..
  getMyOrderBook(function (myorderbook) {
    //Any change..
    var newbook = JSON.stringify(myorderbook);

    //Are they the same..
    if (myoldorderbook != newbook) {
      MDS.log("My Order book changed..");

      //Get his balance..
      broadcastMyOrderBook(function (sendvalid) {
        //Success send..?
        if (sendvalid) {
          //Store for later
          myoldorderbook = newbook;
        }

        if (callback) {
          callback();
        }
      });
    } else {
      if (callback) {
        callback();
      }
    }
  });
}

function broadcastMyOrderBook(callback) {
  //My Order book
  getMyOrderBook(function (myorderbook) {
    //Get his balance..
    getAllBalances(USER_DETAILS, function (balances) {
      var orderbookmsg = {};
      orderbookmsg.publickey = USER_DETAILS.minimapublickey;
      orderbookmsg.orderbook = myorderbook;
      orderbookmsg.balance = balances;

      //Send a message to the network..
      MDS.log(
        "Sending my orderbook to network.. " + JSON.stringify(orderbookmsg)
      );
      sendOrderBook(USER_DETAILS, orderbookmsg, function (resp) {
        if (!resp.status) {
          MDS.log("ERROR sending order book " + JSON.stringify(resp));
          if (callback) {
            callback(false);
          }
        } else {
          if (callback) {
            callback(true);
          }
        }
      });
    });
  });
}

//Main message handler..
MDS.init(function (msg) {
  //Do initialisation
  if (msg.event == "inited") {
    getEthereumBalance("0x5534fF8d19EBF33D8e57C552f88d3A5dEE4fb669").then(
      (ethBalance) => {
        MDS.log("EthBalance : " + ethBalance);
      }
    );

    getWrappedBalance("0x5534fF8d19EBF33D8e57C552f88d3A5dEE4fb669").then(
      (wrappedBalance) => {
        MDS.log("wrappedBalance : " + wrappedBalance);
      }
    );


    getTimeLockForHTLC(
      1000000,
      "0x395f92568a17ee80b7d98f3894297ba89d1fac97adf305da08cb6dfc5a0e10a2"
    )
      .then(function (data) {
        // ["0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF",{"_hex":"0x1f5718987664b4800000"},"0x156994558198d5d38feea302f470632ab4a8bdb01c409e661f93fa4874943c5b",{"_hex":"0x65b2953f"}]
        MDS.log(data);
      })
      .catch((err) => {
        MDS.log(JSON.stringify(err));
      });

    //Set up the DB
    //..

    getUserDetails(function (userdets) {
      //Get User Details..
      USER_DETAILS = userdets;

      //Check if your order book is blank..
      checkMyOrderBook(function () {
        MDS.log("Bridge Service inited..");
      });
    });
  } else if (msg.event == "MDS_TIMER_10SECONDS") {
    //Check if your order book has changed..
    checkMyOrderBook();
  } else if (msg.event == "MDS_TIMER_1HOUR") {
    //Always publish your book every hour
    broadcastMyOrderBook();
  }
});
