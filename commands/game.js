const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = new SlashCommandBuilder()
	.setName('game')
	.setDescription('猜數字1~100')

	
	.addIntegerOption(option =>
		option.setName('數字')
			.setDescription('輸入數字')
			.setRequired(true)
			);

