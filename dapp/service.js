//Load required files..
MDS.load("./js/decimal.js");
MDS.load("./js/puresha1.js");
MDS.load("./js/jslib.js");
MDS.load("./js/scripts.js");
MDS.load("./js/auth.js");
MDS.load("./js/sql.js");
MDS.load("./js/orderbook.js");
MDS.load("./js/orderbookutil.js");

//API files for Minima and ETH
MDS.load("./js/apiminima.js");
MDS.load("./js/apieth.js");
MDS.load("./js/balance.js");

MDS.load("./js/ethers-4.0.31.min.js");

MDS.load("./abi/erc20abi.js");
MDS.load("./js/etherc20util.js");
MDS.load("./js/etherc20wMinima.js");
MDS.load("./js/etherc20USDT.js");

MDS.load("./js/htlcvars.js");
MDS.load("./abi/htlcabi.js");
MDS.load("./js/ethhtlcutil.js");

MDS.load("./js/ethutil.js");

MDS.load("./js/ethjs-signer.js");

//The USER details..
var USER_DETAILS = {};

//Has the bridge been initialised - done in the frontend
var BRIDGE_INITED = false;

//DEBUG LOGS
var LOGS_ENABLED = false;

//We send the orderbook every 20 mins..
var ORDERSEND_COUNTER = 0;

// set a 2 min timer
var TIMER_COUNT = 0;

//Check and init the bridge - when you can
function serviceCheckBridgeInited() {
  //Have we already done this..
  if (BRIDGE_INITED) {
    return;
  }

  //Are we inited..
  isBridgeInited(function (inited) {
    BRIDGE_INITED = inited;

    //IF inited.. get the details..
    if (BRIDGE_INITED) {
      //Init all subsytems
      initBridgeSystems(function (userdets) {
        //Keep the USER Details
        USER_DETAILS = userdets;

        //Auto set Gas fees..
        setGasAuto(function () {});

        //And the Nonce..
        setNonceAuto(function (nonce) {});
      });
    }
  });
}

