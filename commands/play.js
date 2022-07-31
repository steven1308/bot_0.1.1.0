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
			.addChoices(
				{ name: '歌單test', value: 'https://www.youtube.com/playlist?list=PLW2qsjqU0e5fzjM_O3PpuSa81F4Sb0K35' },
				{ name: '單首test', value: 'https://youtu.be/XnbxAaIJHfI' },
				{ name: '動畫歌曲', value: 'https://www.youtube.com/playlist?list=PLW2qsjqU0e5cjheTzIy7VeBfdsYSG1mIp' },
				{ name: 'vtuber', value: 'https://www.youtube.com/playlist?list=PL0Q586E608sBIR_9Pl-UrYe1xBjKOasGz' },
				{ name: 'A', value: 'https://www.youtube.com/playlist?list=PLW2qsjqU0e5csx4PiaSTJ7XA2mhd7Tqnc' },
			));
	