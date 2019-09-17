const Discord = require('discord.js');
const client = new Discord.Client();
const { inspect } = require('util');

client.on('ready', () => {
	console.log(`LOGGED IN AS : ${client.user.tag}`);
	client.user.setActivity('eval', { type: 'STREAMING' });
});

function clean(text) {
	return text
		.replace(/`/g, `\`${String.fromCharCode(8203)}`)
		.replace(/@/g, `@${String.fromCharCode(8203)}`);
}

client.on('message', async message => {
	const prefix = process.env.DISCORD_PREFIX;
	if (!message.content.startsWith(prefix)) return;
	if (message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	if (command === 'e' || command === 'eval') {
		const code = args.join(' ');
		if (!code) return;
		const token = client.token.split('').join('[^]{0,2}');
		const rev = client.token.split('').reverse().join('[^]{0,2}');
		const filter = new RegExp(`${token}|${rev}`, 'g');

		try {
			let output = eval(code); // eslint-disable-line
			if (output instanceof Promise || (Boolean(output) && typeof output.then === 'function' && typeof output.catch === 'function')) output = await output;

			output = inspect(output, { depth: 0, maxArrayLength: null });
			output = output.replace(filter, '[TOKEN]');
			output = clean(output);

			if (output.length < 1950) {
				return message.channel.send(`\`\`\`js\n${output}\n\`\`\``);
			}
			return message.channel.send(`${output}`, { split: '\n', code: 'js' });
		} catch (error) {
			return message.channel.send(`The following error occured \`\`\`js\n${error}\`\`\``);
		}
	} else if (command === 'invite') {
		return message.channel.send([
			'By inviting me to your server you agree that I\'m not responsible for any damage on your server!',
			'For safety the URL doesn\'t grant the bot any permissions!',
			`<https://discordapp.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=0&scope=bot>`
		]);
	}
});

client.login(process.env.TOKEN);
