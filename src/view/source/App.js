//enyo.dispatcher.listen(document, "myEvent");
// Main application structure
enyo.kind({
	name : "App",
	classes: "container-fluid",
	style:"overflow: auto;",
	handlers: {
		onSequenceItemTapped : "sequenceTapped",
		onValidSequence : "sequenceValidated",
		onHelpTapped : "helpTapped",	
	},
	components:[
		// Title and description
		{tag: "div", name: "header", classes:"row-fluid", components:[
			{tag: "div", name: "title_span12", classes:"span12", components:[
				{tag: "div", classes:"well well-small", components:[
					{kind: "Head", name:"head"}
				]
				}

			]}
		]},
		{tag:"div", classes:"well", components:[
		{tag: "div", name: "body", classes:"row-fluid", components:[
				{tag: "div", name: "video_span6", classes:"span6", components:[
					// Video
					{kind: "Elang.Video", name : "video"}
				]},
			
				// Sequence list
				{tag: "div", name: "list_span6", classes:"span6", components:[
					{tag: "h1", content: "Liste des séquences"},
					{kind: "Sequences", name:"sequences"}
				]}
			]},
			
		// Exercise
		{tag: "div", name: "footer", classes:"row-fluid", components:[
			{tag: "div", name: "input_span12", classes:"span12", components:[
				{tag: "h1", content: "Exercice"},
				{kind: "elang.input", name:"input"}
			]}
		]}
		]}, 
		
		// Modal to alert when the ajax request failed 
		{tag: 'div', classes: 'modal hide fade', components: [
			{tag: 'div', classes: 'modal-header', components: [
				{tag: 'button', name: 'buttonAlert1', type: 'button', classes: 'close', attributes: {'data-dismiss': 'modal', 'aria-hidden': 'true'}, content:'x'}, 
				{tag: 'h1', content:'Error !'}, 
			]}, 
			{tag: 'div', classes: 'modal-body', components: [
				{tag: 'p', content:'There is a problem when I try to get the content, please try again later...'}
			]}, 
			{tag: 'div', classes: 'modal-footer', components: [
				{tag: 'button', name: 'buttonAlert2', classes: 'btn', attributes: {'data-dismiss': 'modal', 'aria-hidden': 'true'}, content:'Close'}, 
			]}, 
		]}
	], 
	sequenceTapped:function(inSender,inEvent){
		/*alert("Sequence id "+this.$.sequences.getIdSequenceCourante()+
		" de "+this.$.sequences.getDebutSequenceCourante()+" a "+this.$.sequences.getFinSequenceCourante());*/
		this.$.video.setTime(this.$.sequences.getDebutSequenceCourante());
		this.$.video.setEnd(this.$.sequences.getFinSequenceCourante());
		this.$.input.displaySequence(this.$.sequences.getIdSequenceCourante());	
    },
	
	helpTapped:function(inSender,inEvent){
	  this.$.sequences.setType('help');
    },
	
	sequenceValidated:function(inSender,inEvent)
	{
      this.$.sequences.setType('verified');
	},
	
	create: function(){
		this.inherited(arguments);
		this.getData();
	},
	
	
	// Function to get the video data 
	getData: function(){
		// Request creation
		var request = new enyo.Ajax({
	    		url: 'server.php', //document.URL,
	    		method: "POST", //"GET" or "POST"
	    		handleAs: "text", //"json", "text", or "xml"
	    	});	

		//tells Ajax what the callback function is
        request.response(enyo.bind(this, "getDataResponse")); 
		//makes the Ajax call with parameters
        request.go({task: 'data'}); 
	},
	
	getDataResponse: function(inRequest, inResponse){
		// If there is nothing in the response then return early.
		if (!inResponse) { 
			$('.modal').modal('toggle');
	        return;
	    }

		var response = JSON.parse(inResponse);
		
		// Broadcast the data to the children fields 
		this.$.head.setHeadTitle(response.title);
		this.$.head.setHeadDescription(response.description);
		this.$.input.setInputList(response.inputs);
		
		// Call the function to update the children
		this.$.head.updateData();

		
		this.$.input.setInputList(response.inputs);
		
		// Construct sequences object
		this.$.sequences.createSequences(response.sequences);

		// Construct video object
		for (var source in response.sources)
		{
			this.$.video.addSource(response.sources[source].url, response.sources[source].type);
		}
		this.$.video.render();

		if (response.poster)
		{
			this.$.video.setPoster(response.poster);
		}
		this.$.video.setLanguage(response.language);
		this.$.video.setTrack(response.track);
	}

});
