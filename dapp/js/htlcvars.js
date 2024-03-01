
//Minimum ETH block to check for events
var MIN_HTLC_BLOCK = 0;

//The Minima block time - different for TEST net
var MINIMA_BLOCK_TIME = 20;

//The Minima block time - different for TEST net
var ETH_BLOCK_TIME = 15;

//The MAIN timelock to add to the current time when starting an HTLC
var HTLC_TIMELOCK_SECS = 1000;

//The MAIN timelock in MINIMA BLOCKS that gets added to the current block
var HTLC_TIMELOCK_BLOCKS = Math.floor(HTLC_TIMELOCK_SECS / MINIMA_BLOCK_TIME);

//The minimum time difference to send counter party txn
var HTLC_TIMELOCK_COUNTERPARTY_SECS_CHECK = Math.floor(HTLC_TIMELOCK_SECS / 2); 

//The minimum time difference to send counter party txn
var HTLC_TIMELOCK_COUNTERPARTY_BLOCKS_CHECK = Math.floor(HTLC_TIMELOCK_BLOCKS / 2); 

//The timelock of counterparty txns
var HTLC_TIMELOCK_COUNTERPARTY_SECS = Math.floor(HTLC_TIMELOCK_COUNTERPARTY_SECS_CHECK / 2); 

//The minimum time difference to send counter party txn
var HTLC_TIMELOCK_COUNTERPARTY_BLOCKS = Math.floor(HTLC_TIMELOCK_COUNTERPARTY_BLOCKS_CHECK / 2); 

//How far back to check for secrets on startup
var HTLC_SECRETS_BACKLOG_CHECK = 50 + Math.floor(HTLC_TIMELOCK_SECS / ETH_BLOCK_TIME);