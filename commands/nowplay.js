const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = new SlashCommandBuilder()
	.setName('nowplay')
	.setDescription('查詢現在播放的歌曲');

	