//Main message handler..
MDS.init(function (msg) {
  //Do initialisation
  if (msg.event == "inited") {
    //Create the DB - if not yet
    createDB();

    //Are we inited..
    serviceCheckBridgeInited();

    //We want to be notified of Coin Secret Events
    setupCoinSecretEvents(function (notify) {});

    //Set the correct ETH Network
    setCurrentNetwork();

    //Are we already inited.. then check order book
    if (BRIDGE_INITED) {
      //Check the Complete Order Book - will only check sigs for NEW entries..
      createCompleteOrderBook(USER_DETAILS, function (completeorderbook) {});

      //Send out your order book if required.. TAKES TIME..
      //createAndSendOrderBook(USER_DETAILS,function(){});
    }

    MDS.log("Bridge Inited..");

    return;
  }

  //Check the bridge has inited..
  serviceCheckBridgeInited();
  if (!BRIDGE_INITED) {
    //MDS.log("BRIDGE NOT YET INITED:"+JSON.stringify(msg.event));
    return;
  }

  //NOW we can continue..
  if (msg.event == "MDS_TIMER_60SECONDS") {
    // run every 2 mins instead of 60s to lessen load of API calls
    if (TIMER_COUNT < 2) {
      TIMER_COUNT++;
      return;
    } else {
      TIMER_COUNT = 0;
    }

    //SERVICE.js runs function synchromously... as no HTTP call..
    //so no need to to stack functions inside each other

    if (LOGS_ENABLED) {
      MDS.log("Bridge Update 60 seconds..");
    }

    //Are the INFURA KEYS SET
    var infuraenabled = false;
    getInfuraApiKeys(function (apikeys) {
      infuraenabled = apikeys.enabled;
    });

    //No Infura nothing works..
    if (!infuraenabled) {
      return;
    }

    //Has nonce been set
    if (NONCE_TRACK == -1) {
      //REDO the NONCE
      setNonceAuto(function (nonce) {});

      //And check again..
      if (NONCE_TRACK == -1) {
        MDS.log("ERROR Nonce not valid..");
        return;
      }
    }

    //Get the current ETH block
    var ethblock = 0;
    getCurrentETHBlock(function (block) {
      ethblock = block;

      //Check is valid..
      if (!checkIsPositiveNumber(ethblock)) {
        ethblock = 0;
      }
    });

    //Check we have a valid ETH block
    if (ethblock == 0) {
      MDS.log(
        "ERROR Getting latest ETH block.. " +
          ethblock +
          " ..waiting for next update round",
      );
      return;
    }

    //Wait 3 blocks so is definitely confirmed..
    ethblock = ethblock - 3;
    if (ethblock < 0) {
      ethblock = 0;
    }

    //Get the current Minima block
    var minimablock = 0;
    getCurrentMinimaBlock(function (mblock) {
      minimablock = +mblock;
    });

    //Auto set Gas fees..
    setGasAuto(function () {});

    //Is the GAS API valid..
    if (!GAS_API.valid) {
      MDS.log("ERROR Getting GAS API latest fees..");
      return;
    }

    if (LOGS_ENABLED) {
      MDS.log("Start Bridge Functions..");

      MDS.log("ETH BLOCK    : " + ethblock);
      MDS.log("MINIMA BLOCK : " + minimablock);
      MDS.log("NONCE        : " + NONCE_TRACK);
    }

    //Check for new secrets
    checkETHNewSecrets(ethblock, function () {});

    //Check expired Minima coins
    checkExpiredMinimaHTLC(
      USER_DETAILS,
      minimablock,
      function (expiredminima) {},
    );

    //Check expired Wrappped Minima
    checkExpiredETHHTLC(ethblock, function (expiredeth) {});

    //Now check Minima for SWAPS
    checkMinimaSwapHTLC(USER_DETAILS, minimablock, function (swaps) {});

    //Check ETH for SWAPS
    checkETHSwapHTLC(
      USER_DETAILS,
      ethblock,
      minimablock,
      function (ethswaps) {},
    );

    //Do we need to BOOST a txn..
    checkBoostTransactions(function () {});

    //Check ETH balance
    getETHEREUMBalance(function (ethresp) {
      // time to disable
      if (ethresp < 0.01) {
        getMyOrderBook(function (orderbook) {
          if (orderbook.wminima.enable || orderbook.usdt.enable) {
            disableOrderbook(orderbook, function () {
              var msg = {};
              msg.status = true;
              msg.message = "ETH balance below 0.01, disabled orderbook!";
              sendFrontendMSG("DISABLEORDERBOOK", msg);
              logDisableOrderbook(
                "0x00", 
                "minima",
                0.0000000001,
                "You are running low on ETH, disabled orderbook",
                function (sqlresp) {},
              );
            });
          }
        });
      }
    });

    //Do we have to send the orderbook..
    ORDERSEND_COUNTER += 2;
    if (ORDERSEND_COUNTER % ORDERBOOK_UPDATE_TIME_MINUTES == 0) {
      //Clear the previous validated signatures.. so list does not grow endlessly
      clearPreviousValidSigs();

      //Always publish your book timeout..
      createAndSendOrderBook(USER_DETAILS);
    } else {
      //Check if my orderbook has changed..
      checkNeedPublishOrderBook(USER_DETAILS);
    }

    if (LOGS_ENABLED) {
      MDS.log("Bridge functions finished..");
    }
  } else if (msg.event == "MDS_TIMER_1HOUR") {
    //Clear the previous validated signatures.. so list does not grow endlessly
    //clearPreviousValidSigs();
    //Always publish your book every hour
    //createAndSendOrderBook(USER_DETAILS);
  } else if (msg.event == "NEWBLOCK") {
    //Check the Complete Order Book - will only check sigs for NEW entries..
    createCompleteOrderBook(USER_DETAILS, function (completeorderbook) {});
  } else if (msg.event == "MDSCOMMS") {
    //Messages sent fdrom the front end..
    //MDS.log(JSON.stringify(msg,null,2));

    //Make sure is a private message
    if (!msg.data.public) {
      //Get the message
      var comms = JSON.parse(msg.data.message);

      //Is Infura enabled..
      var validinfura = false;
      validInfuraKeys(function (valid) {
        validinfura = valid;
      });

      //No INFURA!.. cannot perform these functions..
      if (comms.action != "FRONTENDMSG") {
        if (!validinfura) {
          var ethresp = {};
          ethresp.status = false;
          ethresp.error = "Infura API keys not enabled";
          sendFrontendMSG(comms.action, ethresp);
          return;
        }
      }

      //Get the action
      if (comms.action == "SENDETH") {
        sendETHEREUM(comms.address, comms.amount, function (ethresp) {
          sendFrontendMSG(comms.action, ethresp);
        });
      } else if (comms.action == "SENDWMINIMA") {
        sendWMinimaERC20(comms.address, comms.amount, function (ethresp) {
          sendFrontendMSG(comms.action, ethresp);
        });
      } else if (comms.action == "SENDUSDT") {
        sendUSDT(comms.address, comms.amount, function (ethresp) {
          sendFrontendMSG(comms.action, ethresp);
        });
      } else if (comms.action == "POSTTRANSACTION") {
        postTransaction(comms.transaction, function (ethresp) {
          sendFrontendMSG(comms.action, ethresp);
        });
      } else if (comms.action == "BOOSTTRANSACTION") {
        boostTransaction(comms.transactionid, function (ethresp) {
          sendFrontendMSG(comms.action, ethresp);
        });
      } else if (comms.action == "STARTMINIMASWAP") {

        var requestedtoken = comms.contractaddress.split("ETH:")[1].toUpperCase() === wMinimaContractAddress.toUpperCase() ? "WMINIMA" : "USDT";
        MDS.notify(`Locking up ${comms.sendamount} MINIMA for ${comms.requestamount} ${requestedtoken}`);

        startMinimaSwap(
          USER_DETAILS,
          comms.sendamount,
          comms.requestamount,
          comms.contractaddress,
          comms.reqpublickey,
          comms.otc,
          function (ethresp) {
            var msg = {};
            msg.status = ethresp.status;

            //was it a sucess..
            if (ethresp.status) {
              msg.message = "Minima swap started!";
            } else {
              msg.message = "Minima swap fail - " + ethresp.message;
            }

            sendFrontendMSG(comms.action, msg);
          },
        );
      } else if (comms.action == "STARTETHSWAP") {

        var erc20contract = comms.erc20contract.toUpperCase() === wMinimaContractAddress.toUpperCase() ? "WMINIMA" : "USDT";
        MDS.notify(`Locking up ${comms.amount} ${erc20contract} for ${comms.reqamount} MINIMA`);

        startETHSwap(
          USER_DETAILS,
          comms.reqpublickey,
          comms.erc20contract,
          comms.reqamount,
          comms.amount,
          function (ethresp) {
            sendFrontendMSG(comms.action, ethresp);
          },
        );
      } else if (comms.action == "ACCEPTOTCSWAP") {
        acceptOTCSwapCoin(USER_DETAILS, comms.coinid, function (res, message) {
          var fullmess = {};
          fullmess.res = res;
          fullmess.message = message;

          sendFrontendMSG(comms.action, fullmess);
        });
      } else if (comms.action == "APPROVECONTRACTS") {
        var approve = {};
        wMinimaApprove(HTLCContractAddress, "max", function (wminlogs) {
          approve.wminima = wminlogs;
          USDTApprove(HTLCContractAddress, "max", function (usdtlogs) {
            approve.usdt = usdtlogs;

            //Now send to front end..
            sendFrontendMSG(comms.action, approve);
          });
        });
      } else if (comms.action == "REFRESHNONCE") {
        setNonceAuto(function (ethresp) {
          sendFrontendMSG(comms.action, ethresp);
        });
      } else if (comms.action == "REFRESHBALANCE") {
      } else if (comms.action == "SWITCHSEPOLIA") {
        //Convert to Sepolia settings..
        setNetwork("sepolia");
        resetLastCheckedETHBlock();

        //Now send to front end..
        sendFrontendMSG(comms.action, "Switched to ETH Sepolia Network");
      } else if (comms.action == "SWITCHMAINNET") {
        //Convert to Sepolia settings..
        setNetwork("mainnet");
        resetLastCheckedETHBlock();

        //Now send to front end..
        sendFrontendMSG(comms.action, "Switched to ETH Main Network");
      } else if (comms.action == "FRONTENDMSG") {
        //Ignore..
      } else if (comms.action == "MANUALETHREFUND") {
        var ethblock = 0;
        getCurrentETHBlock(function (block) {
          ethblock = block;
          manualCollectExpiredETHCoin(
            comms.contractId,
            comms.tokenContract,
            comms.hashLock,
            comms.amount,
            function (resp) {
              sendFrontendMSG(comms.action, resp);
            },
          );
        });
      } else {
        MDS.log("COMMS Unknown Request : " + JSON.stringify(msg, null, 2));
      }
    } else {
      MDS.log(
        "SECURITY received public comms message : " +
          JSON.stringify(msg, null, 2),
      );
    }
  } else if (msg.event == "NOTIFYCOIN") {
    //Is it relevant to Bridge
    if (msg.data.address == COIN_SECRET_NOTIFY) {
      //Get the coin
      var coin = msg.data.coin;

      //Get the Relevant users..
      var owner = coin.state[102];
      var counterparty = coin.state[103];
      var weare = "[" + USER_DETAILS.minimapublickey + "]";

      //Are we either..
      if (weare == owner || weare == counterparty) {
        //Get the secret and hash
        var secret = coin.state[100];
        var hash = coin.state[101];

        //Put the secret and hash in the db
        insertSecret(secret, hash, function (added) {
          if (added) {
            MDS.log("NEW SECRET from Minima for hash " + hash);
          }
        });
      }
    }
  }
});
