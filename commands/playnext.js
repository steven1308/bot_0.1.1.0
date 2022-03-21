const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = new SlashCommandBuilder()
	.setName('playnext')
	.setDescription('加入歌曲到第一首')
	.addStringOption(option =>
		option.setName('網址')
			.setDescription('輸入歌曲或歌單的網址'))
	
	