var time_speed = 1;//1-9
var clock = Date.now();//new Date().getDate() * 1000;// 1600000000000;
var budget = 1;
var nuke_budget = 25;
var g_bases = [];
var threats = [];
var nukes = [];
var selected_base = 0;
var g_int = null;
var render_mode = 0; // 1 = log, 0=linear
var zoom_mode = 0; // 0-8
var render_map = 1;

function m(x){
	return "<marquee scrollamount='10' style='height:20em;white-space:pre' direction='up' behavior='slide' id='mm'>"+ x+ "</marquee>";
}
function m2(x){
	return "<marquee scrollamount='10' style='height:1em;white-space:pre'  behavior='slide' id=mm2>"+ x+ "</marquee>";
}
function warn(x){
	document.getElementById("warnings").innerHTML = m(x);
	document.getElementById("mm").start();
}
function show_game_message(x){
	document.getElementById("game_messages").innerHTML = m2(x);
	document.getElementById("mm2").start();
}
function clock2angle(clock) {
	var d = new Date(clock);
	var hour_in_degrees = 360 / 24;
	var minute_in_degrees = 360 / 24 / 60;
	var second_in_degrees = 360 / 24 / 60 / 60;
	var angle_in_degrees = d.getHours() * hour_in_degrees + d.getMinutes() * minute_in_degrees + d.getSeconds() * second_in_degrees; 
	return angle_in_degrees;
}
function count_active_threats(){
	// count remaining.
	var active_count = 0;
	for(var x in threats){
		var threat = threats[x];
		if(threat[3] == 1){
			active_count++;
		}
	}
	return active_count;
}
function get_times(){
	var times = [0,1,5,10,30,60,120,600,3600,6000];
	return times;
}
function move_nukes(){
	// advance nukes.
	var times = get_times();
	var s = times[time_speed] / 10;
	for(var n in nukes){
		var nuke = nukes[n];
		var angle = nuke[0];
		var distance = nuke[1];
		nukes[n][1] = distance + s;
	}
}
function check_colissions(){
	// Check collissions between nukes and threats.
	var should_remove = 0;
	var new_nukes = [];
	var remove_nukes = [];
	for(var x in threats){
		var threat = threats[x];
		var ta = threats[x][0];
		var min = 360;
		for(var n in nukes){
			var nuke = nukes[n];
			var na = nuke[0];
			if(Math.abs(ta - na) < 1.0) { // increase dificulty: make it 0.01
				remove_nukes.push(n);
				warn("N"+(1+n)+" has impacted threat:"+threat[2]+" successfully!!\n Well done!");
				budget+=2; // difficulty: make this number bigger to make the game easier.

				threats[x][3] = 0 ; // Disable threat, remove nuke.
			}
			min = Math.min(min,Math.abs(ta - na));
		}
		console.log(min);
	}
	// slice:
	if(remove_nukes.length > 0){
		var x = 0;
		var new_nukes = [];
		while(x<nukes.length){
			if(remove_nukes[0] == x){
				x++;
				continue;
			}
			new_nukes.push(nukes[x]);
			x++;
		}
		nukes = new_nukes;
	}
}
function show_random_hint(){
	var x1 = [];
	if(budget >= 1) {
		x1.push("We Should get more bases.");
	}			
	x1.push(nuke_budget + " Nuke(s) left ");
	x1.push(threats.length+ " Threat(s) left ");

	if(nuke_budget > 20) {
		x1.push("We have a stockpile of nukes.");

	} else if(nuke_budget >= 10) {
		x1.push("We have a small stockpile of nukes.");

	} else if(nuke_budget >= 5) {
		x1.push("We aren't sure we'll make it, not a lot of nukes left...");

	} else if(nuke_budget >= 2) {
		x1.push("NASA is getting nervous, we don't have that many nukes left");

	} else if(nuke_budget == 0) {
		x1.push("Death inevitable?, Stock market starts free downfall.");
		x1.push("We are in trouble.");
	}
	var random_threat = threats[Math.min(Math.floor(Math.random() * threats.length),threats.length-1)];
	x1.push(random_threat[2] + " has priority " + priority_of(random_threat[1]));
	var el = Math.min(Math.floor(Math.random() * x1.length),x1.length-1);

	show_game_message(x1[el]);
}
function show_time(){
	var d = new Date(clock);
	// add " (" + clock + ") " 
	var msg = d +  deg2rad(clock2angle(clock)).toFixed(4) + " RAD " + clock2angle(clock).toFixed(2) +" DEG" ;// DISABLE
	document.getElementById("clock").innerHTML = msg;
	var times = get_times();
	clock = clock + times[time_speed] * 1000;

	// advance nukes.
	var s = times[time_speed] / 10;
	move_nukes();
	check_colissions();
	var active_count = count_active_threats();

	if(active_count == 0) {
		warn("Earth is saved, well done!");
		warn("The price of freedom, is Eternal Vigilance.");
		clearInterval(g_int);
		
	}
	// advance threats, check fail condition
	for(var x in threats){
		var threat = threats[x];
		
		if(threat[3] == 0){ // ignore empty threats.
			continue;
		}
		
		 // make slow (easy)
		threats[x][1] = threats[x][1] - s;
		
		if(threats[x][1] < 1) { // 1 radius of earth
			threats[x][1] = 0;
			render();
			alert("Game over:" + threats[x][2] + " ended life on earth.");
			clearInterval(g_int);
		}
		
	}
	if(Math.random() > 0.98 ) {
		show_random_hint();
	}
	render();
}
function set_speed(x){
	time_speed = x;
	warn("Time speed set to:" + x);
}
function random_name(){
	var x = ['D',"A",'X','E','F'];
	var el = Math.min(Math.floor(Math.random() * x.length),x.length-1);
	var n = Math.round(100 + Math.random() * 100);
	return x[el] + n;
}
function ang2quad(x){
	x = x % 360;
	if(x >= 0 && x < 90){
		return " Quadrant I";
	}else if(x >= 90 && x < 180){
		return " Quadrant II";
	}else if(x >= 180 && x < 270){
		return " Quadrant III";
	}else if(x >= 270 && x < 360){
		return " Quadrant IV";
	}else {
		return "?";
	}		
}
function random_base_name() {
	var x = ["Los Angeles Defense Area ","LA","SF","T","BR","HA","HM","R","TU","Oahu Defense Area OA","C","Chicago–Gary Defense Area ","L","BA","W","B","MS","KC","SL","BU","NF","OF","D","OA","La Chiquita ","Pforzheim","Bovolone","ESK","Houston #","Kennedy Space Center Hangar #","International Cooperation Base #","NUCLEAR SILO ","SILO #","JASDF 核ベースサイロ","общая армейская ядерная база шахта","EUROBASE","民主的新核孤岛","राष्ट्रीय साइलो","בסיס צבאי גרעיני"]
	var el = Math.min(Math.floor(Math.random() * x.length),x.length-1);
	var n = Math.round(50 + Math.random() * 12);
	return x[el] + n;
	
}
function add_threats(){
	
	threats.push([Math.random() * 360, 10000000/2 + Math.random() * 10000000,random_name(),1]);//7
	threats.push([Math.random() * 360, 10000000/2 + Math.random() * 10000000,random_name(),1]);
	threats.push([Math.random() * 360, 10000000/2 + Math.random() * 10000000,random_name(),1]);

	threats.push([Math.random() * 360, 1000000/2 + Math.random() * 1000000,random_name(),1]);
	threats.push([Math.random() * 360, 1000000/2 + Math.random() * 1000000,random_name(),1]);
	threats.push([Math.random() * 360, 1000000/2 + Math.random() * 1000000,random_name(),1]);

	threats.push([Math.random() * 360, 100000/2 + Math.random() * 100000,random_name(),1]);
	threats.push([Math.random() * 360, 100000/2 + Math.random() * 100000,random_name(),1]);
	threats.push([Math.random() * 360, 100000/2 + Math.random() * 100000,random_name(), 1]);//5
	
	// hard
	//threats.push([Math.random() * 360, 2 + Math.random() * 1000,random_name(),1]);
	//threats.push([Math.random() * 360, 2 + Math.random() * 1000,random_name(),1]);
	//threats.push([Math.random() * 360, 2 + Math.random() * 1000,random_name(),1]);

}
function add_bases(){
	for(var x=0;x<2;x++){// increase this for easier game
		g_bases.push([Math.random() * 360,random_base_name()]);
	}
}
function init(){
	add_threats();
	add_bases();
	g_int = setInterval(show_time,100);
	document.getElementById("input").focus();
}

