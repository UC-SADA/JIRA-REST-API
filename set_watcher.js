//指定のフィルターされた課題にグループメンバーをウォッチャーとして割り当てる。

const JiraApi = require('jira-client');
const config = require('config');

const jql = "project = TP" ;　//任意のフィルターをJQLで指定。
const group_name = "test_project";　//任意のフィルターをJQLで指定。

//var watcher_id = [];
//var watcher_name = [];

//watcher.id = watcher_id
//watcher.name = watcher_name

// Setting
const jira = new JiraApi({
  protocol: config.protocol,
  host: config.host,
  username: config.username,
  password: config.password,
  apiVersion: config.apiVersion,
  strictSSL: config.strictSSL
})
// グループメンバーの抽出
function getUsersInGroup(groupName) {
  return new Promise((resolve, reject) => {
		var watcher =[];
		jira.getUsersInGroup(groupName) //getUsersInGroup(groupname: string, startAt: integer, maxResults: integer): *
		.then(function(issue){
		console.log("getUsersInGroup:")
			for (  var i = 0;  i < issue.users.items.length;  i++  ) {
				if(issue.users.items[i].accountType == "atlassian"){ 
				watcher.push({id:issue.users.items[i].accountId,name:issue.users.items[i].displayName});
				}
			}
			console.log(watcher)
			return resolve(watcher);
		})
		.catch(function(err) {
			console.error(err);
		});
  });
}

// 未ウォッチタスクの検索
function searchNotWatch(issueKey,user_id) {
  return new Promise((resolve, reject) => {
		var jql_notWatch = jql + " and (watcher is EMPTY OR watcher not in (" + user_id + ")) "
		jira.searchJira(jql_notWatch,{maxResults: 1000}) //searchJira(searchString: string, optional: object): 
		.then(function(issue){
			for (var i = 0;i < issue.issues.length; i++){
				issueKey[i] = issue.issues[i].key
				console.dir(issueKey[i])
			}
			return resolve(issueKey);
		})
  });
}

// ウォッチャー割り当て
function addWatcher(issueKey,user_id) {
  return new Promise((resolve, reject) => {
		jira.addWatcher(issueKey,user_id)
		.then(function(issue){
			console.dir(issueKey　+ "にウォッチャー割り当て")
			return resolve();
		})
  });
}
// main
async function main() {
	var watcher =[];
  console.log('start');
	watcher = await getUsersInGroup(group_name)
	console.log(watcher.length);
	for(var i = 0;i<watcher.length;i++){
		var issue_key = [];
		console.log(watcher[i].name+"さんの未ウォッチタスクは")
		issue_key = await searchNotWatch(issue_key,watcher[i].id);
		console.log(watcher[i].name+"さんにウォッチャー割り当て実行")
		for(var j =0;j<issue_key.length;j++){
			await addWatcher(issue_key[j],watcher[i].id)
		}
		
	}	
  console.log('done');
}

main();