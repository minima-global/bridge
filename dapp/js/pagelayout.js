
/** 
 * Create the header for the pages
*/
function createHeader(){
	
	//Get the MiniDAPP SessionID
	var uid  = MDS.form.getParams("uid");
	
	document.write(
	"<center><h2>Bridge</h2>"+
	"<table>"+	
	"<tr>"+
	"		<table width=800 border=1>"+
	"			<tr>"+
	"				<td class=buttonlinks><button onclick=\"location.href='index.html?uid="+uid+"'\">HOME</button></td>"+
	"				<td class=buttonlinks><button onclick=\"location.href='balance.html?uid="+uid+"'\">BALANCE</button></td>"+
	"				<td class=buttonlinks><button onclick=\"location.href='swap.html?uid="+uid+"'\">SWAP</button></td>"+
	"				<td class=buttonlinks><button onclick=\"location.href='liquidity.html?uid="+uid+"'\">LIQUIDITY</button></td>"+
	"				<td class=buttonlinks><button onclick=\"location.href='orderbook.html?uid="+uid+"'\">ORDERBOOK</button></td>"+
	"			</tr>"+
	"		</table>"+
	"	</td>"+
	"</tr>"+
	"</table><br><br>");
	
}

/** 
 * Create the footer for the pages
*/
function createFooter(){
	document.write("<br></center>");
}
