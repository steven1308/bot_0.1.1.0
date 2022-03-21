const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = new SlashCommandBuilder()
	.setName('pause')
	.setDescription('暫停音樂,取消暫停,再次輸入pause或play');

	