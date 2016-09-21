
function figureoutDates(birthdate, deathdate){
    
    if (birthdate === "" ) return "";
    var bday = "";
    var dday = "";
    bday = wikiTexttoDate(birthdate);
        console.log(bday);
    
    if (deathdate === "" ){
        
        age = getAge(bday,"");
        
        return " is alive. They are currently " + age + " years old.";
    }
    else{
        
        
        dday = wikiTexttoDate(deathdate);
        console.log(dday);
        
        age = getAge(bday,dday);
        
        return " is dead.  They died at the age of " + age + ".";
        
    }
    
    
    
 

}

function wikiTexttoDate(wikitext){
    
    var wikiarray = wikitext.replace("}","|").split('|');
    var which = 0;
    var year = 0;
    var month = 0;
    var day = 0;
    console.log("Before for loop");
    
    for (var i = 0, len = wikiarray.length; i < len; i++) {
        console.log("Checking: " +wikiarray[i]);
        if (!isNaN(wikiarray[i])){
            switch (which){
                case 0:
                    year = wikiarray[i];
                    console.log("added year" + year);
                    break;
                case 1:
                    month = wikiarray[i]-1;
                    console.log("added month" + month);
                    break;
                case 2:
                    day = wikiarray[i];
                    console.log("added day" + day);
                    break;

            }
            which = which +1;
        }
    }
    
    return new Date(year, month, day);
    
    
}

//Ripped right from stackoverflow!
function getAge(dateString, comparedate) {
    var today = "";
    if (comparedate === "" ) today = new Date();
    else today = comparedate;
    var birthDate = dateString;
    
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

//Ripped right from stackoverflow!
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

exports.handler = (event, context, callback) => {
    // TODO implement
    
     if (!event.challenge) {} else context.done(null,{"challenge": event.challenge});
    
    
    if (!event.text)  celebrity = "Alexander Graham Bell";
    else celebrity = event.text.replace(":","").replace(" ","").replace("<","").replace(">","").replace(",","").substring(4);
    
    celebrity = capitalizeFirstLetter(celebrity);
    
    finaltext = "Could not find " + celebrity + ".";
    var https = require('https');

    url = '/w/api.php?action=query&titles=' + escape(celebrity) + '&prop=revisions&rvprop=content&format=json';
    fullurl = "http://en.wikipedia.org/wiki/" + celebrity.split(" ").join("_");
    
    console.log('start request to');
    
        var options = {
    host: 'en.wikipedia.org',
    port: 443,
    path: url
    };
    
    
    https.get(options, function(res) {
        console.log("Got response: " + res.statusCode);
        res.setEncoding('utf8');
        
        var body = '';
    res.on('data', function(chunk) {
        body += chunk;
    });
    res.on('end', function() {
        console.log("BODY:" + body);
        searchanswer = body.toUpperCase().search("BIRTH_DATE");
        if (searchanswer >0 ){
        var jsonObj = JSON.parse(body);
        
        for(var nextKey in jsonObj.query.pages) {
            
            var revs = jsonObj.query.pages[nextKey].revisions;
            for (var revKey in revs[0]){
                if (revKey == "*") {
                    //console.log(revs[0][revKey]);
                    var bodystring = revs[0][revKey].toString();
                    var bdaytext = "";
                    var ddaytext = "";
                    console.log(bodystring);
                    
                     searchanswer = bodystring.toUpperCase().search("BIRTH_DATE");
                    if (searchanswer>0){
                     
                        bdaytext = bodystring.substring(searchanswer + 13, searchanswer + 60);
                        console.log(bdaytext);
                        
                    }
                    
                    searchanswer = bodystring.toUpperCase().search("{{DEATH DATE");
                    if (searchanswer>0){
                     
                        ddaytext = bodystring.substring(searchanswer + 13, searchanswer + 60);
                        console.log(ddaytext);
                        
                    }
                    finaltext = celebrity + " " + figureoutDates(bdaytext,ddaytext) + " Source: <" + fullurl + "|Wikipedia>";
                    console.log(finaltext);
                    if (celebrity == finaltext) finaltext = "Could not find " + celebrity + ".";
                    context.done(null,{"text": finaltext});
                    
                }
            }
            
        }
         
        }else context.done(null,{"text": finaltext});
        
    });
        
        
      
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        context.done(null,{"text": finaltext});
    });
    
  
    //setTimeout(callback(null, {"text": finaltext}),4000);
  
  
}
