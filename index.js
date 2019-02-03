const Discord = require("discord.js");
const { inspect } = require("util");
const vm = require("vm");
const codeContext =  {};
vm.createContext(codeContext);
const fetch =  require('node-fetch');
const qs = require('querystring');
const client = new Discord.Client();
const prefix = process.env.DISCORD_PREFIX;

client.on("ready", () => {
  console.log(`LOGGED IN AS : ${client.user.tag}`);
  client.user.setActivity(`eval`, {type:"STREAMING"});
});

client.on("message", async (message) => {

  if(!message.content.startsWith(prefix)) return;
  if (message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
	if(command === 'e' || command === 'eval') {

    const code = args.join(" ");
    if (!code) return;
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
        return message.channel.send(`\`\`\`js\n${output}\n\`\`\``);
      } else {
    	  return message.channel.send(`${output}`, {split:"\n", code:"js"});
      }
    } catch (error) {
      return message.channel.send(`The following error occured \`\`\`js\n${error}\`\`\``);
    }

    function clean(text)  {
    return text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));
    }

	} else if(command === 'help') {
		return message.channel.send(`=== HELP ===\n\n${prefix}eval\n${prefix}help\n${prefix}invite \n\n=== DISCLAIMER ===\nThis bot is an eval which runs any JavaScript code which is like users can even wreck your server mass dm or anything so use it at your own risk I'm not responsible if someone did a malicious code that destroys your server. For safety the invite link does not add any permissions to the bot it's up to you to give it permissions if you want but as I said at your own risk I'm not responsible for bad things happening in your server. KEEP IT NO PERMISSIONS FOR SAFETY, and those hackers reading this don't think of hacking me, the token is safe, and I'm using heroku which doesn't give access to my files and it's free host thing idc much`, {code: "asciidoc"});

	} else if(command === "invite") {
    return message.channel.send("By inviting me to your server you agree that I'm not responsible for any damage on your server for safety the URL doesn't grant the bot any permissions\nhttps://discordapp.com/api/oauth2/authorize?client_id=" + client.user.id + "&permissions=0&scope=bot");
    
	} else if (command === 'docs') {

		let project = 'main';
		let branch = ['stable', 'master', 'rpc', 'commando'].includes(args.slice(-1)[0]) ? args.pop() : 'stable';
		if (['rpc', 'commando'].includes(branch)) {
			project = branch;
			branch = 'master';
		}
		const queryString = qs.stringify({ q: args.join(' ') });
		const res = await fetch(`https://djsdocs.sorta.moe/${project}/${branch}/embed?${queryString}`);
		const embed = await res.json();
    if (!embed) return;
		await message.channel.send({ embed });
  }
	
});

client.login(process.env.TOKEN);
