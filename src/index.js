const Discord = require('discord.js');
const client = new Discord.Client();
const { inspect } = require('util');

client.on('ready', () => {
	console.log(`[READY] ${client.user.tag}`);
	client.user.setActivity('eval', { type: 'STREAMING' });
});

function clean(text) {
	return text
		.replace(/`/g, `\`${String.fromCharCode(8203)}`)
		.replace(/@/g, `@${String.fromCharCode(8203)}`);
}

client.on('message', async message => {
	const prefix = process.env.PREFIX;
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
			output = output.replace(filter, '--🙄--');
			output = clean(output);

			if (output.length < 1950) {
				return message.channel.send(`\`\`\`js\n${output}\n\`\`\``);
			}
			return message.channel.send(`${output}`, { split: '\n', code: 'js' });
		} catch (error) {
			return message.channel.send(`The following error occured \`\`\`js\n${error}\`\`\``);
		}
	} else if (command === 'invite') {
		const qs = require('querystring');
		const query = qs.stringify({
			client_id: client.user.id,
			permissions: 0,
			scope: 'bot'
		});
		const embed = new Discord.MessageEmbed()
			.setAuthor(client.user.username, client.user.displayAvatarURL())
			.setColor(0xf30c11)
			.setDescription([
				'By inviting me to your guild you agree that I\'m not responsible for any damage on your guild.',
				'For safety the URL doesn\'t grant the bot any permissions.',
				'',
				`[Invite Me](https://discordapp.com/api/oauth2/authorize?${query})`
			]);
		return message.channel.send({ embed });
	}
});

client.login(process.env.TOKEN);
