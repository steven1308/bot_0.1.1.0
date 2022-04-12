const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = new SlashCommandBuilder()
	.setName('playnext')
	.setDescription('加入歌曲到第一首')
	.addStringOption(option =>
		option.setName('網址')
			.setDescription('輸入歌曲或歌單的網址'))
	
			.addStringOption(option =>
				option.setName('預設')
					.setDescription('選取清單名稱')
					.addChoice('歌單test', 'https://www.youtube.com/playlist?list=PLW2qsjqU0e5fzjM_O3PpuSa81F4Sb0K35')
					.addChoice('單首test', 'https://youtu.be/XnbxAaIJHfI')
					.addChoice('動畫歌曲', 'https://www.youtube.com/playlist?list=PLW2qsjqU0e5cjheTzIy7VeBfdsYSG1mIp')
					.addChoice('vtuber', 'https://www.youtube.com/playlist?list=PL0Q586E608sBIR_9Pl-UrYe1xBjKOasGz')
					.addChoice('A', 'https://www.youtube.com/playlist?list=PLW2qsjqU0e5csx4PiaSTJ7XA2mhd7Tqnc')
			)