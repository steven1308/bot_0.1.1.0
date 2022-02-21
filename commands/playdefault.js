const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = new SlashCommandBuilder()
	.setName('playdefault')
	.setDescription('選取撥放清單')
	.addStringOption(option => option
		.setName('網址')
		.setDescription('選取清單名稱')
		.setRequired(true)
		.addChoice('test','https://www.youtube.com/playlist?list=PLW2qsjqU0e5fzjM_O3PpuSa81F4Sb0K35')
		.addChoice('動畫歌曲','https://www.youtube.com/playlist?list=PLW2qsjqU0e5cjheTzIy7VeBfdsYSG1mIp')
		.addChoice('動畫歌曲','https://www.youtube.com/playlist?list=PLW2qsjqU0e5csx4PiaSTJ7XA2mhd7Tqnc')
		);
	