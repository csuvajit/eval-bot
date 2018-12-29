const Discord = require("discord.js");
const { inspect } = require("util");
const vm = require("vm");
const codeContext =  {};
vm.createContext(codeContext);
const client = new Discord.Client();
const prefix = "E" || process.env.DISCORD_PREFIX;

client.on("ready", () => {
  console.log("Bot is online!");
  client.user.setActivity(`eval`, {type:"STREAMING"});
});

client.on("message", async(message) => {
	if(!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	if(command === 'val') {
		 const code = args.join(" ");
  const token = client.token.split("").join("[^]{0,2}");
  const rev = client.token.split("").reverse().join("[^]{0,2}");
  const filter = new RegExp(`${token}|${rev}`, "g");
  try {
    let output = eval(code);
    if (output instanceof Promise || (Boolean(output) && typeof output.then === "function" && typeof output.catch === "function")) output = await output;
    output = inspect(output, { depth: 0, maxArrayLength: null });
    output = output.replace(filter, "[TOKEN]");
    output = clean(output);
    if (output.length < 1950) {
      message.channel.send(`\`\`\`js\n${output}\n\`\`\``);
    } else {
    	  message.channel.send(`${output}`, {split:"\n", code:"js"});
    }
  } catch (error) {
    message.channel.send(`The following error occured \`\`\`js\n${error}\`\`\``);
  }

  function clean(text)  {
    return text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));
   }
	} else if(command === 'help') {
		message.channel.send(`== Help ==
All commands:

eval :: evalute js code
help :: shows this page
invite :: to invite this bot

Disclaimer:
This bot is an eval which runs any JavaScript code which is like users can even wreck your server mass dm or anything so use it at your own risk I'm not responsible if someone did a malicious code that destroys your server- For safety the invite link does not add any permissions to the bot it's up to you to give it permissions if you want but as I said at your own risk I'm not responsible for bad things happening in your server. KEEP IT NO PERMISSIONS FOR SAFETY, and those hackers reading this don't think of hacking me, the token is safe, and I'm using heroku which doesn't give access to my files and it's free host thing idc much.`, {code: "asciidoc"});
	} else if(command === "invite") {
		message.channel.send("By inviting me to your server you agree that I'm not responsible for any damage on your server for safety the URL doesn't grant the bot any permissions\nhttps://discordapp.com/api/oauth2/authorize?client_id=" + client.user.id + "&permissions=0&scope=bot")
	} else if(command === "beval") {
    try {
  let evaled = vm.runInContext(args.join(" "), codeContext);
  message.channel.send(evaled, {code:"js",split:"\n"});
} catch(e) {
 message.channel.send(e, {code:"js",split:"\n"});
}
}
	
});

client.login(process.env.TOKEN);
