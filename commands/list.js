const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = new SlashCommandBuilder()
	.setName('list')
	.setDescription('音樂清單')
	.addIntegerOption(option =>
		option.setName('頁數')
		.setDescription('預設是第一頁'));