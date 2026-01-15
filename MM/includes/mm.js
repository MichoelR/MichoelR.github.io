	function addevents() { // onload
		var str = "",oI,oIid;
		var zz = document.getElementsByClassName("section");
		for (ii=0;ii<zz.length;ii++) {
			oI = zz[ii]; oIid = (oI.id.split("_")[0]).replace("s","");
			oI.addEventListener("click",movesection);
			oI.addEventListener("keyup",movesection);
			oI.meta = metasection[oIid];
		}
		var zz=document.getElementsByClassName("phrase");
		for (ii=0;ii<zz.length;ii++) {
			oI = zz[ii]; oIid = (oI.id.split("_")[0]).replace("p","");
			oI.addEventListener("mouseover",matchphrase);
			oI.addEventListener("keyup",matchphrase); // tabs to next "phrase" span
			oI.meta = metaphrase[oIid];
		}
	}

	function movesection() { // bring section near to top
	return; // DEBUGGING; do without this
		var thisid = this.id; thisid = thisid.replace("s",""); // id in form s#_#
		var thisids = thisid.split("_");
		var colnum = thisids[1];
		var sectid = thisids[0];
			scrollIntoViewPlus(this,colnum); // bring section into view
	}
	
	function matchphrase() {
		dropsections(); // start by dropping _all_ lighted sections
		dropphrases(); // drop all phrases everywhere
		var thisid = this.id; thisid=thisid.replace("p",""); // id in form p#_#
		var thisids = thisid.split("_");
		var colnum = thisids[1];
		var phraseid = thisids[0];
		var sectionid = "s"+this.meta.sectidno+"_"+colnum;
		var oSection = document.getElementById(sectionid);
		showsection(oSection,colnum); // set css for the surrounding section
		this.classList.add("phraseselected"); // set css for this phrase
		showaliyah(colnum,this.meta.aliyah);
		this.focus();
		// now find what we need in other column
		var colnum2 = 3-colnum;
		var colid2 = "col"+colnum2;
		var oCol2 = document.getElementById(colid2);
		var otherpid = this.meta.toidno;
		var otherid = "p"+otherpid+"_"+colnum2; // DEBUGGING
		var oOther = document.getElementById(otherid);
		var oOtherSection;
		if (oOther) {
			sectionid = "s"+oOther.meta.sectidno+"_"+colnum2;
			oOtherSection = document.getElementById(sectionid);
			showsection(oOtherSection,colnum2);
			scrollIntoViewPlus(oOtherSection,colnum2); // bring section into view
			oOther.classList.add("phraseselected");
			showaliyah(colnum2,oOther.meta.aliyah);
		} else { // show default matching section for that initial section
			var othersid = "s"+oSection.meta.toidno+"_"+colnum2;
			oOtherSection = document.getElementById(othersid);
			if (oOtherSection) {
				showsection(oOtherSection,colnum2);
				scrollIntoViewPlus(oOtherSection,colnum2)
				showaliyah(colnum2,oOtherSection.meta.aliyah); // we only need this one if we can't find the other phrase
			}
		}
	}

	function dropsections() { // drop all sections
		var sections=document.getElementsByClassName("selected");
		for (var ii=0; ii<sections.length; ii++) {
			oSect = sections[ii];
			oSect.classList.remove("selected");
		}
	}

	function showsection(oSection,colnum)	{
		// set css for selected section
		oSection.classList.add("selected");
		var colid="col"+colnum;
		var oCol=document.getElementById(colid);
		// show metadata
		showparsha(colnum,oSection.meta.sedra);
		showpesukim(oCol,colnum,oSection); // show the chapter and posuk for first and last visible
	}
	
	function dropphrases() { // deselect all phrases
		var phrases = document.getElementsByClassName("phraseselected");
		var oPhrase;
		for (var ii=0; ii<phrases.length; ii++) {
			oPhrase = phrases[ii];
			oPhrase.classList.remove("phraseselected");
		}
	}
	
	function scrollIntoViewPlus(oSection,colnum) { // 100 pixels from top
		oSection.scrollIntoView();
		var oCol=document.getElementById("col"+colnum);
		oCol.scrollTop += -100;
	}
	
	function showparsha(colnum,parshaname) {
		var oMetaparsha = document.getElementById("metaparsha_"+colnum);
		oMetaparsha.innerHTML = parshaname;
	}
	function showaliyah(colnum,aliyah) {
		var oMetaaliyah = document.getElementById("metaaliyah_"+colnum);
		oMetaaliyah.innerHTML = aliyah;
	}
	function showpesukim(oCol,colnum,oSect) { // show chapter and posuk at top and bottom of visible area
		// we need to track up and down from the current section (which is presumably visible),
		// to check the phrases above and below
		var sectphrases=oSect.meta.phrases; // array of phrases in this section
		var upphrase=sectphrases[0],downphrase=sectphrases[sectphrases.length-1]; //ids
		var upindex=metaphrase[upphrase].index,downindex=metaphrase[downphrase].index;
		var phid;
		do { --upindex; upphrase=phrases[upindex]; phid="p"+upphrase+"_"+colnum;} // should return the first one that isn't visible
		while ( (upindex>0) && isVisible(phid,oCol) );
		do { ++downindex; downphrase=phrases[downindex]; phid="p"+downphrase+"_"+colnum;}
		while ( (downindex<phrases.length) && isVisible(phid,oCol) );
		++upindex; --downindex; // take last visible ones
		upphrase = phrases[upindex]; downphrase = phrases[downindex];
		var mph = metaphrase[upphrase];
		var upperekH = mph.perekH, upposukH = mph.posukH;
		var msect = mph.sectidno, upsefer = metasection[msect].sefer;
		mph = metaphrase[downphrase];
		var downperekH = mph.perekH, downposukH = mph.posukH;
		msect = mph.sectidno;
		var downsefer = metasection[msect].sefer;
		// okay, display these values
		var oTop = document.getElementById("topposuk_"+colnum);
		oTop.innerHTML = upsefer+" "+upperekH+" "+upposukH;
		var oBottom = document.getElementById("bottomposuk_"+colnum);
		oBottom.innerHTML = downsefer+" "+downperekH+" "+downposukH;
	}
	
	function isVisible(phid, oCol) { // is this element visible?
		var elt=document.getElementById(phid);
		var topthis=elt.offsetTop; // distance from top of parent
		var scrollpos=oCol.scrollTop; // scrolling position
		var topdiv=oCol.offsetTop; // distance of div from top of window
		var thispos=topthis-scrollpos-topdiv; // visible position of elt
		var thisHeight=elt.offsetHeight; // size of elt
		if ((thispos+thisHeight)<0) return false;
		var divHeight=oCol.offsetHeight;
		if (thispos>divHeight) return false; // off the bottom
		return true;
	}
