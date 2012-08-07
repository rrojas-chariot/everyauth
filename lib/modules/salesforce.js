var oauthModule = require('./oauth2')
 , https = require('https');

var salesforce = module.exports =
oauthModule.submodule('salesforce')
  .configurable({
      scope: 'specify types of access: (no scope), user, public_repo, repo, gist'
      
  })

  .oauthHost('https://login.salesforce.com')
  .apiHost('https://na9.salesforce.com')

  .authPath('/services/oauth2/authorize')
  
  .entryPath('/auth/salesforce')
  .callbackPath('/auth/salesforce/callback')
  .authQueryParam('response_type', 'code')

  .accessTokenPath('/services/oauth2/token')
  .accessTokenHttpMethod('post')
  .accessTokenParam('grant_type','authorization_code')
  .accessTokenParam('format', 'json')

  .authQueryParam('scope', function () {
    return this._scope && this.scope();
  })

  .fetchOAuthUser( function (accessToken) {
	
		var p = this.Promise();
		var data ='';
		//parse the url
		var url = (require('url').parse(this.apiHost()));
		var options = {
			host: url['host'],
			port: 443,
			path: '/services/data/v22.0/query?q='+escape('SELECT id, username, firstname, lastname, email from User limit 1'),
			method: 'GET',
			headers: {
				'Host': url['host'],
				'Authorization': 'OAuth '+ accessToken,
				'Accept':'application/jsonrequest',
				'Cache-Control':'no-cache,no-store,must-revalidate',
				'Content-type':'application/json; charset=UTF-8'
			}	
		}
	
		var req = https.request(options, function(res) {
		  res.setEncoding('utf8');
	  
			res.on('data', function (chunk) {
				data+=chunk;
		  });
		
			res.on('end', function(d) {
				 console.log('Data: '+ data);
				 var oauthUser = JSON.parse(data);
			     p.fulfill(oauthUser);
			});
		}).on('error', function(e) {
			console.log('Error: '+ e);
			return p.fail(e);
		});
	
		//console.log(req);
		req.end();
		return p;
	
  })
  
  .convertErr( function (err) {
	console.log(JSON.stringify(err));
    return new Error(err.data);
  });

