export default {"1":function(container,depth0,helpers,partials,data) {
    return "            <li>"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "</li>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <li><strong>"
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":122,"column":24},"end":{"line":122,"column":32}}}) : helper)))
    + ":</strong> "
    + alias4(((helper = (helper = lookupProperty(helpers,"description") || (depth0 != null ? lookupProperty(depth0,"description") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"description","hash":{},"data":data,"loc":{"start":{"line":122,"column":43},"end":{"line":122,"column":58}}}) : helper)))
    + "</li>\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <li><strong>"
    + alias4(((helper = (helper = lookupProperty(helpers,"service") || (depth0 != null ? lookupProperty(depth0,"service") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"service","hash":{},"data":data,"loc":{"start":{"line":137,"column":24},"end":{"line":137,"column":35}}}) : helper)))
    + ":</strong> "
    + alias4(((helper = (helper = lookupProperty(helpers,"purpose") || (depth0 != null ? lookupProperty(depth0,"purpose") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"purpose","hash":{},"data":data,"loc":{"start":{"line":137,"column":46},"end":{"line":137,"column":57}}}) : helper)))
    + " "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"location") : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":137,"column":58},"end":{"line":137,"column":95}}})) != null ? stack1 : "")
    + "</li>\n";
},"6":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "("
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"location") || (depth0 != null ? lookupProperty(depth0,"location") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"location","hash":{},"data":data,"loc":{"start":{"line":137,"column":75},"end":{"line":137,"column":87}}}) : helper)))
    + ")";
},"8":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <li><strong>"
    + alias4(((helper = (helper = lookupProperty(helpers,"right") || (depth0 != null ? lookupProperty(depth0,"right") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"right","hash":{},"data":data,"loc":{"start":{"line":145,"column":24},"end":{"line":145,"column":33}}}) : helper)))
    + ":</strong> "
    + alias4(((helper = (helper = lookupProperty(helpers,"description") || (depth0 != null ? lookupProperty(depth0,"description") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"description","hash":{},"data":data,"loc":{"start":{"line":145,"column":44},"end":{"line":145,"column":59}}}) : helper)))
    + "</li>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<!DOCTYPE html>\n<html lang=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"lang") || (depth0 != null ? lookupProperty(depth0,"lang") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lang","hash":{},"data":data,"loc":{"start":{"line":2,"column":12},"end":{"line":2,"column":20}}}) : helper)))
    + "\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>"
    + alias4(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":6,"column":11},"end":{"line":6,"column":20}}}) : helper)))
    + "</title>\n    <style>\n        body {\n            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n            line-height: 1.6;\n            color: #333;\n            max-width: 800px;\n            margin: 0 auto;\n            padding: 20px;\n            background-color: #f9f9f9;\n        }\n        .container {\n            background: white;\n            padding: 40px;\n            border-radius: 8px;\n            box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n        }\n        h1 {\n            color: #2c3e50;\n            border-bottom: 3px solid #3498db;\n            padding-bottom: 10px;\n        }\n        h2 {\n            color: #34495e;\n            margin-top: 30px;\n        }\n        h3 {\n            color: #7f8c8d;\n        }\n        .last-updated {\n            font-style: italic;\n            color: #7f8c8d;\n            margin-bottom: 30px;\n        }\n        .contact-info {\n            background: #ecf0f1;\n            padding: 20px;\n            border-radius: 5px;\n            margin-top: 20px;\n        }\n        ul {\n            padding-left: 20px;\n        }\n        li {\n            margin-bottom: 8px;\n        }\n        .gdpr-notice {\n            background: #e8f5e8;\n            border-left: 4px solid #27ae60;\n            padding: 15px;\n            margin: 20px 0;\n        }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <h1>"
    + alias4(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":62,"column":12},"end":{"line":62,"column":21}}}) : helper)))
    + "</h1>\n        <p class=\"last-updated\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"lastUpdated") || (depth0 != null ? lookupProperty(depth0,"lastUpdated") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lastUpdated","hash":{},"data":data,"loc":{"start":{"line":63,"column":32},"end":{"line":63,"column":47}}}) : helper)))
    + "</p>\n\n        <h2>Introduction</h2>\n        <p>"
    + alias4(((helper = (helper = lookupProperty(helpers,"introduction") || (depth0 != null ? lookupProperty(depth0,"introduction") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"introduction","hash":{},"data":data,"loc":{"start":{"line":66,"column":11},"end":{"line":66,"column":27}}}) : helper)))
    + "</p>\n\n        <div class=\"gdpr-notice\">\n            <strong>GDPR Notice:</strong> "
    + alias4(((helper = (helper = lookupProperty(helpers,"gdprNotice") || (depth0 != null ? lookupProperty(depth0,"gdprNotice") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"gdprNotice","hash":{},"data":data,"loc":{"start":{"line":69,"column":42},"end":{"line":69,"column":56}}}) : helper)))
    + "\n        </div>\n\n        <h2>Information We Collect</h2>\n        \n        <h3>Personal Information</h3>\n        <ul>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"personalInfo") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":76,"column":12},"end":{"line":78,"column":21}}})) != null ? stack1 : "")
    + "        </ul>\n\n        <h3>Location Data</h3>\n        <p>"
    + alias4(((helper = (helper = lookupProperty(helpers,"locationDataDescription") || (depth0 != null ? lookupProperty(depth0,"locationDataDescription") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"locationDataDescription","hash":{},"data":data,"loc":{"start":{"line":82,"column":11},"end":{"line":82,"column":38}}}) : helper)))
    + "</p>\n        <ul>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"locationData") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":84,"column":12},"end":{"line":86,"column":21}}})) != null ? stack1 : "")
    + "        </ul>\n\n        <h3>Camera and Photos</h3>\n        <p>"
    + alias4(((helper = (helper = lookupProperty(helpers,"cameraDescription") || (depth0 != null ? lookupProperty(depth0,"cameraDescription") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"cameraDescription","hash":{},"data":data,"loc":{"start":{"line":90,"column":11},"end":{"line":90,"column":32}}}) : helper)))
    + "</p>\n        <ul>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"cameraData") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":92,"column":12},"end":{"line":94,"column":21}}})) != null ? stack1 : "")
    + "        </ul>\n\n        <h3>Device Information</h3>\n        <ul>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"deviceInfo") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":99,"column":12},"end":{"line":101,"column":21}}})) != null ? stack1 : "")
    + "        </ul>\n\n        <h3>Audio and Microphone Data</h3>\n        <ul>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"audioData") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":106,"column":12},"end":{"line":108,"column":21}}})) != null ? stack1 : "")
    + "        </ul>\n\n        <h3>Notification Data</h3>\n        <ul>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"notificationData") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":113,"column":12},"end":{"line":115,"column":21}}})) != null ? stack1 : "")
    + "        </ul>\n\n        <h2>Legal Basis for Processing (GDPR)</h2>\n        <p>"
    + alias4(((helper = (helper = lookupProperty(helpers,"legalBasisIntro") || (depth0 != null ? lookupProperty(depth0,"legalBasisIntro") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"legalBasisIntro","hash":{},"data":data,"loc":{"start":{"line":119,"column":11},"end":{"line":119,"column":30}}}) : helper)))
    + "</p>\n        <ul>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"legalBases") : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":121,"column":12},"end":{"line":123,"column":21}}})) != null ? stack1 : "")
    + "        </ul>\n\n        <h2>How We Use Your Information</h2>\n        <ul>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"dataUsage") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":128,"column":12},"end":{"line":130,"column":21}}})) != null ? stack1 : "")
    + "        </ul>\n\n        <h2>Data Sharing and International Transfers</h2>\n        <p>"
    + alias4(((helper = (helper = lookupProperty(helpers,"dataSharingIntro") || (depth0 != null ? lookupProperty(depth0,"dataSharingIntro") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"dataSharingIntro","hash":{},"data":data,"loc":{"start":{"line":134,"column":11},"end":{"line":134,"column":31}}}) : helper)))
    + "</p>\n        <ul>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"dataSharing") : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":136,"column":12},"end":{"line":138,"column":21}}})) != null ? stack1 : "")
    + "        </ul>\n\n        <h2>Your Rights Under GDPR</h2>\n        <p>"
    + alias4(((helper = (helper = lookupProperty(helpers,"rightsIntro") || (depth0 != null ? lookupProperty(depth0,"rightsIntro") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"rightsIntro","hash":{},"data":data,"loc":{"start":{"line":142,"column":11},"end":{"line":142,"column":26}}}) : helper)))
    + "</p>\n        <ul>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"gdprRights") : depth0),{"name":"each","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":144,"column":12},"end":{"line":146,"column":21}}})) != null ? stack1 : "")
    + "        </ul>\n\n        <h2>Data Security</h2>\n        <p>"
    + alias4(((helper = (helper = lookupProperty(helpers,"securityDescription") || (depth0 != null ? lookupProperty(depth0,"securityDescription") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"securityDescription","hash":{},"data":data,"loc":{"start":{"line":150,"column":11},"end":{"line":150,"column":34}}}) : helper)))
    + "</p>\n        <ul>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"securityMeasures") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":152,"column":12},"end":{"line":154,"column":21}}})) != null ? stack1 : "")
    + "        </ul>\n\n        <h2>Data Retention</h2>\n        <p>"
    + alias4(((helper = (helper = lookupProperty(helpers,"dataRetentionPolicy") || (depth0 != null ? lookupProperty(depth0,"dataRetentionPolicy") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"dataRetentionPolicy","hash":{},"data":data,"loc":{"start":{"line":158,"column":11},"end":{"line":158,"column":34}}}) : helper)))
    + "</p>\n\n        <h2>Children's Privacy</h2>\n        <p>"
    + alias4(((helper = (helper = lookupProperty(helpers,"childrensPrivacy") || (depth0 != null ? lookupProperty(depth0,"childrensPrivacy") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"childrensPrivacy","hash":{},"data":data,"loc":{"start":{"line":161,"column":11},"end":{"line":161,"column":31}}}) : helper)))
    + "</p>\n\n        <h2>Changes to This Policy</h2>\n        <p>"
    + alias4(((helper = (helper = lookupProperty(helpers,"policyChanges") || (depth0 != null ? lookupProperty(depth0,"policyChanges") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"policyChanges","hash":{},"data":data,"loc":{"start":{"line":164,"column":11},"end":{"line":164,"column":28}}}) : helper)))
    + "</p>\n\n        <div class=\"contact-info\">\n            <h2>Contact Us</h2>\n            <p>"
    + alias4(((helper = (helper = lookupProperty(helpers,"contactIntro") || (depth0 != null ? lookupProperty(depth0,"contactIntro") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"contactIntro","hash":{},"data":data,"loc":{"start":{"line":168,"column":15},"end":{"line":168,"column":31}}}) : helper)))
    + "</p>\n            <p><strong>Email:</strong> "
    + alias4(((helper = (helper = lookupProperty(helpers,"contactEmail") || (depth0 != null ? lookupProperty(depth0,"contactEmail") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"contactEmail","hash":{},"data":data,"loc":{"start":{"line":169,"column":39},"end":{"line":169,"column":55}}}) : helper)))
    + "<br>\n            <strong>Address:</strong> "
    + alias4(((helper = (helper = lookupProperty(helpers,"address") || (depth0 != null ? lookupProperty(depth0,"address") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"address","hash":{},"data":data,"loc":{"start":{"line":170,"column":38},"end":{"line":170,"column":49}}}) : helper)))
    + "</p>\n        </div>\n    </div>\n</body>\n</html>";
},"useData":true};