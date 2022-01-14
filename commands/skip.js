const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = new SlashCommandBuilder()
	.setName('skip')
	.setDescription('跳過歌曲')

	.addStringOption(option =>
		option.setName('數量或人')
			.setDescription('選擇對象')
			.setRequired(false))
