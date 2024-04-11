
/** 
 * Create the header for the pages
*/
function createHeader(){
	
	//Get the MiniDAPP SessionID
	var uid  = MDS.form.getParams("uid");
	
	document.write(
	
	"<center>"+
	
	"<div class=\"titlebar\" onclick=\"showTitleOnAndroid();\">"+
	"	<table width=100% border=0>"+
	"		<tr>"+
	"			<td><img height=40 src=\"bridge.png\"></td>"+
	"			<td style=\"text-align:left;font-size:26px;width:100%\">&nbsp;<b>BRIDGE</b></td>"+
	"			<td nowrap>"+
	"				<img style=\"cursor:pointer;\" onclick=\"event.stopPropagation(); jumpActivity();\" height=40 src=\"history.png\">&nbsp;&nbsp;"+
	"			</td>"+
	"			<td nowrap>"+
	"				<img style=\"cursor:pointer;\" onclick=\"event.stopPropagation(); jumpSettings();\" height=40 src=\"settings.png\">&nbsp;&nbsp;"+
	"			</td>"+
	//"			<td nowrap>"+
	//"				<img style=\"cursor:pointer;\" onclick=\"event.stopPropagation(); jumpHome();\" height=40 src=\"home.png\">&nbsp;&nbsp;"+
	//"			</td>"+
	"		</tr>"+
	"	</table>"+
	"</div>"+
	"<br>"+
	
	"<div class=\"mainview\">"+
	"<table>"+	
	"<tr>"+
	"		<table style='border-spacing:10;'>"+
	"			<tr>"+
	//"				<td class=buttonlinks><button onclick=\"location.href='index.html?uid="+uid+"'\">HOME</button></td>"+
	"				<td class=buttonlinks><button class=menubutton onclick=\"location.href='balance.html?uid="+uid+"'\">BALANCE</button></td>"+
	"				<td class=buttonlinks><button class=menubutton onclick=\"location.href='trade.html?uid="+uid+"'\">TRADE</button></td>"+
	"				<td class=buttonlinks><button class=menubutton onclick=\"location.href='liquidity.html?uid="+uid+"'\">LIQUIDITY</button></td>"+
	//"				<td class=buttonlinks><button onclick=\"location.href='orderbook.html?uid="+uid+"'\">ORDERBOOK</button></td>"+
	//"				<td class=buttonlinks><button onclick=\"location.href='otc.html?uid="+uid+"'\">OTC</button></td>"+
	//"				<td class=buttonlinks><button class=menubutton onclick=\"location.href='history.html?uid="+uid+"'\">ACTIVITY</button></td>"+
	"			</tr>"+
	"		</table>"+
	"	</td>"+
	"</tr>"+
	"</table><br><br>"
	);
	
}

/** 
 * Create the footer for the pages
*/
function createFooter(){
	document.write("<br><br></div></center>");
}