function deg_to_dms (deg) {
   var d = Math.floor (deg);
   var minfloat = (deg-d)*60;
   var m = Math.floor(minfloat);
   var secfloat = (minfloat-m)*60;
   var s = Math.round(secfloat);
   // After rounding, the seconds might become 60. These two
   // if-tests are not necessary if no rounding is done.
   if (s==60) {
     m++;
     s=0;
   }
   if (m==60) {
     d++;
     m=0;
   }
   return ("" + d + "&deg; " + m + "' " + s+"''");
}

function deg2hms(x){
	return deg_to_dms(x);
	/*
	var remainder = x % 1;
	var d = (x - remainder); 
	var m =  (( remainder )  * 60) % 60;
	var s =  (( remainder )  * 3600) % 3600;

	return d + "&deg; : " + m + "' : " + s+"''";
	*/
}
function deg2rad(x){
	return Math.PI * (parseFloat(x) / 180);
}
function u_input(){
	var input = document.getElementById("input").value;
	document.getElementById("input").value = "";
	document.getElementById("input").focus();
	input = input.toLowerCase().trim().split(" ");
	var c = input[0];
	var p = input[input.length-1];

	run_command(c,p);
}
function base2str(baseid){
	return deg2hms(g_bases[baseid][0]) + "\t" + g_bases[baseid][1];
}
function warnings(){
	
}
function priority_of(distance){
	var priority = "";
	if(distance > 1000000) {
		priority = " Lowest (P9)";
	}else if(distance > 100000) {
		priority = " Lower (P8)";
	}else if(distance > 50000) {
		priority = " Medium-Low (P7)";
	}else if(distance > 10000) {
		priority = " Medium (P6)";
	}else if(distance > 5000) {
		priority = " Medium-High (P5)";
	}else if(distance > 1000) {
		priority = " High (P4)";
	}else if(distance > 500) {
		priority = " Highest (P3)";
	}else if(distance > 100) {
		priority = " Urgent (P2)";
	}else if(distance > 10) {
		priority = " Critical (P1)";
	}else {
		priority = " It may be too late.. (P0)";
	}
	return priority;
}
function render(){
	var w = 1800;
	var h = 1000;


	var c = document.getElementById("earth");
	var ctx = c.getContext("2d");
	ctx.font = "20px Courier new";
	ctx.clearRect(0, 0, w, h);
	
	var zooms = [2,4,8,16,32,64,128,256,512];
	var zoom_level = zooms[zoom_mode%zooms.length];

	var linear_factor = 1000;
	var earth_radius = 200;
	var midx = w/2;
	var midy = h/2;


	// draw angularguides
	ctx.beginPath();
	ctx.strokeStyle = "#404040";
	ctx.lineWidth = 2;

	// Earth
	for(var x=0;x<360;x+=45/2){
		ctx.beginPath();
		ctx.moveTo(midx, midy);
		ctx.lineTo(midx + Math.cos(deg2rad(x)) * 1000, midy - Math.sin(deg2rad(x)) * 1000);
		ctx.stroke(); 
	}
	
	ctx.stroke(); 


	// draw ruler guides

	// Earth
	var color = 50;
	for(var x=0;x<100;x++){
		ctx.beginPath();
		ctx.strokeStyle = "rgb("+color+","+color+","+color+")";
		ctx.lineWidth = 2;
		var r = earth_radius + zoom_level * x * 10;// linear
		if(render_mode == 1){
			r = earth_radius + zoom_level * Math.log(x) * 10;
		}
		ctx.arc(midx,midy, r, 0, 2 * Math.PI);// full circle.
		ctx.stroke(); 
		color--;

	}
	

	ctx.beginPath();
	ctx.strokeStyle = "white";
	ctx.lineWidth = 2;
	
	// Earth
	ctx.arc(midx,midy, earth_radius, 0, 2 * Math.PI);// full circle.

	ctx.stroke(); 
	
	if(render_map==0){
		return;
	}
	var offset = 5;
	var text_offset_x = 10;
	var text_offset_y = 30;
	var text_height = 24;
	var character_length = 15;
	var threat_radius = 400;

	// BASES:

	ctx.beginPath();
	ctx.strokeStyle = "lightblue";
	ctx.lineWidth = 2;
	
	
	for(var x in g_bases) {
		var a = clock2angle(clock);
		var bx = midx + Math.cos(deg2rad(a + g_bases[x][0])) * earth_radius-offset;
		var by = midy - Math.sin(deg2rad(a + g_bases[x][0])) * earth_radius-offset;
		ctx.rect(bx, by, offset*2, offset*2);

		var dd = deg2hms(g_bases[x][0]).replace("&deg;"," ");
		var tl = Math.max(g_bases[x][1].length,dd.length) * character_length;

		ctx.rect(bx + text_offset_x-4, by - text_offset_y - text_height,tl, text_height*2 + 2*4);

		ctx.strokeText(g_bases[x][1] , bx + text_offset_x, by - text_offset_y);
		ctx.strokeText(dd, bx + text_offset_x, by - text_offset_y + offset * 4);

	}
	ctx.stroke(); 
	ctx.beginPath();
	ctx.strokeStyle = "red";
	ctx.lineWidth = 2;
	

	
	for(var t in threats) {
		var threat = threats[t];
		if(threat[3] == 0){ // ignore empty threats.
			continue;
		}
		
		var distance = threat[1];
		var current_threat_radius = earth_radius + zoom_level * distance / linear_factor;//7*5=350
		if(render_mode == 1){
			current_threat_radius = earth_radius + zoom_level * Math.log(distance)
		}
		var bx = midx + Math.cos(deg2rad(threat[0])) * current_threat_radius-offset;
		var by = midy - Math.sin(deg2rad(threat[0])) * current_threat_radius-offset;
		ctx.rect(bx, by, offset*2, offset*2);

		var tx = Math.cos(deg2rad(threat[0])) * distance;
		var ty = Math.sin(deg2rad(threat[0])) * distance;
		var dd = ""+tx.toFixed(2)+", "+ty.toFixed(2)+"), D= " + distance.toFixed(2) + " ";
		
		var tl = Math.max(threat[2].length,dd.length) * character_length;

		ctx.rect(bx + text_offset_x-4, by - text_offset_y - text_height,tl, text_height*2 + 2*4);

		ctx.strokeText(threat[2] + priority_of(distance) , bx + text_offset_x, by - text_offset_y);
		ctx.strokeText(dd, bx + text_offset_x, by - text_offset_y + offset * 4);

	}
	ctx.stroke(); 
	ctx.beginPath();
	ctx.strokeStyle = "lightgreen";
	ctx.lineWidth = 2;
	
	
	for(var t in nukes){
		var nuke = nukes[t];
		var angle = nuke[0];
		var distance = nuke[1];

		var nuke_radius = earth_radius + zoom_level * distance / linear_factor;//7*5=350
		if(render_mode == 1){
			nuke_radius = earth_radius + zoom_level * Math.log(distance);
		}
		var bx = midx + Math.cos(deg2rad(angle)) * nuke_radius - offset;
		var by = midy - Math.sin(deg2rad(angle)) * nuke_radius - offset;
		var tl = 5 * character_length;
		
		ctx.rect(bx, by, offset*2, offset*2);

		//ctx.rect(bx + text_offset_x-4, by - text_offset_y - text_height,tl, text_height*2 + 2*4);
	}
	ctx.stroke(); 
	
}
function run_command(c,p){
	if(c == "h"){
		var cmd = "";
		cmd += "<b> t     </b>  Search Threats \n";		// OK
		cmd += "<b> l     </b>  List bases \n";			// OK
		cmd += "<b> n     </b>  Nuke Status \n";
		cmd += "<b> s b   </b>  Select Base &lt;b&gt; (numer, from 1 to "+g_bases.length+") \n"; // OK
		cmd += "<b> f     </b>  Fire from Selected Base \n";  // angle, base.
		cmd += "<b> b     </b>  Show Budget \n";
		cmd += "<b> rd r  </b>  Radians to Degrees \n";		// OK
		cmd += "<b> dr d  </b>  Degrees to Radians \n";		// OK
		cmd += "<b> dh d  </b>  Degrees to Hour:Minute:Second\n";		// OK
		cmd += "<b> a     </b>  Ask for funding \n";		// OK
		cmd += "<b> m     </b>  Render mode (Linear, logarithmic) \n";		// OK
		cmd += "<b> z     </b>  Zoom mode (1-6) \n";		// OK
		cmd += "<b> mm    </b>  Toggle Map \n";		// OK
		//cmd += "<b> i     </b>  Install New Base \n";		// OK
		cmd += "<b> sp s  </b>  Change Simulation Speed s (1 to 4)\n";		// OK
		cmd += "<b> sin a </b>  Calculates the sine of a in radians. \n";	// OK
		cmd += "<b> cos a </b>  Calculates the cosine of a in radians. \n";	// OK
		cmd += "<b> tan a </b>  Calculates the tangent of a in radians. \n";	// OK
		cmd += "<b> h     </b>  Help \n";
		warn("Commands:\n"+cmd);
	} else if(c == "l"){
		var msg = "";
		msg += "Base List:\n";
		for(var x in g_bases){
			var ss = "";
			if(x == selected_base){
				ss = "   <- Selected ";
			}
			msg += (1+parseInt(x,10)) + ".   " + base2str(x) + ss+"\n";
		}
		if(budget>0){
			msg += "Get more bases with 'a':\n";
		}
		warn(msg);
	} else if(c == "t"){
		var msg = "";
		msg += "Threat List:\n";
		for(var t in threats){
			var threat = threats[t];
			if(threat[3] == 0){ // ignore empty threats.
				continue;
			}
			
			var distance = threats[t][1];
			var priority = priority_of(distance);
			var tx = Math.cos(deg2rad(threats[t][0])) * distance;
			var ty = Math.sin(deg2rad(threats[t][0])) * distance;
			msg += (1+parseInt(t,10)) + ".  "+threat[2] +" ( x = " + tx.toFixed(3) + ",\t y = " + ty.toFixed(3) +") \t"+priority+ " " + ang2quad(threats[t][0]) + "\n";//+ " REMOVE \t" + threats[t][0]+
		}
		msg += "\n";
		warn(msg);
	} else if(c == "n"){
		var msg = "";
		msg += "Fired Nuke List:\n";
		for(var t in nukes){
			var nuke = nukes[t];
			var angle = nuke[0];
			var distance = nuke[1];
			var tx = Math.cos(deg2rad(angle)) * distance;
			var ty = Math.sin(deg2rad(angle)) * distance;
			msg += "N"+(1+parseInt(t,10)) + ". ( x = " + tx.toFixed(6) + ",\t y = " + ty.toFixed(6) +") "+ ang2quad(nuke[0]) +" Angle: " +nuke[0].toFixed(4) + " DEG \n";
		}
		msg += "\n";
		warn(msg);

	} else if(c == "f"){ // Fire!
		if(nuke_budget == 0){
			warn("Can't fire. out of Nukes :(");
			return;
		}
		var time_of_day = 0;//new Date(clock);
		var angle = g_bases[selected_base][0] + clock2angle(clock);
		angle = angle % 360;
		var nuke = [angle, 1];// ang, dist. 1 is radius of earth
		nukes.push(nuke);
		nuke_budget--;
		warn("Fired nuke from base:" + base2str(selected_base) + " at " + deg2rad(angle).toFixed(6) + " RAD " + " REM " + angle.toFixed(6) + " DEG\nWe now have only:" + nuke_budget + " Nukes left");
		// check collision.
		
	} else if(c == "a"){
		if(budget > 0) {
			budget--;
			g_bases.push([Math.random() * 360,random_base_name()]);
			warn("New base:\n" + base2str(g_bases.length-1) + "\nYou now have " + g_bases.length + " bases..");
		}else{
			warn("Can't buy base.\nAquire budget by showing results\nSearch threats with t\nEliminate threats with f");
		}
	} else if(c == "s"){
		selected_base = Math.min(g_bases.length,Math.max(1,parseInt(p,10)))-1;
		warn("Selected Base:" + base2str(selected_base));
	} else if(c == "m"){
		render_mode++;
		if(render_mode==2){
			render_mode = 0;
		}
		var w = ["linear","logarithmic"];
		warn("Selected Render Mode: " + w[render_mode]);
	} else if(c == "z"){
		zoom_mode++;
		if(zoom_mode==8){
			zoom_mode = 0;
		}
		warn("Selected Zoom Mode: " + zoom_mode);
	} else if(c == "mm"){
		render_map++;
		if(render_map==2){
			render_map = 0;
		}
		warn("Selected Map Mode: " + render_map);
	} else if(c == "b"){
		warn("Nuke Budget:" + (nuke_budget) + " Base Budget:"  + budget);
	} else if(c == "sp"){
		set_speed(Math.min(get_times().length,Math.max(0,parseInt(p,10))));
	} else if(c == "rd"){
		warn(180 * (parseFloat(p) / Math.PI));
	} else if(c == "dh"){
		warn(deg2hms(parseFloat(p)));
	} else if(c == "dr"){
		warn(Math.PI * (parseFloat(p) / 180));
	} else if(c == "sin"){
		warn(Math.sin(parseFloat(p)));
	} else if(c == "cos"){
		warn(Math.cos(parseFloat(p)));
	} else if(c == "tan"){
		warn(Math.tan(parseFloat(p)));
	} else if(c == ""){
		warn("Try h for help.");
	}else{
		warn("Unrecognized command: " + c + "  try h for help.");
	}

}
// https://stackoverflow.com/questions/5786025/decimal-degrees-to-degrees-minutes-and-seconds-in-javascript
// https://www.rapidtables.com/convert/number/degrees-minutes-seconds-to-degrees.html
// https://www.plus2net.com/html_tutorial/html_marquee_behvr.php
// https://www.tutorialspoint.com/html/html_marquee_tag.htm
//
