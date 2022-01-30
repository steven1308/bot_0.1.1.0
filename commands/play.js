const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = new SlashCommandBuilder()
	.setName('play')
	.setDescription('撥放音樂')
	.addStringOption(option => option
		.setName('網址')
		.setDescription('輸入歌曲或歌單的網址')
		.setRequired(true));