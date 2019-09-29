const https = require('https');

const TYPE = process.env.REPO && process.env.REPO.toUpperCase()==="GITHUB" ? "GITHUB" : "GITLAB";

const project = process.env.PROJECTID;
const owner = process.env.OWNER || "";
const author_email = process.env.AUTHOR || "lambda-bot@git.com";
const token = TYPE==="GITLAB" ? process.env.TOKEN : "token " + token;
const commit_message = process.env.COMMIT_MESSAGE || "new message";
const auth_header = TYPE==="GITLAB" ? "PRIVATE-TOKEN" : "Authorization";
const host = TYPE==="GITLAB" ? "gitlab.com" : "api.github.com";
const method = TYPE==="GITLAB" ? "POST" : "PUT";

let options = {
  'hostname': host,
  'port': 443,
  'method': method,
  'headers': {
    'Content-Type': 'application/json'
  }
};

exports.handler = async (event) => {

    let user = null;
    
    if(event.requestContext && event.requestContext.authorizer && event.requestContext.authorizer.user){
        user = JSON.parse(event.requestContext.authorizer.user);
    }
    
    if(!user){
       return { 
        "statusCode": 403,
        "message": "no user, no live",
        "headers" : {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin' : '*',
            'Access-Control-Allow-Credentials' : true,
            'Access-Control-Allow-Methods' : '*'
        }
       };
    }
    
    const body = JSON.parse(event.body);

    const _date = +new Date();

    let data = {
        "branch": "master", 
        "content": {"user": user, "date" : _date}
    };
    
    for(var f in body){data.content[f] = body[f]}    

    delete data.content.item;

    data.content = JSON.stringify(data.content);

    let file = "data/comments/"+body.item+"/"+user+"-"+_date+".json";

    options.headers[auth_header] = token;

    if(TYPE==="GITHUB"){
        options.headers["user-agent"] = "comment-bot";
        options.path = `/repos/${owner}/${project}/contents/${file}`;
        data.content = Buffer.from(data.content).toString("base64");
        data.message = commit_message;
    }else{
        options.path = `/api/v4/projects/${project}/repository/files/${encodeURIComponent(file)}`;
        data.author_email = author_email;
        data.author_name = "Comment bot"; 
        data.commit_message = commit_message;
    }
    
    let _response = {
        statusCode: 200,
        "headers" : {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin' : '*',
            'Access-Control-Allow-Credentials' : true,
            'Access-Control-Allow-Methods' : '*'
        }
    };
    
    return new Promise(function(resolve, reject) {
      
      const req = https.request(options, (res) => {
        res.on('data', (d) => {
          _response.body = d.toString();
          resolve(_response);
        });
        
      });
      
      req.on('error', (error) => {
        _response.statusCode = 500;
        _response.body = error;
        reject(_response);
      });
      
      req.write(JSON.stringify(data));
      req.end();
      
    });
};
