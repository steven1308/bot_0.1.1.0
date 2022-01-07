const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('騷擾用')

	.addUserOption(option =>
		option.setName('人選')
			.setDescription('選擇對象')
			.setRequired(true))

	.addIntegerOption(option =>
		option.setName('次數')
			.setDescription('請不要超過10次')
			.setRequired(true)
			.setMaxValue(10));

