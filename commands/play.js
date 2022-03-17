const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = new SlashCommandBuilder()
	.setName('play')
	.setDescription('撥放音樂')
	.addStringOption(option =>
		option.setName('網址')
			.setDescription('輸入歌曲或歌單的網址'))
	.addStringOption(option =>
		option.setName('預設')
			.setDescription('選取清單名稱')
			.addChoice('test', 'https://www.youtube.com/playlist?list=PLW2qsjqU0e5fzjM_O3PpuSa81F4Sb0K35')
			.addChoice('動畫歌曲', 'https://www.youtube.com/playlist?list=PLW2qsjqU0e5cjheTzIy7VeBfdsYSG1mIp')
			.addChoice('A', 'https://www.youtube.com/playlist?list=PLW2qsjqU0e5csx4PiaSTJ7XA2mhd7Tqnc')
	);