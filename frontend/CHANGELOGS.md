# Changelog

##### [0.1.0] - 23 April 24

- init

##### [2.0.7] - 16 May 24

- Copy changes
- Updated all wMinima Logos
- Deposit Native Minima feature w/ split 10
- Added Examples on Liquidity

##### [2.0.12] - 04 June 24

- Add help section

##### [2.0.13] - 05 June 24

- Design tweaks for help section

##### [2.1.0] - 06 June 24

- Syncrhonize ReadMode to appear only after Eth api is setup up

##### [2.2.0] - 07 June 24

- refreshNonce after approving contracts
- update backend set nonce code
- Withdraw event fixed, add hash & fix layout
- Remove rounding for Minima, discrepancies when trying to withdraw..
- bug fixes

##### [2.2.1] - 10 June 24

- Bug fixes on Order book widget
- Backend Message STARTETHSWAP bug fix

##### [2.2.2] - 11 June 24

- Fix JS Maths Precision with decimal.js
- Clean up global messages
- Add "Ethereum transaction failed, top up message"
- Show full balance of Native Minima when no unconfirmed, to 4 decimal places when unconf is 0
- Min/Max on Orderbook set only for MINIMA (order book)
- Design tweaks
- Add more info on Help
- Bug fixes

##### [2.3.0] - 11 June 24

- Fix regression bug from min/max
- Add another validation on order book

##### [2.4.0 - 2.5.4] - 19-25 June 24

- Re-work UX with Order book widget
- Add Order History (both order book & otc)
- Update communication messages while trading order book
- Add max 4 decimal places on forms
- Tweaks on OTC / insufficient funds check on deal
- Tweak Withdraw/Deposit UX
- Withdrawing SepoliaETH now works
- Update design on Main Activity w/ tabbed view of all logs & orders
- Clearer messages on Main acitivity
- Tweak comm messages
- Keys for y/x axes on charts
- Add low eth balance, disable message
- Disable order book when eth < 0.1 automatically
- Tweak Liquidity pool UX
- Add Minimum Minima Order on Liquidity pool UX
- Bug fixes

##### [2.6.0] - 27 June 24

- Order book re-written
- Fix orders pruning
- Remove autofocus on withdrawal
- Remove Secret Revealed events
- Add View Orders button
- Re-arrange allowance approval step
- Tweak Allowance approval design
- Add wallet address to Ethereum Withdrawal, set ETH wallet as default (when blank)
- Remove Sepolia, make mainnet default
- Tweak Read Mode message


##### [2.6.3] - 27-28 June 24

- Tweak close button on deposit
- Fix value sides on order book
- Remove close button on approve
- Must approve allowance before adding liquidity
- UID hash lock on OTC
- Tweak design on OTC
- Allowance approval if trying to copy UID for OTC
- Check balance on orderbook when buying/selling
- Fix Order layout on smaller screen
- Disabled orderbook event added
- Boost TXNs per 10 mins
- Bug fixes

##### [2.6.7] - 1 July 24

- Select only last 10 orders
- Dark/Light mode theme toggle
- Design tweaks
- Bug fixes

##### [2.6.10] - 3 July 24

- Design tweak on darkMode
- Remove annoying scrollbar on Main Activity
- Tweak prev, next on Main Activity

##### [2.6.13] - 9 July 24

- Up the gas limits on withdraw, refund, newContract of eth htlc
- Added Export Private Key for ETH
- Increase eth check on expiry
- Tweak designs

##### [2.7.1] - 17 July 24

- Manage the amount of call for balance to fix subsequent calls
- Open block w/ transaction id
- Add more validations on Withdraw forms

##### [2.8.0] - 19 July 24

- Show correct token on withdrawal
- Fix orders dissappearing
- Fix pagination with all activities
- Minor design tweaks

##### [2.8.1] - 19 July 24

- Adjusted Activity table design

##### [2.9.4] - 22 July 24

- Orders fixed, paginated all orders
- Adjust design + UX on withdraw/deposit forms & comms update
- Activity table design tweaks & comms
- Ethereum balance low & disabled message fix
- Other bug fixes

##### [2.10.0] - 23 July 24

- Full View Order Book

##### [2.11.0] - 14 August 24

- Lessen load on API calls, every 2 min check from 60s
- Full View Order Book tweaks
- Liquidity providers design tweak
- Add LP to favorites suggestion
- Add own book to Liquidity providers
- Design tweaks

##### [2.12.0] - 05 Sept 24

- Added UniSwap wMinima vs USDT price
