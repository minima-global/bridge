
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
	"		<table style='border-spacing:10;'>"+
	"			<tr>"+
	"				<td class=buttonlinks><button onclick=\"location.href='index.html?uid="+uid+"'\">HOME</button></td>"+
	"				<td class=buttonlinks><button onclick=\"location.href='balance.html?uid="+uid+"'\">BALANCE</button></td>"+
	"				<td class=buttonlinks><button onclick=\"location.href='trade.html?uid="+uid+"'\">TRADE</button></td>"+
	"				<td class=buttonlinks><button onclick=\"location.href='liquidity.html?uid="+uid+"'\">LIQUIDITY</button></td>"+
	//"				<td class=buttonlinks><button onclick=\"location.href='orderbook.html?uid="+uid+"'\">ORDERBOOK</button></td>"+
	//"				<td class=buttonlinks><button onclick=\"location.href='otc.html?uid="+uid+"'\">OTC</button></td>"+
	"				<td class=buttonlinks><button onclick=\"location.href='history.html?uid="+uid+"'\">ACTIVITY</button></td>"+
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
